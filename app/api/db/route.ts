import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

/** Ensure a value is safe to store in Neon JSONB (no File objects / non-serialisable values). */
function sanitizePayload(data: any): any {
    if (!data || typeof data !== 'object') return data;
    return JSON.parse(JSON.stringify(data, (_key, value) => {
        // Drop File objects, Blob, undefined — anything not JSON-serialisable
        if (value instanceof File || value instanceof Blob) return undefined;
        if (typeof value === 'undefined') return null;
        return value;
    }));
}

const isUrl = (v: unknown): v is string =>
    typeof v === 'string' && (v.startsWith('http://') || v.startsWith('https://'));

function scrubImageFields(data: any): any {
    if (!data || typeof data !== 'object') return data;

    const scrubHotels = (hotels: any[]) =>
        (hotels || []).map((h: any) => ({
            ...h,
            photos: (h.photos || []).filter(isUrl)
        }));

    return {
        ...data,
        heroImage:        isUrl(data.heroImage)        ? data.heroImage        : null,
        coverImage:       isUrl(data.coverImage)       ? data.coverImage       : null,
        routeMap:         isUrl(data.routeMap)         ? data.routeMap         : null,
        experiencePhotos: (data.experiencePhotos || []).filter(isUrl),
        hotels:           scrubHotels(data.hotels),
        lowLevelHotels:   scrubHotels(data.lowLevelHotels),
        highLevelHotels:  scrubHotels(data.highLevelHotels),
        itinerary: (data.itinerary || []).map((day: any) => ({
            ...day,
            photos: (day.photos || []).filter(isUrl)
        })),
        expert: data.expert ? {
            ...data.expert,
            photo: isUrl(data.expert.photo) ? data.expert.photo : null
        } : data.expert,
        customSections: (data.customSections || []).map((s: any) => ({
            ...s,
            image: isUrl(s.image) ? s.image : null
        }))
    };
}

export async function POST(request: Request) {
    if (!process.env.DATABASE_URL) {
        return NextResponse.json(
            { error: 'DATABASE_URL is not set in .env.local.' },
            { status: 500 }
        );
    }
    const sql = neon(process.env.DATABASE_URL);
    let requestData: any = {};

    try {
        requestData = await request.json();
        const { action, id, slug, data } = requestData;

        if (action === 'set') {
            // Scrub image fields, then sanitize to pure JSON before handing to Neon
            const cleanData = sanitizePayload(id === 'global_brand' ? data : scrubImageFields(data));

            console.log('[DB API] Saving payload for id:', id, '— keys:', Object.keys(cleanData || {}));

            // Stringify explicitly so Neon receives a valid JSONB string
            const jsonString = JSON.stringify(cleanData);

            if (id === 'global_brand') {
                await sql`
                    INSERT INTO brand_settings (id, data, updated_at)
                    VALUES ('global_brand', ${jsonString}::jsonb, ${new Date().toISOString()})
                    ON CONFLICT (id) DO UPDATE
                    SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at
                `;
            } else {
                const createdAt = cleanData?.createdAt || new Date().toISOString();
                await sql`
                    INSERT INTO quotations (id, slug, data, updated_at, created_at)
                    VALUES (${id}, ${slug}, ${jsonString}::jsonb, ${new Date().toISOString()}, ${createdAt})
                    ON CONFLICT (id) DO UPDATE
                    SET slug = EXCLUDED.slug, data = EXCLUDED.data, updated_at = EXCLUDED.updated_at
                `;
            }
            return NextResponse.json({ success: true });
        }

        if (action === 'get') {
            const result = id === 'global_brand'
                ? await sql`SELECT data FROM brand_settings WHERE id = ${id}`
                : await sql`SELECT data FROM quotations WHERE id = ${id}`;
            return NextResponse.json(result[0]?.data || null);
        }

        if (action === 'getAll') {
            const result = await sql`SELECT data FROM quotations ORDER BY updated_at DESC`;
            return NextResponse.json(result.map((r: any) => r.data));
        }

        if (action === 'delete') {
            await sql`DELETE FROM quotations WHERE id = ${id}`;
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error: any) {
        console.error('[DB API] DATABASE ERROR:', {
            action: requestData?.action,
            id: requestData?.id,
            error: error.message,
            detail: error.detail,
            stack: error.stack,
        });

        if (error.constraint === 'quotations_slug_key') {
            return NextResponse.json({
                error: `The slug '${requestData.slug}' is already taken. Please try again.`,
                code: 'DUPLICATE_SLUG'
            }, { status: 400 });
        }

        return NextResponse.json({
            error: 'Database operation failed',
            message: error.message
        }, { status: 500 });
    }
}
