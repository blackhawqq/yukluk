"use client";

import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-dark">
            {label}
            {props.required && <span className="text-orange ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full border rounded-xl px-4 py-2.5 text-dark bg-white",
              "placeholder:text-stone text-sm",
              "focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest",
              "transition-colors duration-200",
              "disabled:bg-cream-dark disabled:cursor-not-allowed",
              error
                ? "border-red-400 focus:ring-red-200 focus:border-red-400"
                : "border-cream-dark hover:border-stone",
              !!leftIcon && "pl-10",
              !!rightIcon && "pr-10",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-stone">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-red-500 text-xs">{error}</p>}
        {hint && !error && <p className="text-stone text-xs">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-dark">
            {label}
            {props.required && <span className="text-orange ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            "w-full border rounded-xl px-4 py-2.5 text-dark bg-white",
            "placeholder:text-stone text-sm resize-none",
            "focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest",
            "transition-colors duration-200",
            "disabled:bg-cream-dark disabled:cursor-not-allowed",
            error
              ? "border-red-400 focus:ring-red-200 focus:border-red-400"
              : "border-cream-dark hover:border-stone",
            className
          )}
          {...props}
        />
        {error && <p className="text-red-500 text-xs">{error}</p>}
        {hint && !error && <p className="text-stone text-xs">{hint}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
