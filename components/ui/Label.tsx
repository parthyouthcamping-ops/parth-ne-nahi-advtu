"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const Label = React.forwardRef<
    HTMLLabelElement,
    React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
    <label
        ref={ref}
        className={cn(
            "text-sm font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-500 uppercase tracking-widest pl-2 mb-2 block",
            className
        )}
        {...props}
    />
));
Label.displayName = "Label";

export { Label };
