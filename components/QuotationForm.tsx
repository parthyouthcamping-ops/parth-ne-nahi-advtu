"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import {
    ArrowLeft,
    Save,
    Plus,
    Trash2,
    Image as ImageIcon,
    ChevronRight,
    ChevronLeft,
    Hotel as HotelIcon,
    Calendar,
    Users,
    GripVertical,
    Eye,
    EyeOff,
    FileText,
    Layers,
    Edit,
    MessageCircle as WhatsAppIcon
} from "lucide-react";
import { useBrandSettings } from "@/hooks/useBrandSettings";
import { Quotation, Hotel, DayItinerary, CustomSection } from "@/lib/types";
import { saveQuotation, generateSlug } from "@/lib/store";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { toast } from "sonner";

interface QuotationFormProps {
    initialData?: Quotation;
    isEdit?: boolean;
}

export default function QuotationForm({ initialData, isEdit = false }: QuotationFormProps) {
    const router = useRouter();
    const { brand } = useBrandSettings();
    const [step, setStep] = useState(1);
    const [isSaving, setIsSaving] = useState(false);
    const totalSteps = 6;

    const [formData, setFormData] = useState<Partial<Quotation>>({
        id: uuidv4(),
        status: "Draft",
        pax: 2,
        lowLevelPrice: 24999,
        highLevelPrice: 44999,
        travelDates: { from: "", to: "" },
        duration: "",
        transportOption: "Private Car",
        roomSharing: "Double",
        hotels: [],
        lowLevelHotels: [],
        highLevelHotels: [],
        itinerary: [],
        customSections: [],
        experiencePhotos: [],
        includes: ["Hotel Stay", "All Transfers", "Sightseeing", "Breakfast & Dinner"],
        exclusions: ["Airfare", "Visa Fees", "Personal Expenses", "Travel Insurance"],
        expert: { name: "", whatsapp: "" },
        ...initialData
    });


    useEffect(() => {
        if (formData.travelDates?.from && formData.travelDates?.to) {
            const start = new Date(formData.travelDates.from);
            const end = new Date(formData.travelDates.to);
            const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
            if (diff > 0) {
                setFormData(prev => ({ ...prev, duration: `${diff} Nights / ${diff + 1} Days` }));
            } else {
                setFormData(prev => ({ ...prev, duration: "" }));
            }
        } else {
            setFormData(prev => ({ ...prev, duration: "" }));
        }
    }, [formData.travelDates?.from, formData.travelDates?.to]);

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    const nextStep = () => setStep(s => Math.min(s + 1, totalSteps));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const handleWhatsAppShare = () => {
        if (!formData.clientName) return;

        const customerName = formData.clientName;
        const companyName = brand?.companyName || "YouthCamping";
        const quotationLink = `${window.location.origin}/quote/${formData.slug}`;
        const salesPersonName = formData.expert?.name || "Your Travel Expert";
        const designation = formData.expert?.designation || "Destination Expert";

        const message = `Hi ${customerName},

Greetings from ${companyName}.

As per our recent conversation, we've prepared a customized quotation for you based on your requirements.

You can view the quotation by clicking on the following link:
${quotationLink}

${salesPersonName}
${designation}`;

        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const finalData: Quotation = {
                ...formData as Quotation,
                slug: formData.slug || generateSlug(formData.destination || "trip", formData.clientName || "quote"),
                updatedAt: new Date().toISOString()
            };
            await saveQuotation(finalData);
            toast.success("Proposal saved successfully!");
            router.push("/admin");
        } catch (error) {
            console.error(error);
            toast.error("Failed to save proposal. Please check your connection.");
        } finally {
            setIsSaving(false);
        }
    };


    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: string, isList = false, index?: number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const b64 = reader.result as string;
            if (index !== undefined) {
                if (field === 'hotels') {
                    const newHotels = [...(formData.hotels || [])];
                    newHotels[index] = { ...newHotels[index], photos: [...(newHotels[index].photos || []), b64] };
                    setFormData({ ...formData, hotels: newHotels });
                } else if (field === 'lowLevelHotels') {
                    const newHotels = [...(formData.lowLevelHotels || [])];
                    newHotels[index] = { ...newHotels[index], photos: [...(newHotels[index].photos || []), b64] };
                    setFormData({ ...formData, lowLevelHotels: newHotels });
                } else if (field === 'highLevelHotels') {
                    const newHotels = [...(formData.highLevelHotels || [])];
                    newHotels[index] = { ...newHotels[index], photos: [...(newHotels[index].photos || []), b64] };
                    setFormData({ ...formData, highLevelHotels: newHotels });
                } else if (field === 'itinerary') {
                    const newItin = [...(formData.itinerary || [])];
                    newItin[index] = { ...newItin[index], photos: [...(newItin[index].photos || []), b64] };
                    setFormData({ ...formData, itinerary: newItin });
                } else if (field === 'customSections') {
                    const newSections = [...(formData.customSections || [])];
                    newSections[index] = { ...newSections[index], image: b64 };
                    setFormData({ ...formData, customSections: newSections });
                }
            } else if (field === 'experiencePhotos') {
                setFormData({ ...formData, experiencePhotos: [...(formData.experiencePhotos || []), b64] });
            } else {
                setFormData({ ...formData, [field]: b64 });
            }
        };
        reader.readAsDataURL(file);
    };

    const TABS = [
        { id: "trip", label: "Trip Info" },
        { id: "branding", label: "Branding" },
        { id: "hotels", label: "Hotels" },
        { id: "itinerary", label: "Itinerary" },
        { id: "extra", label: "Extra Sections" },
        { id: "pricing", label: "Final Details" },
    ];

    return (
        <div className="max-w-6xl mx-auto pb-20">
            <div className="flex items-center justify-between mb-12">
                <Button
                    variant="ghost"
                    onClick={() => router.push("/admin")}
                    className="text-gray-400 font-semibold hover:text-gray-900"
                >
                    <ArrowLeft size={20} className="mr-2" /> Back to List
                </Button>

                <div className="flex items-center gap-4">
                    <div className="flex gap-2 mr-6">
                        {[1, 2, 3, 4, 5, 6].map(s => (
                            <div
                                key={s}
                                className={`w-8 h-1.5 rounded-full transition-all duration-500 ${s <= step ? 'bg-primary' : 'bg-gray-100'}`}
                            />
                        ))}
                    </div>
                    <div className="flex items-center gap-4">
                        {isEdit && (
                            <Button
                                variant="outline"
                                onClick={handleWhatsAppShare}
                                className="rounded-2xl border-2 border-green-100 text-green-600 hover:bg-green-50 hover:border-green-200"
                            >
                                <WhatsAppIcon size={18} className="mr-2" /> Share via WhatsApp
                            </Button>
                        )}
                        <Button onClick={handleSave} className="rounded-2xl shadow-xl shadow-primary/30">
                            <Save size={18} className="mr-2" /> {isEdit ? "Update Proposal" : "Save Proposal"}
                        </Button>
                    </div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    <GlassCard className="p-12 mb-12">
                        {step === 1 && (
                            <div className="flex flex-col gap-10">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                        <FileText size={28} />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Basic Details</h2>
                                        <p className="text-gray-500 font-medium">Set the luxury foundation for this trip.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <Label className="font-semibold">Client Name</Label>
                                        <Input
                                            placeholder="e.g. Mr. & Mrs. Singh"
                                            value={formData.clientName || ""}
                                            onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="font-semibold">Destination</Label>
                                        <Input
                                            placeholder="e.g. Manali Luxury Escape"
                                            value={formData.destination || ""}
                                            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="font-semibold">Pax Count</Label>
                                        <Input
                                            type="number"
                                            value={formData.pax}
                                            onChange={(e) => setFormData({ ...formData, pax: parseInt(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="font-semibold">Standard (Low Level) Price (₹)</Label>
                                        <Input
                                            type="number"
                                            placeholder="Standard Option Price"
                                            className="font-semibold"
                                            value={formData.lowLevelPrice}
                                            onChange={(e) => setFormData({ ...formData, lowLevelPrice: parseInt(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="font-semibold">Luxury (High Level) Price (₹)</Label>
                                        <Input
                                            type="number"
                                            placeholder="Luxury Option Price"
                                            className="font-black"
                                            value={formData.highLevelPrice}
                                            onChange={(e) => setFormData({ ...formData, highLevelPrice: parseInt(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label>Travel Dates From</Label>
                                        <Input
                                            type="date"
                                            value={formData.travelDates?.from || ""}
                                            onChange={(e) => setFormData({ ...formData, travelDates: { ...formData.travelDates!, from: e.target.value } })}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label>Travel Dates To</Label>
                                        <Input
                                            type="date"
                                            value={formData.travelDates?.to || ""}
                                            onChange={(e) => setFormData({ ...formData, travelDates: { ...formData.travelDates!, to: e.target.value } })}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label>Duration (Auto-calculated)</Label>
                                        <Input
                                            disabled
                                            className="bg-gray-50 font-semibold text-primary"
                                            value={formData.duration || "Nights / Days"}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="flex flex-col gap-10 text-center items-center py-10">
                                <div className="max-w-md">
                                    <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-4">Brand Elements</h2>
                                    <p className="text-gray-500 font-medium mb-12">Upload high-resolution images to elevate the luxury feel.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
                                    <div className="flex flex-col gap-4">
                                        <Label>Destination Hero</Label>
                                        <label className="group relative aspect-video rounded-[2rem] border-4 border-dashed border-gray-100 flex items-center justify-center cursor-pointer hover:border-primary/40 transition-all overflow-hidden bg-gray-50">
                                            {formData.heroImage ? (
                                                <img src={formData.heroImage} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="text-gray-400 group-hover:text-primary transition-colors flex flex-col items-center gap-3">
                                                    <ImageIcon size={32} />
                                                    <span className="text-[10px] font-semibold uppercase tracking-widest">Select Image</span>
                                                </div>
                                            )}
                                            <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'heroImage')} />
                                        </label>
                                    </div>


                                    <div className="flex flex-col gap-4">
                                        <Label>Experience Photos (Slider)</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {formData.experiencePhotos?.map((p, i) => (
                                                <div key={i} className="aspect-video rounded-xl overflow-hidden relative group">
                                                    <img src={p} className="w-full h-full object-cover" />
                                                    <button
                                                        onClick={() => {
                                                            const n = [...(formData.experiencePhotos || [])];
                                                            n.splice(i, 1);
                                                            setFormData({ ...formData, experiencePhotos: n });
                                                        }}
                                                        className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                            <label className="aspect-video rounded-xl border-4 border-dashed border-gray-100 flex items-center justify-center cursor-pointer hover:border-primary/40 transition-all bg-gray-50 flex-col gap-1">
                                                <Plus size={20} className="text-gray-400" />
                                                <span className="text-[8px] font-black uppercase text-gray-400">Add Photo</span>
                                                <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'experiencePhotos')} />
                                            </label>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-4 text-left">
                                        <div className="space-y-1">
                                            <Label className="font-semibold">Expert Details</Label>
                                            <p className="text-[10px] text-gray-400 font-medium">Profile information for the destination expert.</p>
                                        </div>
                                        <div className="flex items-center gap-4 mb-2">
                                            <label className="group relative w-16 h-16 rounded-full border-2 border-dashed border-gray-100 flex items-center justify-center cursor-pointer hover:border-primary/40 transition-all overflow-hidden bg-gray-50 shrink-0">
                                                {formData.expert?.photo ? (
                                                    <img src={formData.expert.photo} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="text-gray-400 group-hover:text-primary transition-colors flex flex-col items-center">
                                                        <Plus size={16} />
                                                    </div>
                                                )}
                                                <input type="file" className="hidden" onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            setFormData({ ...formData, expert: { ...formData.expert!, photo: reader.result as string } });
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }} />
                                            </label>
                                            <div className="flex-1 space-y-2">
                                                <Input
                                                    placeholder="Expert Name"
                                                    value={formData.expert?.name || ""}
                                                    className="h-10 text-xs font-semibold"
                                                    onChange={(e) => setFormData({ ...formData, expert: { ...formData.expert!, name: e.target.value } })}
                                                />
                                                <Input
                                                    placeholder="Expert Title"
                                                    value={formData.expert?.designation || ""}
                                                    className="h-10 text-xs font-semibold"
                                                    onChange={(e) => setFormData({ ...formData, expert: { ...formData.expert!, designation: e.target.value } })}
                                                />
                                            </div>
                                        </div>
                                        <Input
                                            placeholder="WhatsApp Number"
                                            value={formData.expert?.whatsapp || ""}
                                            className="h-10 text-xs font-semibold"
                                            onChange={(e) => setFormData({ ...formData, expert: { ...formData.expert!, whatsapp: e.target.value } })}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="flex flex-col gap-10">
                                <div className="flex flex-col gap-10">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                                <HotelIcon size={28} />
                                            </div>
                                            <div>
                                                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Hotel Options</h2>
                                                <p className="text-gray-500 font-medium">Standard & Luxury Stays.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="flex items-center justify-between border-l-4 border-gray-200 pl-6">
                                            <h3 className="text-xl font-semibold">Standard Hotels</h3>
                                            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => {
                                                const h: Hotel = { id: uuidv4(), name: "", location: "", rating: 3, description: "", roomType: "", photos: [] };
                                                setFormData({ ...formData, lowLevelHotels: [...(formData.lowLevelHotels || []), h] });
                                            }}>+ Add Standard Stay</Button>
                                        </div>

                                        <div className="flex flex-col gap-8">
                                            {formData.lowLevelHotels?.map((hotel, index) => (
                                                <div key={hotel.id} className="p-8 bg-gray-50/50 rounded-[2rem] border-2 border-transparent hover:border-gray-100 transition-all">
                                                    <div className="flex justify-between mb-6">
                                                        <h4 className="font-semibold text-gray-400">Standard Hotel {index + 1}</h4>
                                                        <Button variant="ghost" onClick={() => {
                                                            const newH = [...(formData.lowLevelHotels || [])];
                                                            newH.splice(index, 1);
                                                            setFormData({ ...formData, lowLevelHotels: newH });
                                                        }} className="text-red-400"><Trash2 size={16} /></Button>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                                        <div className="md:col-span-2 space-y-4">
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <Input placeholder="Hotel Name" value={hotel.name} onChange={(e) => {
                                                                    const newH = [...(formData.lowLevelHotels || [])];
                                                                    newH[index].name = e.target.value;
                                                                    setFormData({ ...formData, lowLevelHotels: newH });
                                                                }} />
                                                                <Input placeholder="Location" value={hotel.location} onChange={(e) => {
                                                                    const newH = [...(formData.lowLevelHotels || [])];
                                                                    newH[index].location = e.target.value;
                                                                    setFormData({ ...formData, lowLevelHotels: newH });
                                                                }} />
                                                                <Input placeholder="Room Type" value={hotel.roomType} onChange={(e) => {
                                                                    const newH = [...(formData.lowLevelHotels || [])];
                                                                    newH[index].roomType = e.target.value;
                                                                    setFormData({ ...formData, lowLevelHotels: newH });
                                                                }} />
                                                            </div>
                                                            <Textarea placeholder="Description..." value={hotel.description} onChange={(e) => {
                                                                const newH = [...(formData.lowLevelHotels || [])];
                                                                newH[index].description = e.target.value;
                                                                setFormData({ ...formData, lowLevelHotels: newH });
                                                            }} />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2 h-fit">
                                                            {hotel.photos?.map((p, i) => (
                                                                <div key={i} className="aspect-square rounded-xl overflow-hidden relative">
                                                                    <img src={p} className="w-full h-full object-cover" />
                                                                </div>
                                                            ))}
                                                            <label className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer bg-white">
                                                                <Plus size={16} />
                                                                <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'lowLevelHotels', true, index)} />
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-8 pt-10 border-t border-gray-50">
                                        <div className="flex items-center justify-between border-l-4 border-primary pl-6">
                                            <h3 className="text-xl font-semibold">Luxury Hotels</h3>
                                            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => {
                                                const h: Hotel = { id: uuidv4(), name: "", location: "", rating: 5, description: "", roomType: "", photos: [] };
                                                setFormData({ ...formData, highLevelHotels: [...(formData.highLevelHotels || []), h] });
                                            }}>+ Add Luxury Stay</Button>
                                        </div>

                                        <div className="flex flex-col gap-8">
                                            {formData.highLevelHotels?.map((hotel, index) => (
                                                <div key={hotel.id} className="p-8 bg-primary/[0.02] rounded-[2rem] border-2 border-transparent hover:border-primary/5 transition-all">
                                                    <div className="flex justify-between mb-6">
                                                        <h4 className="font-semibold text-primary opacity-50">Luxury Hotel {index + 1}</h4>
                                                        <Button variant="ghost" onClick={() => {
                                                            const newH = [...(formData.highLevelHotels || [])];
                                                            newH.splice(index, 1);
                                                            setFormData({ ...formData, highLevelHotels: newH });
                                                        }} className="text-red-400"><Trash2 size={16} /></Button>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                                        <div className="md:col-span-2 space-y-4">
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <Input placeholder="Hotel Name" value={hotel.name} onChange={(e) => {
                                                                    const newH = [...(formData.highLevelHotels || [])];
                                                                    newH[index].name = e.target.value;
                                                                    setFormData({ ...formData, highLevelHotels: newH });
                                                                }} />
                                                                <Input placeholder="Location" value={hotel.location} onChange={(e) => {
                                                                    const newH = [...(formData.highLevelHotels || [])];
                                                                    newH[index].location = e.target.value;
                                                                    setFormData({ ...formData, highLevelHotels: newH });
                                                                }} />
                                                                <Input placeholder="Room Type" value={hotel.roomType} onChange={(e) => {
                                                                    const newH = [...(formData.highLevelHotels || [])];
                                                                    newH[index].roomType = e.target.value;
                                                                    setFormData({ ...formData, highLevelHotels: newH });
                                                                }} />
                                                            </div>
                                                            <Textarea placeholder="Description..." value={hotel.description} onChange={(e) => {
                                                                const newH = [...(formData.highLevelHotels || [])];
                                                                newH[index].description = e.target.value;
                                                                setFormData({ ...formData, highLevelHotels: newH });
                                                            }} />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2 h-fit">
                                                            {hotel.photos?.map((p, i) => (
                                                                <div key={i} className="aspect-square rounded-xl overflow-hidden relative">
                                                                    <img src={p} className="w-full h-full object-cover" />
                                                                </div>
                                                            ))}
                                                            <label className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer bg-white">
                                                                <Plus size={16} />
                                                                <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'highLevelHotels', true, index)} />
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="flex flex-col gap-10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                            <Calendar size={28} />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Day-Wise Itinerary</h2>
                                            <p className="text-gray-500 font-medium">Curate the daily experience.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <Button variant="outline" onClick={() => {
                                            const d: DayItinerary = {
                                                id: uuidv4(),
                                                day: (formData.itinerary?.length || 0) + 1,
                                                title: "",
                                                description: "",
                                                activities: [],
                                                photos: []
                                            };
                                            setFormData({ ...formData, itinerary: [...(formData.itinerary || []), d] });
                                        }} className="rounded-2xl border-2">
                                            <Plus size={20} className="mr-2" /> Add Manual Day
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-16">
                                    {formData.itinerary?.map((item, index) => (
                                        <div key={item.id} className="relative group flex gap-10">
                                            <div className="flex flex-col items-center gap-4 shrink-0">
                                                <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center text-xl font-black italic shadow-lg shadow-primary/30">
                                                    {item.day}
                                                </div>
                                                <div className="w-1 flex-1 bg-gray-50 rounded-full" />
                                            </div>

                                            <div className="flex-1 space-y-8 bg-gray-50/50 p-10 rounded-[2.5rem] relative">
                                                <div className="absolute top-6 right-6">
                                                    <Button variant="ghost" onClick={() => {
                                                        const newItin = [...(formData.itinerary || [])];
                                                        newItin.splice(index, 1);
                                                        const indexed = newItin.map((d, i) => ({ ...d, day: i + 1 }));
                                                        setFormData({ ...formData, itinerary: indexed });
                                                    }} className="text-red-500"><Trash2 size={18} /></Button>
                                                </div>

                                                <div className="space-y-4">
                                                    <Label className="font-semibold">Day {item.day} Title</Label>
                                                    <Input
                                                        placeholder="Title"
                                                        value={item.title}
                                                        onChange={(e) => {
                                                            const newItin = [...(formData.itinerary || [])];
                                                            newItin[index].title = e.target.value;
                                                            setFormData({ ...formData, itinerary: newItin });
                                                        }}
                                                        className="bg-white font-black"
                                                    />
                                                </div>

                                                <div className="space-y-4">
                                                    <Label className="font-semibold">Activities (One per line)</Label>
                                                    <Textarea
                                                        value={item.activities.join('\n')}
                                                        onChange={(e) => {
                                                            const newItin = [...(formData.itinerary || [])];
                                                            newItin[index].activities = e.target.value.split('\n');
                                                            setFormData({ ...formData, itinerary: newItin });
                                                        }}
                                                        className="bg-white font-semibold"
                                                    />
                                                </div>

                                                <div className="space-y-4">
                                                    <Label className="font-semibold">Day Description</Label>
                                                    <Textarea
                                                        value={item.description}
                                                        onChange={(e) => {
                                                            const newItin = [...(formData.itinerary || [])];
                                                            newItin[index].description = e.target.value;
                                                            setFormData({ ...formData, itinerary: newItin });
                                                        }}
                                                        className="bg-white min-h-[100px] font-semibold"
                                                    />
                                                </div>

                                                <div className="space-y-4">
                                                    <Label className="font-semibold">Daily Photos</Label>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                        {item.photos?.map((photo, i) => (
                                                            <div key={i} className="aspect-video rounded-2xl overflow-hidden relative group">
                                                                <img src={photo} className="w-full h-full object-cover" />
                                                                <button
                                                                    onClick={() => {
                                                                        const newItin = [...(formData.itinerary || [])];
                                                                        newItin[index].photos.splice(i, 1);
                                                                        setFormData({ ...formData, itinerary: newItin });
                                                                    }}
                                                                    className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                        <label className="aspect-video rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-primary/40 transition-all bg-white group/upload">
                                                            <ImageIcon size={24} className="text-gray-300" />
                                                            <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'itinerary', true, index)} />
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 5 && (
                            <div className="flex flex-col gap-10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                            <Layers size={28} />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Extra Sections</h2>
                                            <p className="text-gray-500 font-medium">Add custom content blocks.</p>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => {
                                            const newSection: CustomSection = { id: uuidv4(), heading: "", description: "", isVisible: true };
                                            setFormData({ ...formData, customSections: [...(formData.customSections || []), newSection] });
                                        }}
                                        className="rounded-2xl"
                                    >
                                        <Plus size={20} className="mr-2" /> + Add Section
                                    </Button>
                                </div>

                                <Reorder.Group
                                    axis="y"
                                    values={formData.customSections || []}
                                    onReorder={(newOrder) => setFormData({ ...formData, customSections: newOrder })}
                                    className="space-y-6"
                                >
                                    {(formData.customSections || []).map((section, index) => (
                                        <Reorder.Item
                                            key={section.id}
                                            value={section}
                                            className={`p-8 bg-gray-50/50 rounded-[2.5rem] border-2 ${section.isVisible ? 'border-transparent' : 'border-dashed border-gray-200 opacity-60'}`}
                                        >
                                            <div className="flex items-start gap-6">
                                                <div className="mt-2 text-gray-300 cursor-grab active:cursor-grabbing">
                                                    <GripVertical size={24} />
                                                </div>
                                                <div className="flex-1 space-y-8">
                                                    <div className="flex items-center justify-between">
                                                        <h3 className="text-xl font-black">Section {index + 1}</h3>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                variant="ghost" size="sm"
                                                                onClick={() => {
                                                                    const n = [...(formData.customSections || [])];
                                                                    n[index] = { ...n[index], isVisible: !n[index].isVisible };
                                                                    setFormData({ ...formData, customSections: n });
                                                                }}
                                                            >
                                                                {section.isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                                                            </Button>
                                                            <Button
                                                                variant="ghost" size="sm"
                                                                onClick={() => {
                                                                    const n = [...(formData.customSections || [])];
                                                                    n.splice(index, 1);
                                                                    setFormData({ ...formData, customSections: n });
                                                                }}
                                                                className="text-red-400"
                                                            >
                                                                <Trash2 size={18} />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        <div className="space-y-6">
                                                            <Input placeholder="Heading" value={section.heading} onChange={(e) => {
                                                                const n = [...(formData.customSections || [])];
                                                                n[index].heading = e.target.value;
                                                                setFormData({ ...formData, customSections: n });
                                                            }} />
                                                            <Textarea placeholder="Description" value={section.description} onChange={(e) => {
                                                                const n = [...(formData.customSections || [])];
                                                                n[index].description = e.target.value;
                                                                setFormData({ ...formData, customSections: n });
                                                            }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Reorder.Item>
                                    ))}
                                </Reorder.Group>
                            </div>
                        )}

                        {step === 6 && (
                            <div className="flex flex-col gap-10">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                        <Users size={28} />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Final Details & Payments</h2>
                                        <p className="text-gray-500 font-medium">Verify everything before saving.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div className="space-y-4">
                                        <Label className="font-semibold">Transport Mode</Label>
                                        <div className="relative group/transport">
                                            <Input
                                                placeholder="e.g. Flight, Private Car, Tempo Traveller..."
                                                className="h-14 rounded-2xl border-2 border-gray-100 bg-white px-6 font-semibold focus:border-primary transition-all pr-12"
                                                value={formData.transportOption || ""}
                                                onChange={(e) => setFormData({ ...formData, transportOption: e.target.value })}
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 group-hover/transport:text-primary transition-colors pointer-events-none">
                                                <Edit size={18} />
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {["Flight", "Train", "Private Car", "Bus", "Self Drive"].map(opt => (
                                                <button
                                                    key={opt}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, transportOption: opt })}
                                                    className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border-2 ${formData.transportOption === opt ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-gray-50 border-transparent text-gray-400 hover:border-gray-200'}`}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Label className="font-semibold">Inclusions (One per line)</Label>
                                        <Textarea
                                            value={formData.includes?.join('\n')}
                                            onChange={(e) => setFormData({ ...formData, includes: e.target.value.split('\n') })}
                                            className="min-h-[150px]"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <Label className="font-semibold">Exclusions (One per line)</Label>
                                        <Textarea
                                            value={formData.exclusions?.join('\n')}
                                            onChange={(e) => setFormData({ ...formData, exclusions: e.target.value.split('\n') })}
                                            className="min-h-[150px]"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </GlassCard>
                </motion.div>
            </AnimatePresence>

            <div className="flex justify-between">
                <Button variant="outline" disabled={step === 1} onClick={prevStep} className="rounded-2xl px-10 border-2">
                    <ChevronLeft size={20} className="mr-2" /> Previous
                </Button>
                {step < totalSteps ? (
                    <Button onClick={nextStep} className="rounded-2xl px-10">
                        Next Section <ChevronRight size={20} className="ml-2" />
                    </Button>
                ) : (
                    <Button onClick={handleSave} disabled={isSaving} className="rounded-2xl px-10 shadow-lg shadow-primary/20">
                        {isSaving ? "Saving..." : <><Save size={20} className="mr-2" /> Save Proposal</>}
                    </Button>
                )}
            </div>
        </div>
    );
}
