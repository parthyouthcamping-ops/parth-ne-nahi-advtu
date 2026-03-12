const isUrl = (v: unknown): v is string =>
    typeof v === 'string' && v.startsWith('https://');

function scrubHotels(hotels: any[]): any[] {
    return (hotels || []).map((h: any) => ({
        ...h,
        photos: (h.photos || []).filter(isUrl)
    }));
}

/**
 * Strip every image field down to Cloudinary URLs only.
 * Removes File objects, blob URLs, base64 data and undefined values before
 * the payload is serialised and sent to /api/db.
 */
function sanitisePayload(data: any): any {
    if (!data || typeof data !== 'object') return data;

    const clean = {
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

    // Final pass: JSON round-trip drops any non-serialisable values (File, Blob, undefined)
    return JSON.parse(JSON.stringify(clean, (_k, v) => {
        if (v instanceof File || v instanceof Blob) return null;
        if (typeof v === 'undefined') return null;
        return v;
    }));
}

const MAX_PAYLOAD_BYTES = 3 * 1024 * 1024; // 3 MB hard limit (Vercel limit is 4.5 MB)

export class YouthDB {
    private async callApi(action: string, body: any = {}) {
        // Sanitise the data field if present
        const sanitisedBody = body.data && body.id !== 'global_brand'
            ? { ...body, data: sanitisePayload(body.data) }
            : body;

        const payload = JSON.stringify({ action, ...sanitisedBody });

        // Log payload size so you can see it in the browser console
        console.log(`[DB] Payload size for action="${action}": ${(payload.length / 1024).toFixed(1)} KB`);

        if (payload.length > MAX_PAYLOAD_BYTES) {
            throw new Error(
                `Payload too large: ${(payload.length / 1024).toFixed(0)} KB. ` +
                `Ensure all images are Cloudinary URLs (max ~3 MB total).`
            );
        }

        const response = await fetch('/api/db', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'API call failed');
        }
        return response.json();
    }

    async set(value: any): Promise<void> {
        if (value.id === 'global_brand') {
            await this.callApi('set', { id: 'global_brand', data: value });
        } else {
            await this.callApi('set', {
                id: value.id,
                slug: value.slug,
                data: value
            });
        }
    }

    async get(id: string): Promise<any> {
        return await this.callApi('get', { id });
    }

    async getAll(): Promise<any[]> {
        return await this.callApi('getAll');
    }

    async delete(id: string): Promise<void> {
        await this.callApi('delete', { id });
    }
}

export const db = new YouthDB();
