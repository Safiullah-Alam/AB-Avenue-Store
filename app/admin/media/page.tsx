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

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((f) => formData.append("files", f));

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Upload failed");
      }

      const uploaded: string[] = data.urls || (data.url ? [data.url] : []);
      const newItems = uploaded.map((url, i) => ({
        id: "m-" + Date.now() + "-" + i,
        url,
        title: "Product Image " + (mediaList.length + i + 1),
      }));

      setMediaList([...newItems, ...mediaList]);
      showToast({
        type: "success",
        title: "Uploaded to Supabase",
        message: `${uploaded.length} new photos saved in Supabase storage!`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      showToast({
        type: "error",
        title: "Upload Failed",
        message: msg,
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

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
            Manage photography stored directly on Supabase Storage (product-images bucket).
          </p>
        </div>
      </div>

      {/* Direct Device Upload Card */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFileUpload(e.target.files)}
        accept="image/*"
        multiple
        className="hidden"
      />
      <div
        onClick={() => fileInputRef.current?.click()}
        className="bg-white p-6 rounded-3xl border-2 border-dashed border-black/15 hover:border-accent hover:bg-accent/5 transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-2"
      >
        <p className="text-sm font-semibold text-foreground">
          {isUploading ? "Uploading photos to Supabase..." : "Tap or Click to Upload Photos from Phone or PC"}
        </p>
        <p className="text-xs text-[#6B7280]">
          Photos will be uploaded directly into the Supabase product-images bucket.
        </p>
        <Button size="sm" variant="outline" className="mt-1 pointer-events-none bg-white">
          Browse Images
        </Button>
      </div>

      {/* Manual URL Form */}
      <form onSubmit={handleAddMedia} className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm space-y-3">
        <h3 className="font-serif text-sm font-semibold text-[#111827]">
          Or Register External Public URL
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
          />
          <Button type="submit" size="sm" variant="secondary">
            Register URL
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
