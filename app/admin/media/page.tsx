"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Copy, Trash2 } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/ui/Button";

const initialMediaItems = [
  { id: "m-1", url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1000&q=85", title: "Chronos Primary Studio" },
  { id: "m-2", url: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=1000&q=85", title: "Chronos Wrist Shot" },
  { id: "m-3", url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1000&q=85", title: "Tuscan Briefcase Studio" },
  { id: "m-4", url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1000&q=85", title: "Leather Details" },
  { id: "m-5", url: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=1000&q=85", title: "Cashmere Knit" },
  { id: "m-6", url: "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?w=1000&q=85", title: "Santal Extrait Flacon" },
  { id: "m-7", url: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=1000&q=85", title: "Titanium Sunglasses" },
  { id: "m-8", url: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=1000&q=85", title: "Card Folio Open" },
];

export default function AdminMediaPage() {
  const { showToast } = useToast();
  const [mediaList, setMediaList] = useState(initialMediaItems);
  const [newUrl, setNewUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");

  const handleAddMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;

    const item = {
      id: "m-" + Date.now(),
      url: newUrl.trim(),
      title: newTitle.trim() || "Archival Asset",
    };
    setMediaList([item, ...mediaList]);
    setNewUrl("");
    setNewTitle("");
    showToast({
      type: "success",
      title: "Asset Uploaded",
      message: "Media asset has been added to Supabase Storage registry.",
    });
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    showToast({
      type: "info",
      title: "URL Copied",
      message: "Public asset URL copied to clipboard.",
    });
  };

  const handleDelete = (id: string) => {
    setMediaList(mediaList.filter((m) => m.id !== id));
    showToast({
      type: "info",
      title: "Asset Removed",
      message: "Media asset deleted from registry.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#111827]">
            Media Storage Library
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Manage high-resolution photography stored on Supabase Storage buckets.
          </p>
        </div>
      </div>

      {/* Upload Zone */}
      <form onSubmit={handleAddMedia} className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm space-y-4">
        <h3 className="font-serif text-base font-semibold text-[#111827]">
          Attach New Media Asset
        </h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Asset Title / Caption"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="sm:w-1/3 text-xs px-4 py-2.5 rounded-xl border border-black/10 focus:outline-none"
          />
          <input
            type="url"
            placeholder="Public CDN Image URL..."
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            className="flex-1 text-xs px-4 py-2.5 rounded-xl border border-black/10 focus:outline-none"
            required
          />
          <Button type="submit" size="sm" shimmer>
            Register Asset
          </Button>
        </div>
      </form>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {mediaList.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden flex flex-col group"
          >
            <div className="relative aspect-[4/5] bg-[#FAFAFA] overflow-hidden">
              <Image src={item.url} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>

            <div className="p-3 flex items-center justify-between bg-white text-xs">
              <span className="font-medium text-foreground truncate pr-2" title={item.title}>
                {item.title}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => copyUrl(item.url)}
                  className="p-1.5 rounded hover:bg-black/5 text-[#6B7280] hover:text-[#111827]"
                  title="Copy Public URL"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded hover:bg-destructive/10 text-[#6B7280] hover:text-destructive"
                  title="Delete Asset"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
