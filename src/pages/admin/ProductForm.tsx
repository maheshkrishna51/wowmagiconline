import { useEffect, useState } from 'react';
import { Save, ArrowLeft, X, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Variant {
  id?: string;
  variant_name: string;
  price: string;
  compare_price: string;
  sku: string;
  stock_quantity: string;
  display_order: number;
  is_active: boolean;
}

interface ProductFormProps {
  productId?: string;
  onBack: () => void;
}

export default function ProductForm({ productId, onBack }: ProductFormProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageInput, setImageInput] = useState('');
  const [variants, setVariants] = useState<Variant[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    short_description: '',
    price: '',
    cost_price: '',
    compare_price: '',
    category_id: '',
    sku: '',
    stock_quantity: '',
    low_stock_threshold: '5',
    images: [] as string[],
    is_active: true,
    is_featured: false,
    weight: '',
    dimensions: '',
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    display_order: '0',
  });

  useEffect(() => {
    loadCategories();
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const loadCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('display_order');
    if (data) setCategories(data);
  };

  const loadProduct = async () => {
    if (!productId) return;

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .maybeSingle();

    if (error) {
      console.error('Error loading product:', error);
      alert('Error loading product: ' + error.message);
      return;
    }

    if (data) {
      setFormData({
        name: data.name,
        description: data.description || '',
        short_description: data.short_description || '',
        price: data.price.toString(),
        cost_price: data.cost_price?.toString() || '',
        compare_price: data.compare_price?.toString() || '',
        category_id: data.category_id,
        sku: data.sku,
        stock_quantity: data.stock_quantity.toString(),
        low_stock_threshold: data.low_stock_threshold.toString(),
        images: data.images || [],
        is_active: data.is_active,
        is_featured: data.is_featured,
        weight: data.weight || '',
        dimensions: data.dimensions || '',
        seo_title: data.seo_title || '',
        seo_description: data.seo_description || '',
        seo_keywords: data.seo_keywords || '',
        meta_title: data.meta_title || '',
        meta_description: data.meta_description || '',
        meta_keywords: data.meta_keywords || '',
        display_order: data.display_order?.toString() || '0',
      });
    }

    const { data: variantsData } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId)
      .order('display_order');

    if (variantsData) {
      setVariants(variantsData.map(v => ({
        id: v.id,
        variant_name: v.variant_name,
        price: v.price.toString(),
        compare_price: v.compare_price?.toString() || '',
        sku: v.sku || '',
        stock_quantity: v.stock_quantity.toString(),
        display_order: v.display_order,
        is_active: v.is_active,
      })));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const generateSlug = (name: string) => {
      if (!name || !name.trim()) return 'product';
      return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'product';
    };

    const productData = {
      name: formData.name,
      slug: generateSlug(formData.name),
      description: formData.description,
      short_description: formData.short_description,
      price: parseFloat(formData.price),
      cost_price: formData.cost_price ? parseFloat(formData.cost_price) : 0,
      compare_price: formData.compare_price ? parseFloat(formData.compare_price) : null,
      category_id: formData.category_id,
      sku: formData.sku,
      stock_quantity: parseInt(formData.stock_quantity),
      low_stock_threshold: parseInt(formData.low_stock_threshold),
      images: formData.images,
      is_active: formData.is_active,
      is_featured: formData.is_featured,
      weight: formData.weight,
      dimensions: formData.dimensions,
      seo_title: formData.seo_title,
      seo_description: formData.seo_description,
      seo_keywords: formData.seo_keywords,
      meta_title: formData.meta_title,
      meta_description: formData.meta_description,
      meta_keywords: formData.meta_keywords,
      display_order: parseInt(formData.display_order),
    };

    let error;
    let savedProductId = productId;

    if (productId) {
      ({ error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', productId));
    } else {
      const { data, error: insertError } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();
      error = insertError;
      if (data) savedProductId = data.id;
    }

    if (error) {
      setLoading(false);
      alert('Error saving product: ' + error.message);
      return;
    }

    if (savedProductId && variants.length > 0) {
      const existingVariantIds = variants.filter(v => v.id).map(v => v.id);

      if (productId) {
        const { data: currentVariants } = await supabase
          .from('product_variants')
          .select('id')
          .eq('product_id', productId);

        const toDelete = currentVariants?.filter(cv => !existingVariantIds.includes(cv.id)).map(cv => cv.id) || [];

        if (toDelete.length > 0) {
          await supabase
            .from('product_variants')
            .delete()
            .in('id', toDelete);
        }
      }

      for (const variant of variants) {
        const variantData = {
          product_id: savedProductId,
          variant_name: variant.variant_name,
          price: parseFloat(variant.price),
          compare_price: variant.compare_price ? parseFloat(variant.compare_price) : null,
          sku: variant.sku,
          stock_quantity: parseInt(variant.stock_quantity),
          display_order: variant.display_order,
          is_active: variant.is_active,
        };

        if (variant.id) {
          await supabase
            .from('product_variants')
            .update(variantData)
            .eq('id', variant.id);
        } else {
          await supabase
            .from('product_variants')
            .insert([variantData]);
        }
      }
    }

    setLoading(false);
    alert(productId ? 'Product updated successfully!' : 'Product created successfully!');
    onBack();
  };

  const addImage = () => {
    if (imageInput.trim()) {
      setFormData({
        ...formData,
        images: [...formData.images, imageInput.trim()],
      });
      setImageInput('');
    }
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        variant_name: '',
        price: '',
        compare_price: '',
        sku: '',
        stock_quantity: '0',
        display_order: variants.length,
        is_active: true,
      },
    ]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: keyof Variant, value: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  return (
    <div>
      <div className="flex items-center mb-8">
        <button
          onClick={onBack}
          className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          {productId ? 'Edit Product' : 'Add New Product'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Short Description
              </label>
              <textarea
                value={formData.short_description}
                onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                rows={2}
                placeholder="Brief description for product cards"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cost Price *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.cost_price}
                  onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900"
                  placeholder="Wholesale/manufacturing cost"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Compare At Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.compare_price}
                  onChange={(e) => setFormData({ ...formData, compare_price: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900"
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Inventory</h2>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                SKU *
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Stock Quantity *
              </label>
              <input
                type="number"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Low Stock Alert
              </label>
              <input
                type="number"
                value={formData.low_stock_threshold}
                onChange={(e) => setFormData({ ...formData, low_stock_threshold: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Images</h2>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Add Image URL
            </label>
            <div className="flex space-x-2">
              <input
                type="url"
                value={imageInput}
                onChange={(e) => setImageInput(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900"
              />
              <button
                type="button"
                onClick={addImage}
                className="px-6 py-2 bg-amber-900 text-white rounded-lg hover:bg-amber-800 transition"
              >
                Add
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Recommended resolution: 800x800px (1:1 aspect ratio) for best display
            </p>
          </div>

          {formData.images.length > 0 && (
            <div className="grid grid-cols-4 gap-4">
              {formData.images.map((img, index) => (
                <div key={index} className="relative group">
                  <img
                    src={img}
                    alt={`Product ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Additional Details</h2>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Weight
              </label>
              <input
                type="text"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                placeholder="e.g., 500g"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Dimensions
              </label>
              <input
                type="text"
                value={formData.dimensions}
                onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                placeholder="e.g., 10x10x5 cm"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Display Order
              </label>
              <input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">SEO</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                SEO Title
              </label>
              <input
                type="text"
                value={formData.seo_title}
                onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                placeholder="Page title for search engines"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                SEO Description
              </label>
              <textarea
                value={formData.seo_description}
                onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                rows={3}
                placeholder="Description for search engine results"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                SEO Keywords
              </label>
              <input
                type="text"
                value={formData.seo_keywords}
                onChange={(e) => setFormData({ ...formData, seo_keywords: e.target.value })}
                placeholder="chocolate, gift, custom"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Meta Title (Legacy)
              </label>
              <input
                type="text"
                value={formData.meta_title}
                onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Meta Description (Legacy)
              </label>
              <textarea
                value={formData.meta_description}
                onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Meta Keywords (Legacy)
              </label>
              <input
                type="text"
                value={formData.meta_keywords}
                onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                placeholder="chocolate, gift, custom"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Variants (Pack Size)</h2>
            <button
              type="button"
              onClick={addVariant}
              className="flex items-center space-x-2 px-4 py-2 bg-amber-900 text-white rounded-lg hover:bg-amber-800 transition"
            >
              <Plus size={18} />
              <span>Add Variant</span>
            </button>
          </div>

          {variants.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No variants added. Add variants for different pack sizes with different prices.
            </p>
          ) : (
            <div className="space-y-4">
              {variants.map((variant, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-3">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Pack Size *
                      </label>
                      <input
                        type="text"
                        value={variant.variant_name}
                        onChange={(e) => updateVariant(index, 'variant_name', e.target.value)}
                        placeholder="e.g., 250g, 500g"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900"
                        required
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Price *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={variant.price}
                        onChange={(e) => updateVariant(index, 'price', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900"
                        required
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Compare Price
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={variant.compare_price}
                        onChange={(e) => updateVariant(index, 'compare_price', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        SKU
                      </label>
                      <input
                        type="text"
                        value={variant.sku}
                        onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Stock
                      </label>
                      <input
                        type="number"
                        value={variant.stock_quantity}
                        onChange={(e) => updateVariant(index, 'stock_quantity', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900"
                        required
                      />
                    </div>

                    <div className="col-span-1 flex items-end">
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Remove variant"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={variant.is_active}
                        onChange={(e) => updateVariant(index, 'is_active', e.target.checked)}
                        className="w-4 h-4 text-amber-900 border-gray-300 rounded focus:ring-amber-900"
                      />
                      <span className="text-sm font-medium text-gray-700">Active</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Status</h2>

          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-5 h-5 text-amber-900 border-gray-300 rounded focus:ring-amber-900"
              />
              <span className="text-sm font-medium text-gray-700">Active (visible in store)</span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="w-5 h-5 text-amber-900 border-gray-300 rounded focus:ring-amber-900"
              />
              <span className="text-sm font-medium text-gray-700">Featured product</span>
            </label>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 bg-amber-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-amber-800 transition disabled:opacity-50"
          >
            <Save size={20} />
            <span>{loading ? 'Saving...' : 'Save Product'}</span>
          </button>

          <button
            type="button"
            onClick={onBack}
            className="px-8 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
