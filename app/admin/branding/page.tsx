"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { ImageIcon, Save, Instagram, Globe, Phone, CheckCircle2, Type, Palette, Maximize } from "lucide-react";
import { getBrandSettings, saveBrandSettings } from "@/lib/store";
import { BrandSettings } from "@/lib/types";

export default function BrandingPage() {
    const [settings, setSettings] = useState<BrandSettings>({
        logoMode: "contain",
        brandColor: "#FF4D00",
        instagramLink: "",
        websiteLink: "",
        phoneNumber: "",
        footerText: "© 2024 YouthCamping. All rights reserved.",
        updatedAt: new Date().toISOString()
    });
    const [loading, setLoading] = useState(true);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const load = async () => {
            const data = await getBrandSettings();
            if (data) {
                setSettings(data);
            }
            setLoading(false);
        };
        load();
    }, []);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSettings({ ...settings, companyLogo: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        await saveBrandSettings({
            ...settings,
            updatedAt: new Date().toISOString()
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    if (loading) return null;

    return (
        <div className="max-w-4xl space-y-12 pb-20">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Company Branding</h2>
                <p className="text-gray-500 font-medium">Set your global brand assets once, and they will apply to every quotation.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="md:col-span-1 space-y-6">
                    <Label className="text-sm font-black uppercase tracking-widest text-gray-400">Company Logo</Label>
                    <label className="group relative aspect-square rounded-[2.5rem] flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-all overflow-hidden bg-white shadow-2xl shadow-gray-200/50">
                        {settings.companyLogo ? (
                            <img
                                src={settings.companyLogo}
                                className={`w-full h-full p-4 transition-all ${settings.logoMode === 'fill' ? 'object-fill' :
                                    settings.logoMode === 'cover' ? 'object-cover' :
                                        'object-contain'
                                    }`}
                                alt="Company Logo"
                            />
                        ) : (
                            <div className="text-gray-300 group-hover:text-primary transition-colors flex flex-col items-center gap-3">
                                <ImageIcon size={40} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Select PNG</span>
                            </div>
                        )}
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                    <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                        Recommended: Transparent PNG, horizontal layout. Max height 60px in quotation.
                    </p>

                    <div className="pt-6 space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Logo Display Mode</Label>
                        <div className="grid grid-cols-1 gap-2">
                            {[
                                { id: 'contain', label: 'Contain (Recommended)', desc: 'Keeps aspect ratio, no stretch.' },
                                { id: 'fill', label: 'Stretch (Full Fill)', desc: 'Stretches logo to fill the header.' },
                                { id: 'cover', label: 'Cover (Maintain Ratio)', desc: 'Fills space, may crop parts.' }
                            ].map((mode) => (
                                <button
                                    key={mode.id}
                                    onClick={() => setSettings({ ...settings, logoMode: mode.id as any })}
                                    className={`flex flex-col text-left p-4 rounded-2xl border-2 transition-all ${settings.logoMode === mode.id ? 'border-primary bg-primary/5 ring-4 ring-primary/5' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                                >
                                    <span className={`text-xs font-black uppercase tracking-tight ${settings.logoMode === mode.id ? 'text-primary' : 'text-gray-900'}`}>{mode.label}</span>
                                    <span className="text-[10px] text-gray-400 font-medium">{mode.desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2 space-y-10">
                    <GlassCard className="p-10 space-y-8 bg-white border-none shadow-xl">
                        <div className="space-y-6">
                            <Label className="text-sm font-black uppercase tracking-widest text-gray-400">Social & Contact Links</Label>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-gray-500">Instagram Profile Link</Label>
                                    <div className="relative">
                                        <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                                        <Input
                                            className="pl-12 h-14 rounded-2xl border-gray-100"
                                            placeholder="https://instagram.com/username"
                                            value={settings.instagramLink}
                                            onChange={(e) => setSettings({ ...settings, instagramLink: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-gray-500">Website URL</Label>
                                    <div className="relative">
                                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                                        <Input
                                            className="pl-12 h-14 rounded-2xl border-gray-100"
                                            placeholder="https://yourwebsite.com"
                                            value={settings.websiteLink}
                                            onChange={(e) => setSettings({ ...settings, websiteLink: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-gray-500">Official Call/Phone Number</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                                        <Input
                                            className="pl-12 h-14 rounded-2xl border-gray-100"
                                            placeholder="+91 98765 43210"
                                            value={settings.phoneNumber}
                                            onChange={(e) => setSettings({ ...settings, phoneNumber: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-gray-500">Brand Primary Color</Label>
                                        <div className="relative">
                                            <Palette className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                                            <Input
                                                className="pl-12 h-14 rounded-2xl border-gray-100 font-mono"
                                                placeholder="#FF4D00"
                                                value={settings.brandColor}
                                                onChange={(e) => setSettings({ ...settings, brandColor: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-gray-500">Footer Attribution Text</Label>
                                        <div className="relative">
                                            <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                                            <Input
                                                className="pl-12 h-14 rounded-2xl border-gray-100"
                                                placeholder="© 2024 YouthCamping"
                                                value={settings.footerText}
                                                onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                            <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">
                                Last Updated: {new Date(settings.updatedAt).toLocaleDateString()}
                            </p>
                            <Button
                                onClick={handleSave}
                                className={`rounded-[1.2rem] px-8 py-6 shadow-2xl transition-all ${saved ? 'bg-green-500 hover:bg-green-600' : 'shadow-primary/30'}`}
                            >
                                {saved ? (
                                    <>
                                        <CheckCircle2 size={18} className="mr-2" /> Branding Applied
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} className="mr-2" /> Save Branding
                                    </>
                                )}
                            </Button>
                        </div>
                    </GlassCard>

                    <div className="bg-primary/5 p-8 rounded-[2.5rem] border border-primary/10">
                        <h4 className="font-black text-primary uppercase text-[10px] tracking-widest mb-3">Live Preview Hint</h4>
                        <p className="text-xs text-primary/70 font-medium leading-relaxed">
                            These settings will immediately reflect in the header and footer of all your existing and future luxury proposals. No more manual link entry!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
