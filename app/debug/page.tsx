"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/db";

export default function DebugPage() {
    const [status, setStatus] = useState<any>({});

    useEffect(() => {
        const check = async () => {
            try {
                const qData = await db.getAll();
                const bData = await db.get('global_brand');

                setStatus({
                    database: "Neon (via API)",
                    quotations: { success: true, count: qData?.length || 0 },
                    brand_settings: { success: true, exists: !!bData }
                });
            } catch (err: any) {
                setStatus({
                    error: err.message || 'Unknown API/DB error',
                    tip: "Check if DATABASE_URL is set and /api/db route is working."
                });
            }
        };
        check();
    }, []);

    return (
        <div className="p-10 font-mono text-sm">
            <h1 className="text-2xl font-bold mb-4">Detailed Debug DB</h1>
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-[80vh]">
                {JSON.stringify(status, null, 2)}
            </pre>
        </div>
    );
}
