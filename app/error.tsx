"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Storefront Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] px-6 text-center">
      <div className="max-w-md space-y-6">
        <span className="caption-label text-destructive">Application Notice</span>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal text-foreground">
          Encountered an Interruption
        </h1>
        <p className="text-xs text-foreground-secondary leading-relaxed font-light">
          An unexpected variance occurred while processing this request. Our technical archivist has logged this occurrence.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Button onClick={() => reset()} shimmer size="md">
            Retry Request
          </Button>
          <Button variant="outline" size="md" onClick={() => (window.location.href = "/")}>
            Return Home
          </Button>
        </div>
      </div>
    </div>
  );
}
