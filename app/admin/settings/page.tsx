"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Save, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { initialSiteSettings, initialHeroSlides } from "@/lib/mock-data";
import { useToast } from "@/context/ToastContext";
import { HeroSlide } from "@/types";

export default function AdminSettingsPage() {
  const { showToast } = useToast();
  const [settings, setSettings] = useState(initialSiteSettings);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(initialHeroSlides);

  // New slide form state
  const [isAddingSlide, setIsAddingSlide] = useState(false);
  const [newSlide, setNewSlide] = useState({
    heading: "",
    subheading: "",
    image_url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1800&q=90",
    cta_text: "Explore Collection",
    cta_link: "/products",
  });

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    showToast({
      type: "success",
      title: "Settings Saved",
      message: "Brand identity and storefront preferences have been updated.",
    });
  };

  const handleAddSlide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlide.heading) return;

    const created: HeroSlide = {
      id: "slide-" + Date.now(),
      heading: newSlide.heading,
      subheading: newSlide.subheading,
      image_url: newSlide.image_url,
      cta_text: newSlide.cta_text,
      cta_link: newSlide.cta_link,
      sort_order: heroSlides.length,
      is_active: true,
    };
    setHeroSlides([...heroSlides, created]);
    setIsAddingSlide(false);
    setNewSlide({
      heading: "",
      subheading: "",
      image_url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1800&q=90",
      cta_text: "Explore Collection",
      cta_link: "/products",
    });
    showToast({
      type: "success",
      title: "Hero Slide Added",
      message: "New storefront hero slide is now active in rotation.",
    });
  };

  const handleDeleteSlide = (id: string) => {
    setHeroSlides(heroSlides.filter((s) => s.id !== id));
    showToast({
      type: "info",
      title: "Slide Removed",
      message: "The hero slide has been removed.",
    });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/5 pb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#111827]">
            Brand & Site Customization
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Modify brand typography, contact details, currency, taxes, and hero carousels without touching code.
          </p>
        </div>
        <Button onClick={handleSaveSettings} shimmer size="md" className="gap-2">
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </Button>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-8">
        {/* Section 1: Brand Identity */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-black/5 shadow-sm space-y-6">
          <h3 className="font-serif text-lg font-semibold text-[#111827]">
            Brand Visual Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Storefront Brand Name"
              value={settings.site_name}
              onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
              required
            />
            <Input
              label="Brand Tagline"
              value={settings.tagline || ""}
              onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Primary Logo Image URL"
              value={settings.logo_url || ""}
              onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
            />
            <Input
              label="Inverted Logo (Footer / Dark Mode)"
              value={settings.logo_inverted_url || ""}
              onChange={(e) => setSettings({ ...settings, logo_inverted_url: e.target.value })}
            />
          </div>
        </div>

        {/* Section 2: Announcement Bar */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-black/5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-black/5">
            <h3 className="font-serif text-lg font-semibold text-[#111827]">
              Announcement Bar
            </h3>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-foreground">
              <input
                type="checkbox"
                checked={settings.announcement_bar_active}
                onChange={(e) =>
                  setSettings({ ...settings, announcement_bar_active: e.target.checked })
                }
                className="rounded border-black/20 text-accent focus:ring-accent"
              />
              <span>Display Announcement Bar</span>
            </label>
          </div>

          <Input
            label="Announcement Text"
            value={settings.announcement_bar_text || ""}
            onChange={(e) =>
              setSettings({ ...settings, announcement_bar_text: e.target.value })
            }
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Destination Link URL"
              value={settings.announcement_bar_link || ""}
              onChange={(e) =>
                setSettings({ ...settings, announcement_bar_link: e.target.value })
              }
            />
            <Input
              label="Background Hex Color"
              value={settings.announcement_bar_color || "#1A1A1A"}
              onChange={(e) =>
                setSettings({ ...settings, announcement_bar_color: e.target.value })
              }
            />
          </div>
        </div>

        {/* Section 3: Currency & Tax */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-black/5 shadow-sm space-y-4">
          <h3 className="font-serif text-lg font-semibold text-[#111827]">
            Currency & Financial Policies
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Currency Code"
              value={settings.currency_code}
              onChange={(e) => setSettings({ ...settings, currency_code: e.target.value })}
              required
            />
            <Input
              label="Currency Symbol"
              value={settings.currency_symbol}
              onChange={(e) => setSettings({ ...settings, currency_symbol: e.target.value })}
              required
            />
            <Input
              label="Sales Tax Rate (%)"
              type="number"
              step="0.01"
              value={String(settings.tax_rate)}
              onChange={(e) => setSettings({ ...settings, tax_rate: Number(e.target.value) })}
              required
            />
          </div>
        </div>

        {/* Section 4: Contact & Social */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-black/5 shadow-sm space-y-4">
          <h3 className="font-serif text-lg font-semibold text-[#111827]">
            Concierge Contact & Social Media
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Concierge Email"
              type="email"
              value={settings.contact_email}
              onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
              required
            />
            <Input
              label="Concierge Telephone"
              value={settings.contact_phone || ""}
              onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
            />
          </div>

          <Input
            label="Atelier Physical Address"
            value={settings.business_address || ""}
            onChange={(e) => setSettings({ ...settings, business_address: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <Input
              label="Instagram URL"
              value={settings.social_instagram || ""}
              onChange={(e) => setSettings({ ...settings, social_instagram: e.target.value })}
            />
            <Input
              label="Twitter / X URL"
              value={settings.social_twitter || ""}
              onChange={(e) => setSettings({ ...settings, social_twitter: e.target.value })}
            />
            <Input
              label="Facebook URL"
              value={settings.social_facebook || ""}
              onChange={(e) => setSettings({ ...settings, social_facebook: e.target.value })}
            />
          </div>
        </div>

        {/* Section 5: Homepage Hero Slides Management */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-black/5 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-black/5">
            <div>
              <h3 className="font-serif text-lg font-semibold text-[#111827]">
                Homepage Hero Slides Carousel
              </h3>
              <p className="text-xs text-[#6B7280]">
                Manage imagery, animated headlines, and direct calls to action.
              </p>
            </div>
            {!isAddingSlide && (
              <Button
                type="button"
                size="sm"
                onClick={() => setIsAddingSlide(true)}
                className="gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Hero Slide</span>
              </Button>
            )}
          </div>

          {isAddingSlide && (
            <div className="p-6 rounded-2xl bg-[#FAFAFA] border border-black/10 space-y-4">
              <h4 className="font-serif font-semibold text-sm">New Slide Details</h4>
              <Input
                label="Headline"
                value={newSlide.heading}
                onChange={(e) => setNewSlide({ ...newSlide, heading: e.target.value })}
                required
              />
              <Input
                label="Subheading / Synopsis"
                value={newSlide.subheading}
                onChange={(e) => setNewSlide({ ...newSlide, subheading: e.target.value })}
              />
              <Input
                label="Background Image URL"
                value={newSlide.image_url}
                onChange={(e) => setNewSlide({ ...newSlide, image_url: e.target.value })}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Button Text"
                  value={newSlide.cta_text}
                  onChange={(e) => setNewSlide({ ...newSlide, cta_text: e.target.value })}
                />
                <Input
                  label="Button Link URL"
                  value={newSlide.cta_link}
                  onChange={(e) => setNewSlide({ ...newSlide, cta_link: e.target.value })}
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddingSlide(false)}>
                  Cancel
                </Button>
                <Button type="button" size="sm" onClick={handleAddSlide}>
                  Save Slide
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {heroSlides.map((slide) => (
              <div
                key={slide.id}
                className="flex items-center justify-between p-4 rounded-2xl border border-black/5 bg-[#FAFAFA] gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-14 rounded-lg overflow-hidden bg-black flex-shrink-0">
                    <Image src={slide.image_url} alt="" fill className="object-cover" />
                  </div>
                  <div>
                    <h5 className="font-serif font-semibold text-xs text-foreground">
                      {slide.heading}
                    </h5>
                    <p className="text-[11px] text-[#6B7280] line-clamp-1">{slide.subheading}</p>
                    <span className="text-[10px] text-accent font-semibold">
                      CTA: {slide.cta_text} → {slide.cta_link}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteSlide(slide.id)}
                  className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  title="Remove Slide"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
