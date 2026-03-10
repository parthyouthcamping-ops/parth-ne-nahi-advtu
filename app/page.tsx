"use client";

import Link from "next/link";
import { useBrandSettings } from "@/hooks/useBrandSettings";

export default function Home() {
    const { brand } = useBrandSettings();

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-white text-center">
            <div className="z-10 max-w-5xl w-full items-center justify-between font-montserrat text-sm flex flex-col gap-10">
                {brand?.companyLogo ? (
                    <img src={brand.companyLogo} className="h-20 w-auto object-contain mb-4" alt="Company Logo" />
                ) : (
                    <h1 className="text-7xl font-black text-primary tracking-tighter">
                        YouthCamping
                    </h1>
                )}

                <p className="text-2xl font-black text-gray-400 uppercase tracking-[0.4em]">
                    One Trip at a Time
                </p>

                <div className="flex gap-6 mt-12">
                    <Link
                        href="/admin"
                        className="px-12 py-5 bg-primary text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-2xl shadow-primary/30 hover:bg-primary-deep transition-all transform hover:-translate-y-1"
                    >
                        Admin Dashboard
                    </Link>
                    <button className="px-12 py-5 bg-white border-2 border-primary text-primary font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-primary/5 transition-all transform hover:-translate-y-1">
                        Learn More
                    </button>
                </div>
            </div>
        </main>
    );
}
