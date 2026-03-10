"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getQuotationById } from "@/lib/store";
import { Quotation } from "@/lib/types";
import QuotationForm from "@/components/QuotationForm";

export default function EditQuotation() {
    const { id } = useParams();
    const [quotation, setQuotation] = useState<Quotation | null>(null);

    useEffect(() => {
        const load = async () => {
            if (id) {
                const data = await getQuotationById(id as string);
                if (data) {
                    setQuotation(data);
                }
            }
        };
        load();
    }, [id]);

    if (!quotation) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return <QuotationForm initialData={quotation} isEdit={true} />;
}
