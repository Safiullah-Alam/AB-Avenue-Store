"use client";

import React, { useState } from "react";
import { Save } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";

export default function AdminSEOPage() {
  const { showToast } = useToast();

  const [metaTitleTemplate, setMetaTitleTemplate] = useState("{Page Title} | ATELIER V");
  const [defaultMetaDesc, setDefaultMetaDesc] = useState(
    "Discover curated luxury goods, artisanal timepieces, and bespoke everyday essentials crafted for longevity."
  );
  const [gaTrackingId, setGaTrackingId] = useState("G-DEMO12345678");
  const [fbPixelId, setFbPixelId] = useState("");
  const [searchConsoleMeta, setSearchConsoleMeta] = useState("");
  const [robotsTxt, setRobotsTxt] = useState(
    "User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: https://atelierv.com/sitemap.xml"
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast({
      type: "success",
      title: "SEO Settings Saved",
      message: "Global meta templates, robots.txt, and tracking IDs updated.",
    });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/5 pb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#111827]">
            Search Engine Optimization (SEO)
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Manage meta title schemes, search console verifications, robots.txt, and structured data schemas.
          </p>
        </div>
        <Button onClick={handleSave} shimmer size="md" className="gap-2">
          <Save className="w-4 h-4" />
          <span>Save SEO Configuration</span>
        </Button>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Global Meta Templates */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-black/5 shadow-sm space-y-4">
          <h3 className="font-serif text-lg font-semibold text-[#111827]">
            Global Meta Schemes
          </h3>

          <Input
            label="Default Meta Title Template"
            value={metaTitleTemplate}
            onChange={(e) => setMetaTitleTemplate(e.target.value)}
            placeholder="{Page Title} | Site Name"
            required
          />

          <div>
            <label className="caption-label block mb-1">Default Meta Description</label>
            <textarea
              rows={3}
              value={defaultMetaDesc}
              onChange={(e) => setDefaultMetaDesc(e.target.value)}
              className="w-full text-xs p-4 rounded-xl border border-black/10 focus:outline-none focus:border-accent text-foreground leading-relaxed"
            />
          </div>
        </div>

        {/* Analytics & Verification Meta */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-black/5 shadow-sm space-y-4">
          <h3 className="font-serif text-lg font-semibold text-[#111827]">
            Analytics & Verification Tags
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Google Analytics / GA4 Measurement ID"
              value={gaTrackingId}
              onChange={(e) => setGaTrackingId(e.target.value)}
              placeholder="G-XXXXXXXXXX"
            />
            <Input
              label="Meta / Facebook Pixel ID"
              value={fbPixelId}
              onChange={(e) => setFbPixelId(e.target.value)}
              placeholder="1234567890"
            />
          </div>

          <Input
            label="Google Search Console Verification Tag"
            value={searchConsoleMeta}
            onChange={(e) => setSearchConsoleMeta(e.target.value)}
            placeholder="google-site-verification=..."
          />
        </div>

        {/* Robots.txt Editor */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-black/5 shadow-sm space-y-4">
          <h3 className="font-serif text-lg font-semibold text-[#111827]">
            Robots.txt Directive File
          </h3>
          <p className="text-xs text-[#6B7280]">
            Configures search crawler indexing permissions for search bots.
          </p>

          <textarea
            rows={6}
            value={robotsTxt}
            onChange={(e) => setRobotsTxt(e.target.value)}
            className="w-full font-mono text-xs p-4 rounded-xl border border-black/10 focus:outline-none focus:border-accent text-foreground bg-[#FAFAFA]"
          />
        </div>
      </form>
    </div>
  );
}
