"use client";

import React, { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageSliderProps {
    images: string[];
    className?: string;
    aspectRatio?: "video" | "square" | "portrait";
}

export const ImageSlider = ({
    images,
    className,
    aspectRatio = "video"
}: ImageSliderProps) => {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    const ratios = {
        video: "aspect-video",
        square: "aspect-square",
        portrait: "aspect-[3/4]",
    };

    if (!images?.length) return null;

    return (
        <div className={cn("relative group overflow-hidden rounded-[2rem]", className)}>
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex">
                    {images.map((img, index) => (
                        <div key={index} className="flex-[0_0_100%] min-w-0">
                            <img
                                src={img}
                                alt={`Slide ${index + 1}`}
                                className={cn("w-full h-full object-cover", ratios[aspectRatio])}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {images.length > 1 && (
                <>
                    <button
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white/40"
                        onClick={scrollPrev}
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white/40"
                        onClick={scrollNext}
                    >
                        <ChevronRight size={24} />
                    </button>

                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                        {images.map((_, i) => (
                            <div
                                key={i}
                                className="w-1.5 h-1.5 rounded-full bg-white/40"
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};
