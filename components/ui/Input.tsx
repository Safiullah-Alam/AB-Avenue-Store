"use client";

import React, { forwardRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, value, defaultValue, onChange, onFocus, onBlur, ...props }, ref) => {
    const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, "-")}`;
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(
      Boolean(value || defaultValue || (props as { placeholder?: string }).placeholder)
    );

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setHasValue(Boolean(e.target.value));
      onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(Boolean(e.target.value));
      onChange?.(e);
    };

    const isFloating = isFocused || hasValue || Boolean(value);

    return (
      <div className="relative w-full">
        <div
          className={cn(
            "relative w-full rounded-xl border bg-white transition-all duration-200",
            error
              ? "border-destructive focus-within:ring-2 focus-within:ring-destructive/20"
              : isFocused
              ? "border-accent ring-2 ring-accent/15"
              : "border-black/10 hover:border-black/25",
            className
          )}
        >
          <input
            id={inputId}
            ref={ref}
            value={value}
            defaultValue={defaultValue}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            className="w-full bg-transparent px-4 pt-5 pb-2 text-sm text-foreground outline-none transition-all placeholder-transparent"
            placeholder={label}
            {...props}
          />
          <label
            htmlFor={inputId}
            className={cn(
              "pointer-events-none absolute left-4 transition-all duration-200 ease-out select-none",
              isFloating
                ? "top-1.5 text-[10px] font-semibold uppercase tracking-wider text-accent"
                : "top-3.5 text-sm font-normal text-foreground-secondary",
              error && isFloating && "text-destructive"
            )}
          >
            {label}
          </label>
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-destructive flex items-center gap-1 font-medium pl-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
