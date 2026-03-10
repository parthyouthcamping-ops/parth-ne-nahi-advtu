export class YouthDB {
    private async callApi(action: string, body: any = {}) {
        const response = await fetch('/api/db', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, ...body })
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'API call failed');
        }
        return response.json();
    }

    async set(value: any): Promise<void> {
        if (value.id === "global_brand") {
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
