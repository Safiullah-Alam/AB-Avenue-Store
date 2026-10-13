"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Plus, Trash2 } from "lucide-react";
import { initialCategories } from "@/lib/mock-data";
import { Category } from "@/types";
import { slugify } from "@/lib/utils";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";

export default function AdminCategoriesPage() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const created: Category = {
      id: "cat-" + Date.now(),
      name,
      slug: slug || slugify(name),
      description,
      image_url: imageUrl,
      sort_order: categories.length + 1,
      created_at: new Date().toISOString(),
    };

    setCategories([...categories, created]);
    setName("");
    setSlug("");
    setDescription("");
    setIsAdding(false);

    showToast({
      type: "success",
      title: "Category Added",
      message: `${name} has been created.`,
    });
  };

  const handleDelete = (id: string) => {
    setCategories(categories.filter((c) => c.id !== id));
    showToast({
      type: "info",
      title: "Category Deleted",
      message: "The category has been removed.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#111827]">
            Category Disciplines
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Organize catalog pieces into departments and collections.
          </p>
        </div>
        {!isAdding && (
          <Button size="md" onClick={() => setIsAdding(true)} className="gap-1.5 shadow-sm">
            <Plus className="w-4 h-4" />
            <span>Create Category</span>
          </Button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleCreate} className="bg-white p-6 sm:p-8 rounded-3xl border border-black/5 shadow-sm space-y-4 max-w-2xl">
          <h3 className="font-serif text-lg font-semibold text-[#111827]">New Category</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Category Name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSlug(slugify(e.target.value));
              }}
              required
            />
            <Input
              label="URL Slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />
          </div>
          <Input
            label="Cover Image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
          <div>
            <label className="caption-label block mb-1">Brief Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-black/10 focus:outline-none"
            />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAdding(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" shimmer>
              Save Category
            </Button>
          </div>
        </form>
      )}

      {/* Categories Table */}
      <div className="bg-white rounded-3xl border border-black/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-black/5 bg-[#FAFAFA] text-[#6B7280] font-semibold uppercase tracking-wider text-[10px]">
                <th className="p-4">Cover</th>
                <th className="py-4 pr-4">Category Name</th>
                <th className="py-4 pr-4">Slug</th>
                <th className="py-4 pr-4">Description</th>
                <th className="py-4 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="p-4">
                    <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-[#FAFAFA] border border-black/5">
                      {cat.image_url && <Image src={cat.image_url} alt="" fill className="object-cover" />}
                    </div>
                  </td>
                  <td className="py-4 pr-4 font-serif font-medium text-foreground text-sm">
                    {cat.name}
                  </td>
                  <td className="py-4 pr-4 font-mono text-[#6B7280]">{cat.slug}</td>
                  <td className="py-4 pr-4 text-foreground-secondary max-w-xs truncate font-light">
                    {cat.description}
                  </td>
                  <td className="py-4 pr-4 text-right">
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10"
                      title="Delete category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
