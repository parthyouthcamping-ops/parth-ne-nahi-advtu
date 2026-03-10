import { Quotation, BrandSettings } from "./types";
import { db } from "./db";

const STORAGE_KEY = "youthcamping_quotations_v3";

export const getQuotations = async (): Promise<Quotation[]> => {
    if (typeof window === "undefined") return [];

    // Check for migration
    const legacyData = localStorage.getItem(STORAGE_KEY);
    if (legacyData) {
        try {
            const parsed = JSON.parse(legacyData);
            if (Array.isArray(parsed)) {
                for (const q of parsed) {
                    await db.set(q);
                }
            }
            localStorage.removeItem(STORAGE_KEY);
        } catch (e) {
            console.error("Migration failed", e);
        }
    }

    const all = await db.getAll();
    return all;
};

export const saveQuotation = async (quotation: Quotation) => {
    const updated = {
        ...quotation,
        updatedAt: new Date().toISOString(),
        createdAt: quotation.createdAt || new Date().toISOString()
    };
    await db.set(updated);
};

export const deleteQuotation = async (id: string) => {
    await db.delete(id);
};

export const getQuotationBySlug = async (slug: string): Promise<Quotation | undefined> => {
    const all = await getQuotations();
    return all.find((q) => q.slug === slug);
};

export const getQuotationById = async (id: string): Promise<Quotation | undefined> => {
    return await db.get(id);
};

export const generateSlug = (destination: string, id: string) => {
    const cleanDest = destination.toLowerCase().replace(/[^a-z0-9]/g, "-");
    return `${cleanDest}-luxury-${id.substring(0, 5)}`;
};

export const getBrandSettings = async (): Promise<BrandSettings | null> => {
    if (typeof window === "undefined") return null;
    return await db.get("global_brand");
};

export const saveBrandSettings = async (settings: BrandSettings) => {
    await db.set({ ...settings, id: "global_brand" });
    if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("brandSettingsUpdated"));
    }
};
