import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] px-6 text-center">
      <div className="max-w-md space-y-6">
        <span className="caption-label text-accent">Error 404</span>
        <h1 className="font-serif text-4xl sm:text-5xl font-normal text-foreground">
          Archival Record Not Located
        </h1>
        <p className="text-sm text-foreground-secondary leading-relaxed font-light">
          The piece or page you are attempting to inspect may have been relocated, archived, or is temporarily unavailable.
        </p>
        <div className="pt-2">
          <Link href="/">
            <Button shimmer size="lg" className="rounded-full px-8">
              Return to Archival Gallery
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
