"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Package,
} from "lucide-react";
import { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { getStoredProducts, fetchAllProducts, deleteProduct, saveProduct } from "@/lib/products";

export default function AdminProductsPage() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [deleteModalProduct, setDeleteModalProduct] = useState<Product | null>(null);

  const loadProducts = async () => {
    setIsLoading(true);
    const list = await fetchAllProducts();
    setProducts(list || getStoredProducts());
    setIsLoading(false);
  };

  useEffect(() => {
    loadProducts();

    const handleUpdate = () => {
      setProducts(getStoredProducts());
    };
    window.addEventListener("products_updated", handleUpdate);
    return () => window.removeEventListener("products_updated", handleUpdate);
  }, []);

  // Filter products
  const filtered = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      selectedStatus === "all" ? true : p.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const toggleSelectAll = () => {
    if (selectedProducts.length === filtered.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filtered.map((p) => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleDeleteProduct = async (id: string) => {
    await deleteProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setDeleteModalProduct(null);
    showToast({
      type: "success",
      title: "Product Deleted",
      message: "The product has been removed from your store.",
    });
  };

  const handleBulkDelete = async () => {
    for (const id of selectedProducts) {
      await deleteProduct(id);
    }
    setProducts((prev) => prev.filter((p) => !selectedProducts.includes(p.id)));
    setSelectedProducts([]);
    showToast({
      type: "success",
      title: "Bulk Deletion Complete",
      message: `${selectedProducts.length} products were deleted.`,
    });
  };

  const handleBulkStatusChange = async (status: "active" | "draft") => {
    for (const id of selectedProducts) {
      const p = products.find((item) => item.id === id);
      if (p) {
        await saveProduct({ ...p, status });
      }
    }
    setProducts((prev) =>
      prev.map((p) =>
        selectedProducts.includes(p.id) ? { ...p, status } : p
      )
    );
    setSelectedProducts([]);
    showToast({
      type: "success",
      title: "Status Updated",
      message: `Selected products updated to ${status}.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#111827]">
            Product Catalog
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Manage your store pieces, stock quantities, variants, and pricing ({products.length} listed).
          </p>
        </div>

        <Link href="/admin/products/new">
          <Button shimmer size="md" className="gap-2">
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Button>
        </Link>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-black/5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title or SKU..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-black/10 text-xs focus:outline-none focus:border-accent bg-[#F9FAFB]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-black/10 text-xs bg-white text-[#4B5563] focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
          </select>

          {selectedProducts.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkStatusChange("active")}
                className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 font-semibold text-xs hover:bg-emerald-100 transition-colors"
              >
                Publish ({selectedProducts.length})
              </button>
              <button
                onClick={() => handleBulkStatusChange("draft")}
                className="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200 transition-colors"
              >
                Draft ({selectedProducts.length})
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-2 rounded-xl bg-rose-50 text-rose-700 font-semibold text-xs hover:bg-rose-100 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Catalog Table or Empty State */}
      <div className="bg-white rounded-3xl border border-black/5 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center text-xs text-[#6B7280]">
            Loading catalog...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 px-4 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Package className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold text-[#111827]">
                {products.length === 0 ? "Catalog is Empty (0 Products)" : "No matching products"}
              </h3>
              <p className="text-xs text-[#6B7280] max-w-sm mx-auto mt-1">
                {products.length === 0
                  ? "You are starting fresh. Click 'Add First Product' to publish your items to the storefront."
                  : "No products matched your current search filters. Try clearing your search query."}
              </p>
            </div>
            {products.length === 0 && (
              <Link href="/admin/products/new">
                <Button shimmer size="md" className="gap-2 mx-auto">
                  <Plus className="w-4 h-4" />
                  <span>Add First Product</span>
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F9FAFB] border-b border-black/5 text-[#6B7280] uppercase tracking-wider font-semibold text-[10px]">
                <tr>
                  <th className="p-4 w-10">
                    <input
                      type="checkbox"
                      checked={
                        filtered.length > 0 &&
                        selectedProducts.length === filtered.length
                      }
                      onChange={toggleSelectAll}
                      className="rounded border-black/20 text-accent focus:ring-accent"
                    />
                  </th>
                  <th className="p-4">Product</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {filtered.map((product) => {
                  const isSelected = selectedProducts.includes(product.id);
                  const mainImage =
                    product.images && product.images.length > 0
                      ? product.images[0].image_url
                      : "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&q=80";

                  return (
                    <tr
                      key={product.id}
                      className={`hover:bg-[#F9FAFB] transition-colors ${
                        isSelected ? "bg-accent/5" : ""
                      }`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(product.id)}
                          className="rounded border-black/20 text-accent focus:ring-accent"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-black/5">
                            <Image
                              src={mainImage}
                              alt={product.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-[#111827] line-clamp-1">
                              {product.title}
                            </p>
                            <p className="text-[11px] text-[#6B7280] line-clamp-1">
                              {product.description || "No description provided"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-[#4B5563]">
                        {product.sku}
                      </td>
                      <td className="p-4">
                        <span
                          className={`font-semibold ${
                            product.stock_quantity <= 3
                              ? "text-rose-600 font-bold"
                              : "text-[#111827]"
                          }`}
                        >
                          {product.stock_quantity} units
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-[#111827]">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                            product.status === "active"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {product.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/products/${product.slug}`}
                            target="_blank"
                            title="View on Storefront"
                            className="p-1.5 rounded-lg hover:bg-black/5 text-[#6B7280] hover:text-[#111827]"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/products/new?edit=${product.id}`}
                            title="Edit Product"
                            className="p-1.5 rounded-lg hover:bg-black/5 text-[#6B7280] hover:text-[#111827]"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteModalProduct(product)}
                            title="Delete Product"
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-[#6B7280] hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm Delete Modal */}
      {deleteModalProduct && (
        <Modal
          isOpen={true}
          onClose={() => setDeleteModalProduct(null)}
          title="Delete Product"
        >
          <div className="space-y-4 pt-2">
            <p className="text-xs text-[#6B7280]">
              Are you sure you want to delete{" "}
              <strong className="text-[#111827]">
                {deleteModalProduct.title}
              </strong>
              ? This product will be immediately removed from your catalog and storefront.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteModalProduct(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-rose-600 hover:bg-rose-700 text-white"
                onClick={() => handleDeleteProduct(deleteModalProduct.id)}
              >
                Delete Product
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
