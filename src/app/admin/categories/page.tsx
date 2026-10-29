'use client';

import React, { useState, useEffect } from 'react';
import { Category } from '@/lib/types';
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  AlertCircle,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  ShieldAlert,
} from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/categories?all=true');
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch {
      setErrorMessage('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setImageUrl('');
    setDisplayOrder(categories.length + 1);
    setIsActive(true);
    setModalOpen(true);
    setErrorMessage(null);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setImageUrl(cat.image_url || '');
    setDisplayOrder(cat.display_order);
    setIsActive(Boolean(cat.is_active));
    setModalOpen(true);
    setErrorMessage(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const payload = {
      name,
      slug: slug || undefined,
      description,
      image_url: imageUrl,
      display_order: displayOrder,
      is_active: isActive,
    };

    try {
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save category');
      }

      setSuccessMessage(editingCategory ? 'Category updated successfully' : 'Category created successfully');
      setModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    if (!confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/categories/${cat.id}`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.error || 'Unable to delete category');
        return;
      }

      setSuccessMessage('Category deleted successfully');
      fetchCategories();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleActive = async (cat: Category) => {
    try {
      const res = await fetch(`/api/categories/${cat.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !cat.is_active }),
      });
      const data = await res.json();
      if (data.success) {
        fetchCategories();
      }
    } catch {
      alert('Failed to toggle status');
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-brand-cream-50">
            Dynamic Category Management
          </h1>
          <p className="text-xs text-brand-brown-300 mt-1">
            Create, reorder, and configure customer facing menu categories without modifying codebase.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 rounded-xl bg-brand-gold-500 hover:bg-brand-gold-400 text-brand-dark-950 font-bold text-xs shadow-gold-glow flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Create New Category</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-3.5 bg-green-950/60 border border-green-800 text-green-200 text-xs rounded-xl flex items-center justify-between">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} className="text-green-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Categories Table */}
      <div className="bg-brand-dark-900 border border-brand-brown-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-brand-brown-950/80 border-b border-brand-brown-800 text-brand-brown-400 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-4">Category Name</th>
                <th className="py-3 px-4">Slug</th>
                <th className="py-3 px-4">Dishes Count</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-brown-800/40">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-brand-brown-900/30 transition">
                  <td className="py-4 px-4 font-bold text-brand-gold-400 font-mono">
                    #{cat.display_order}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      {cat.image_url ? (
                        <img
                          src={cat.image_url}
                          alt={cat.name}
                          className="w-10 h-10 rounded-lg object-cover bg-brand-dark-950 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-brand-brown-900 flex items-center justify-center text-brand-gold-400 font-bold">
                          EK
                        </div>
                      )}
                      <div>
                        <span className="font-bold text-brand-cream-50 text-sm block">
                          {cat.name}
                        </span>
                        {cat.description && (
                          <span className="text-[11px] text-brand-brown-400 line-clamp-1 max-w-xs">
                            {cat.description}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-mono text-brand-brown-300">
                    {cat.slug}
                  </td>
                  <td className="py-4 px-4 font-semibold text-brand-cream-100">
                    {cat.product_count || 0} products
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => handleToggleActive(cat)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition ${
                        cat.is_active
                          ? 'bg-green-950/80 text-green-300 border border-green-800'
                          : 'bg-brand-brown-900 text-brand-brown-400 border border-brand-brown-800'
                      }`}
                    >
                      {cat.is_active ? (
                        <>
                          <Eye className="w-3 h-3 text-green-400" />
                          <span>Published</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3 text-brand-brown-400" />
                          <span>Hidden / Draft</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(cat)}
                        className="p-1.5 rounded-lg bg-brand-dark-950 border border-brand-brown-800 text-brand-cream-200 hover:text-brand-gold-400 hover:border-brand-gold-500 transition"
                        title="Edit Category"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(cat)}
                        className="p-1.5 rounded-lg bg-brand-dark-950 border border-brand-brown-800 text-brand-cream-200 hover:text-red-400 hover:border-red-800 transition"
                        title="Delete Category (Safeguard Protected)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-brand-dark-950 border border-brand-gold-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-brand-brown-800 pb-4">
              <h3 className="font-serif text-xl font-bold text-brand-cream-50">
                {editingCategory ? 'Edit Menu Category' : 'Create New Menu Category'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-brand-brown-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-950/60 border border-red-800 text-red-200 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-brand-cream-200">
                  Category Name <span className="text-brand-gold-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!editingCategory) {
                      setSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/(^-|-$)+/g, '')
                      );
                    }
                  }}
                  placeholder="Example: Gourmet Grills & Suya"
                  className="w-full bg-brand-dark-900 border border-brand-brown-800 rounded-xl px-4 py-2.5 text-xs text-brand-cream-100 focus:outline-none focus:border-brand-gold-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-brand-cream-200">
                  URL Slug (Auto-generated or custom)
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="gourmet-grills-and-suya"
                  className="w-full bg-brand-dark-900 border border-brand-brown-800 rounded-xl px-4 py-2.5 text-xs text-brand-cream-100 font-mono focus:outline-none focus:border-brand-gold-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-brand-cream-200">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short introductory summary for customer menu filtering..."
                  className="w-full bg-brand-dark-900 border border-brand-brown-800 rounded-xl px-4 py-2.5 text-xs text-brand-cream-100 focus:outline-none focus:border-brand-gold-500 h-20 resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-brand-cream-200">
                  Category Photography URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-brand-dark-900 border border-brand-brown-800 rounded-xl px-4 py-2.5 text-xs text-brand-cream-100 focus:outline-none focus:border-brand-gold-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-brand-cream-200">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-brand-dark-900 border border-brand-brown-800 rounded-xl px-4 py-2.5 text-xs text-brand-cream-100 focus:outline-none focus:border-brand-gold-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-brand-cream-200">
                    Publish Status
                  </label>
                  <select
                    value={isActive ? 'true' : 'false'}
                    onChange={(e) => setIsActive(e.target.value === 'true')}
                    className="w-full bg-brand-dark-900 border border-brand-brown-800 rounded-xl px-4 py-2.5 text-xs text-brand-cream-100 focus:outline-none focus:border-brand-gold-500"
                  >
                    <option value="true">Active and Published</option>
                    <option value="false">Hidden / Draft</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-brand-brown-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-brand-brown-300 hover:bg-brand-brown-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 rounded-xl bg-brand-gold-500 hover:bg-brand-gold-400 text-brand-dark-950 font-bold text-xs"
                >
                  {isSubmitting ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
