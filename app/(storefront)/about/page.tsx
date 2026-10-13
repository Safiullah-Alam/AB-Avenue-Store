"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function AboutPage() {
  return (
    <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 py-16 lg:py-24 space-y-24">
      {/* Hero statement */}
      <section className="max-w-3xl">
        <span className="caption-label">The Atelier Monograph</span>
        <h1 className="font-serif text-4xl sm:text-6xl font-normal text-foreground leading-[1.15] mt-3 mb-6">
          Form reduced to essence. Craft preserved for generations.
        </h1>
        <p className="text-base sm:text-lg text-foreground-secondary leading-relaxed font-light">
          Founded in Copenhagen and refined across Florence and Glashütte, ATELIER V is dedicated to the creation of objects that resist obsolescence. We unite architectural rigor with ancestral craft traditions.
        </p>
      </section>

      {/* Hero Image */}
      <section className="relative w-full aspect-[21/9] min-h-[380px] rounded-3xl overflow-hidden border border-black/5 shadow-card">
        <Image
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1800&q=90"
          alt="Atelier Studio"
          fill
          className="object-cover"
        />
      </section>

      {/* Core Principles */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="space-y-3">
          <span className="font-mono text-xs text-accent">01 / ARCHITECTURE</span>
          <h3 className="font-serif text-2xl font-normal text-foreground">
            Structural Restraint
          </h3>
          <p className="text-xs text-foreground-secondary leading-relaxed font-light">
            Every millimeter is reasoned. No superfluous decoration or decorative artifacts. The ornament arises naturally from how materials join.
          </p>
        </div>

        <div className="space-y-3">
          <span className="font-mono text-xs text-accent">02 / PROVENANCE</span>
          <h3 className="font-serif text-2xl font-normal text-foreground">
            Ancestral Materiality
          </h3>
          <p className="text-xs text-foreground-secondary leading-relaxed font-light">
            We source vegetable-tanned hides from single-family tanneries outside Florence and automatic movements assembled by third-generation German watchmakers.
          </p>
        </div>

        <div className="space-y-3">
          <span className="font-mono text-xs text-accent">03 / PERPETUITY</span>
          <h3 className="font-serif text-2xl font-normal text-foreground">
            Lifetime Restoration
          </h3>
          <p className="text-xs text-foreground-secondary leading-relaxed font-light">
            Our atelier maintains archival replacement components for every production run, guaranteeing that every piece can be serviced for a lifetime.
          </p>
        </div>
      </section>

      {/* CTA Box */}
      <section className="bg-white rounded-3xl border border-black/5 p-12 sm:p-16 text-center shadow-card max-w-3xl mx-auto">
        <h2 className="font-serif text-3xl font-normal text-foreground mb-4">
          Experience the Archival Collection
        </h2>
        <p className="text-sm text-foreground-secondary mb-8 max-w-md mx-auto font-light">
          Available in limited serialized batches with worldwide insured delivery.
        </p>
        <Link href="/products">
          <Button shimmer size="lg" className="rounded-full px-8">
            Explore All Creations
          </Button>
        </Link>
      </section>
    </div>
  );
}
