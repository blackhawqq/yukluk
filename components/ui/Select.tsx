"use client";

import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { SelectHTMLAttributes, forwardRef } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, placeholder, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-dark">
            {label}
            {props.required && <span className="text-orange ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              "w-full border rounded-xl px-4 py-2.5 text-dark bg-white appearance-none",
              "text-sm cursor-pointer",
              "focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest",
              "transition-colors duration-200",
              "disabled:bg-cream-dark disabled:cursor-not-allowed",
              error
                ? "border-red-400 focus:ring-red-200 focus:border-red-400"
                : "border-cream-dark hover:border-stone",
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="">{placeholder}</option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone pointer-events-none" />
        </div>
        {error && <p className="text-red-500 text-xs">{error}</p>}
        {hint && !error && <p className="text-stone text-xs">{hint}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
