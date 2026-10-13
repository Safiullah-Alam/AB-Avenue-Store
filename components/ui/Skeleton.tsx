import React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("skeleton-shimmer rounded-lg", className)}
      {...props}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="w-full aspect-[4/5] rounded-2xl" />
      <div className="space-y-2 pt-2">
        <Skeleton className="h-3 w-1/3 rounded-full" />
        <Skeleton className="h-5 w-4/5 rounded-full" />
        <Skeleton className="h-4 w-1/4 rounded-full" />
      </div>
    </div>
  );
}
