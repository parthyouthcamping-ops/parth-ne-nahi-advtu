import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function POST(request: Request) {
    if (!process.env.DATABASE_URL) {
        return NextResponse.json({ error: 'DATABASE_URL is not set in .env.local. Please set it to connect to Neon Database.' }, { status: 500 });
    }
    const sql = neon(process.env.DATABASE_URL);
    let requestData: any = {};
    try {
        requestData = await request.json();
        const { action, id, slug, data } = requestData;

        if (action === 'set') {
            if (id === 'global_brand') {
                await sql`
          INSERT INTO brand_settings (id, data, updated_at)
          VALUES ('global_brand', ${data}, ${new Date().toISOString()})
          ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at
        `;
            } else {
                await sql`
          INSERT INTO quotations (id, slug, data, updated_at, created_at)
          VALUES (${id}, ${slug}, ${data}, ${new Date().toISOString()}, ${data.createdAt || new Date().toISOString()})
          ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, data = EXCLUDED.data, updated_at = EXCLUDED.updated_at
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
            return NextResponse.json(result.map(r => r.data));
        }

        if (action === 'delete') {
            await sql`DELETE FROM quotations WHERE id = ${id}`;
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error: any) {
        console.error('Database API error details:', {
            message: error.message,
            code: error.code,
            detail: error.detail,
            constraint: error.constraint
        });

        if (error.constraint === 'quotations_slug_key') {
            return NextResponse.json({
                error: `The slug '${requestData.slug}' is already taken by another quotation. Please use a unique slug.`,
                code: 'DUPLICATE_SLUG'
            }, { status: 400 });
        }

        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
