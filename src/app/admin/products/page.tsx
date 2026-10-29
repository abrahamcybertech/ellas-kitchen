'use client';

import React, { useState, useEffect } from 'react';
import { Product, Category } from '@/lib/types';
import {
  UtensilsCrossed,
  Plus,
  Edit,
  Trash2,
  Sparkles,
  Check,
  X,
  AlertCircle,
  Clock,
  Eye,
  EyeOff,
  Filter,
} from 'lucide-react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [imageUrl, setImageUrl] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [dietaryTagsStr, setDietaryTagsStr] = useState('');

  // Variations & Extras Dynamic Rows
  const [variations, setVariations] = useState<Array<{ name: string; price_modifier: number; is_default: boolean }>>([]);
  const [extras, setExtras] = useState<Array<{ name: string; price: number; max_quantity: number }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/products?all=true'),
        fetch('/api/categories?all=true'),
      ]);

      const prodData = await prodRes.json();
      const catData = await catRes.json();

      if (prodData.success) setProducts(prodData.data);
      if (catData.success) setCategories(catData.data);
    } catch {
      setErrorMessage('Failed to fetch product data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setSlug('');
    setCategoryId(categories[0]?.id || '');
    setDescription('');
    setPrice(3500);
    setImageUrl('');
    setPrepTime('20 to 25 mins');
    setIsAvailable(true);
    setIsFeatured(false);
    setDietaryTagsStr('Halal');
    setVariations([]);
    setExtras([]);
    setModalOpen(true);
    setErrorMessage(null);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setSlug(p.slug);
    setCategoryId(p.category_id);
    setDescription(p.description || '');
    setPrice(p.price);
    setImageUrl(p.image_url || '');
    setPrepTime(p.prep_time || '');
    setIsAvailable(Boolean(p.is_available));
    setIsFeatured(Boolean(p.is_featured));
    setDietaryTagsStr(p.dietary_tags ? p.dietary_tags.join(', ') : '');
    setVariations(
      p.variations?.map((v) => ({
        name: v.name,
        price_modifier: v.price_modifier,
        is_default: Boolean(v.is_default),
      })) || []
    );
    setExtras(
      p.extras?.map((e) => ({
        name: e.name,
        price: e.price,
        max_quantity: e.max_quantity || 5,
      })) || []
    );
    setModalOpen(true);
    setErrorMessage(null);
  };

  const addVariationRow = () => {
    setVariations((prev) => [
      ...prev,
      { name: '', price_modifier: 0, is_default: prev.length === 0 },
    ]);
  };

  const removeVariationRow = (idx: number) => {
    setVariations((prev) => prev.filter((_, i) => i !== idx));
  };

  const addExtraRow = () => {
    setExtras((prev) => [...prev, { name: '', price: 800, max_quantity: 4 }]);
  };

  const removeExtraRow = (idx: number) => {
    setExtras((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const parsedTags = dietaryTagsStr
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      name,
      slug: slug || undefined,
      category_id: categoryId,
      description,
      price: Number(price),
      image_url: imageUrl,
      prep_time: prepTime,
      is_available: isAvailable,
      is_featured: isFeatured,
      dietary_tags: parsedTags,
      variations: variations.filter((v) => v.name.trim().length > 0),
      extras: extras.filter((e) => e.name.trim().length > 0),
    };

    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save product');
      }

      setSuccessMessage(editingProduct ? 'Product updated successfully' : 'Product created successfully');
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (p: Product) => {
    if (!confirm(`Are you sure you want to delete product "${p.name}"? Historical orders will preserve their item snapshot.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/products/${p.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete product');
      }
      setSuccessMessage('Product deleted successfully');
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleAvailability = async (p: Product) => {
    try {
      const res = await fetch(`/api/products/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_available: !p.is_available }),
      });
      const data = await res.json();
      if (data.success) fetchData();
    } catch {
      alert('Failed to update availability');
    }
  };

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category_id === selectedCategory)
    : products;

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-brand-cream-50">
            Product &amp; Dish Management
          </h1>
          <p className="text-xs text-brand-brown-300 mt-1">
            Configure Nigerian dishes, pricing in Naira, portions, protein variations, and extras.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 rounded-xl bg-brand-gold-500 hover:bg-brand-gold-400 text-brand-dark-950 font-bold text-xs shadow-gold-glow flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add New Dish</span>
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

      {/* Filter by Category */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
            selectedCategory === ''
              ? 'bg-brand-gold-500 text-brand-dark-950'
              : 'bg-brand-brown-900 text-brand-cream-200 hover:bg-brand-brown-800'
          }`}
        >
          All Categories ({products.length})
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === c.id
                ? 'bg-brand-gold-500 text-brand-dark-950'
                : 'bg-brand-brown-900 text-brand-cream-200 hover:bg-brand-brown-800'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Products Table */}
      <div className="bg-brand-dark-900 border border-brand-brown-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-brand-brown-950/80 border-b border-brand-brown-800 text-brand-brown-400 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Dish</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Options</th>
                <th className="py-3 px-4">Availability</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-brown-800/40">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-brand-brown-900/30 transition">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      {p.image_url ? (
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="w-12 h-12 rounded-xl object-cover bg-brand-dark-950 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-brand-brown-900 flex items-center justify-center text-brand-gold-400 font-bold">
                          EK
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-brand-cream-50 text-sm block">
                            {p.name}
                          </span>
                          {Boolean(p.is_featured) && (
                            <Sparkles className="w-3.5 h-3.5 text-brand-gold-400 fill-current" />
                          )}
                        </div>
                        {p.prep_time && (
                          <span className="text-[10px] text-brand-brown-400">
                            Prep: {p.prep_time}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-brand-gold-300 font-medium">
                    {p.category_name}
                  </td>
                  <td className="py-4 px-4 font-bold text-brand-cream-50 text-sm">
                    ₦{p.price.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-brand-brown-300">
                    <span className="block">{p.variations?.length || 0} variations</span>
                    <span className="text-[10px] text-brand-brown-400">{p.extras?.length || 0} extras</span>
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => handleToggleAvailability(p)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition ${
                        p.is_available
                          ? 'bg-green-950/80 text-green-300 border border-green-800'
                          : 'bg-red-950/80 text-red-300 border border-red-800'
                      }`}
                    >
                      {p.is_available ? 'Available' : 'Unavailable'}
                    </button>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 rounded-lg bg-brand-dark-950 border border-brand-brown-800 text-brand-cream-200 hover:text-brand-gold-400 hover:border-brand-gold-500 transition"
                        title="Edit Dish"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(p)}
                        className="p-1.5 rounded-lg bg-brand-dark-950 border border-brand-brown-800 text-brand-cream-200 hover:text-red-400 hover:border-red-800 transition"
                        title="Delete Dish"
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

      {/* Modal Dialog for Create / Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-brand-dark-950 border border-brand-gold-500/40 rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-brand-brown-800 pb-4">
              <h3 className="font-serif text-xl font-bold text-brand-cream-50">
                {editingProduct ? 'Edit Dish' : 'Add New Nigerian Dish'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-brand-brown-400 hover:text-white">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-brand-cream-200">
                    Dish Name <span className="text-brand-gold-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!editingProduct) {
                        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
                      }
                    }}
                    placeholder="Party Jollof Rice with Crispy Chicken"
                    className="w-full bg-brand-dark-900 border border-brand-brown-800 rounded-xl px-4 py-2.5 text-xs text-brand-cream-100 focus:outline-none focus:border-brand-gold-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-brand-cream-200">
                    Category <span className="text-brand-gold-400">*</span>
                  </label>
                  <select
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-brand-dark-900 border border-brand-brown-800 rounded-xl px-4 py-2.5 text-xs text-brand-cream-100 focus:outline-none focus:border-brand-gold-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-brand-cream-200">
                    Base Price in Naira (₦) <span className="text-brand-gold-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-brand-dark-900 border border-brand-brown-800 rounded-xl px-4 py-2.5 text-xs text-brand-cream-100 focus:outline-none focus:border-brand-gold-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-brand-cream-200">
                    Estimated Prep Time
                  </label>
                  <input
                    type="text"
                    value={prepTime}
                    onChange={(e) => setPrepTime(e.target.value)}
                    placeholder="20 to 25 mins"
                    className="w-full bg-brand-dark-900 border border-brand-brown-800 rounded-xl px-4 py-2.5 text-xs text-brand-cream-100 focus:outline-none focus:border-brand-gold-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-brand-cream-200">
                    Dietary Badges (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={dietaryTagsStr}
                    onChange={(e) => setDietaryTagsStr(e.target.value)}
                    placeholder="Halal, Spiced, Gluten Free"
                    className="w-full bg-brand-dark-900 border border-brand-brown-800 rounded-xl px-4 py-2.5 text-xs text-brand-cream-100 focus:outline-none focus:border-brand-gold-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-brand-cream-200">
                  Dish Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Appetizing description of ingredients and presentation..."
                  className="w-full bg-brand-dark-900 border border-brand-brown-800 rounded-xl px-4 py-2.5 text-xs text-brand-cream-100 focus:outline-none focus:border-brand-gold-500 h-20 resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-brand-cream-200">
                  Food Photography URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-brand-dark-900 border border-brand-brown-800 rounded-xl px-4 py-2.5 text-xs text-brand-cream-100 focus:outline-none focus:border-brand-gold-500"
                />
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-brand-cream-200 font-semibold">
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-gold-500 focus:ring-brand-gold-500"
                  />
                  <span>Available for Ordering</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-brand-cream-200 font-semibold">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-gold-500 focus:ring-brand-gold-500"
                  />
                  <span>Featured on Homepage</span>
                </label>
              </div>

              {/* Variations Sub-Editor */}
              <div className="pt-4 border-t border-brand-brown-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-gold-400">
                    Portion or Protein Variations
                  </span>
                  <button
                    type="button"
                    onClick={addVariationRow}
                    className="text-xs text-brand-gold-400 hover:text-white flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Variation</span>
                  </button>
                </div>

                {variations.map((v, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="Variation Name (e.g. With Goat Meat)"
                      value={v.name}
                      onChange={(e) => {
                        const copy = [...variations];
                        copy[i].name = e.target.value;
                        setVariations(copy);
                      }}
                      className="flex-1 bg-brand-dark-900 border border-brand-brown-800 rounded-lg px-3 py-1.5 text-xs text-brand-cream-100"
                    />
                    <input
                      type="number"
                      placeholder="+ Price"
                      value={v.price_modifier}
                      onChange={(e) => {
                        const copy = [...variations];
                        copy[i].price_modifier = Number(e.target.value);
                        setVariations(copy);
                      }}
                      className="w-24 bg-brand-dark-900 border border-brand-brown-800 rounded-lg px-3 py-1.5 text-xs text-brand-cream-100"
                    />
                    <button
                      type="button"
                      onClick={() => removeVariationRow(i)}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Extras Sub-Editor */}
              <div className="pt-4 border-t border-brand-brown-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-gold-400">
                    Optional Add-ons and Extras
                  </span>
                  <button
                    type="button"
                    onClick={addExtraRow}
                    className="text-xs text-brand-gold-400 hover:text-white flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Extra</span>
                  </button>
                </div>

                {extras.map((e, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="Extra Name (e.g. Fried Sweet Plantain)"
                      value={e.name}
                      onChange={(eTarget) => {
                        const copy = [...extras];
                        copy[i].name = eTarget.target.value;
                        setExtras(copy);
                      }}
                      className="flex-1 bg-brand-dark-900 border border-brand-brown-800 rounded-lg px-3 py-1.5 text-xs text-brand-cream-100"
                    />
                    <input
                      type="number"
                      placeholder="Price"
                      value={e.price}
                      onChange={(eTarget) => {
                        const copy = [...extras];
                        copy[i].price = Number(eTarget.target.value);
                        setExtras(copy);
                      }}
                      className="w-24 bg-brand-dark-900 border border-brand-brown-800 rounded-lg px-3 py-1.5 text-xs text-brand-cream-100"
                    />
                    <button
                      type="button"
                      onClick={() => removeExtraRow(i)}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
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
                  {isSubmitting ? 'Saving...' : editingProduct ? 'Save Dish' : 'Create Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
