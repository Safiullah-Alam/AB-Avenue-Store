import React from "react";

export default function PoliciesPage() {
  return (
    <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 py-16 lg:py-24">
      <div className="max-w-3xl mx-auto space-y-16">
        <div>
          <span className="caption-label">Policies & Trust</span>
          <h1 className="font-serif text-3xl sm:text-5xl font-normal text-foreground mt-2 mb-4">
            Shipping, Exchange & Payment Terms
          </h1>
          <p className="text-xs text-foreground-secondary">
            Last revised October 2026. Governing all purchases from AB Avenue Pakistan.
          </p>
        </div>

        <section className="space-y-4 border-t border-black/5 pt-8">
          <h2 className="font-serif text-2xl font-normal text-foreground">
            1. Nationwide Delivery & Dispatch
          </h2>
          <p className="text-xs text-foreground-secondary leading-relaxed font-light">
            All orders are dispatched from Karachi via reputable courier partners (TCS, Leopards, and Trax). Standard delivery takes 2 to 4 business days across Pakistan. Delivery charges range from Rs. 100 to Rs. 300 subject to location, and are quoted at the time of order confirmation via WhatsApp.
          </p>
        </section>

        <section className="space-y-4 border-t border-black/5 pt-8">
          <h2 className="font-serif text-2xl font-normal text-foreground">
            2. Hassle-Free 7-Day Exchange Policy
          </h2>
          <p className="text-xs text-foreground-secondary leading-relaxed font-light">
            If a garment does not fit your little one or you require a size replacement, you have 7 calendar days from parcel delivery to request an exchange. Garments must remain unwashed and unworn with tags attached. Contact our WhatsApp support at 03238048183 for immediate exchange coordination.
          </p>
        </section>

        <section className="space-y-4 border-t border-black/5 pt-8">
          <h2 className="font-serif text-2xl font-normal text-foreground">
            3. Payment Security (EasyPaisa & Cash on Delivery)
          </h2>
          <p className="text-xs text-foreground-secondary leading-relaxed font-light">
            We support direct EasyPaisa transfers to official account holder Safiullah (03238048183) with verified Transaction IDs, as well as Cash on Delivery (COD) for your utmost peace of mind.
          </p>
        </section>
      </div>
    </div>
  );
}
