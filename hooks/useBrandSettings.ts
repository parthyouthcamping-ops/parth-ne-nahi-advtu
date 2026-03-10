import { useState, useEffect } from "react";
import { getBrandSettings } from "@/lib/store";
import { BrandSettings } from "@/lib/types";

export function useBrandSettings() {
    const [brand, setBrand] = useState<BrandSettings | null>(null);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        const data = await getBrandSettings();
        setBrand(data);
        setLoading(false);
    };

    useEffect(() => {
        load();

        // Listen for updates
        const handler = () => {
            load();
        };
        window.addEventListener("brandSettingsUpdated", handler);
        return () => window.removeEventListener("brandSettingsUpdated", handler);
    }, []);

    return { brand, loading, refresh: load };
}
