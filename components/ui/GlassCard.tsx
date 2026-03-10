"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    variant?: "light" | "dark" | "orange";
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
    ({ className, children, variant = "light", ...props }, ref) => {
        const variants = {
            light: "bg-white/70 border-white/20 shadow-xl shadow-black/5",
            dark: "bg-black/40 border-white/10 shadow-2xl backdrop-blur-xl text-white",
            orange: "bg-primary/5 border-primary/10 shadow-xl shadow-primary/5",
        };

        return (
            <motion.div
                ref={ref}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={cn(
                    "backdrop-blur-md rounded-[2.5rem] border p-8 transition-all hover:shadow-2xl",
                    variants[variant],
                    className
                )}
                {...props}
            >
                {children}
            </motion.div>
        );
    }
);

GlassCard.displayName = "GlassCard";

export { GlassCard };
