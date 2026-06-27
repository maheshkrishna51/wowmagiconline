import { useEffect, useState, useRef } from 'react';
import { Plus, CreditCard as Edit, Trash2, Search, Download, BookOpen, ChevronDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { generateSticker } from '../../utils/generateSticker';
import { downloadCatalog } from '../../utils/generateCatalog';

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [catalogMenuOpen, setCatalogMenuOpen] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const catalogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, [selectedCategory, searchQuery]);

  const loadCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('display_order');
    if (data) setCategories(data);
  };

  const loadProducts = async () => {
    let query = supabase.from('products').select('*, categories(name)');

    if (selectedCategory) {
      query = query.eq('category_id', selectedCategory);
    }

    if (searchQuery) {
      query = query.ilike('name', `%${searchQuery}%`);
    }

    const { data } = await query.order('created_at', { ascending: false });
    if (data) setProducts(data);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (catalogRef.current && !catalogRef.current.contains(e.target as Node)) {
        setCatalogMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCatalogDownload = async (categoryId?: string) => {
    setCatalogMenuOpen(false);
    setCatalogLoading(true);
    try {
      let query = supabase
        .from('products')
        .select('name, price, compare_price, short_description, images, sku, is_active, categories(name)')
        .eq('is_active', true)
        .order('display_order');

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data } = await query;
      if (!data || data.length === 0) {
        alert('No active products found for this selection.');
        return;
      }

      const mapped = data.map((p: any) => ({
        name: p.name,
        price: p.price,
        compare_price: p.compare_price || 0,
        short_description: p.short_description || '',
        images: p.images || [],
        sku: p.sku || '',
        is_active: p.is_active,
        category_name: p.categories?.name || 'Uncategorized',
      }));

      const catName = categoryId
        ? categories.find(c => c.id === categoryId)?.name
        : undefined;

      downloadCatalog(mapped, catName);
    } finally {
      setCatalogLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) loadProducts();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <div className="flex items-center gap-3">
          <div className="relative" ref={catalogRef}>
            <button
              onClick={() => setCatalogMenuOpen(!catalogMenuOpen)}
              disabled={catalogLoading}
              className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50"
            >
              <BookOpen size={18} />
              <span>{catalogLoading ? 'Generating...' : 'Download Catalog'}</span>
              <ChevronDown size={16} className={`transition-transform ${catalogMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            {catalogMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <button
                  onClick={() => handleCatalogDownload()}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-900 transition flex items-center gap-2"
                >
                  <BookOpen size={15} />
                  All Categories
                </button>
                <div className="border-t border-gray-100 my-1" />
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCatalogDownload(cat.id)}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-900 transition pl-8"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <a
            href="/admin/products/new"
            className="flex items-center space-x-2 bg-amber-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-800 transition"
          >
            <Plus size={20} />
            <span>Add Product</span>
          </a>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="search"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Product</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Category</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Price</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Stock</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
                <th className="text-right py-4 px-6 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <img
                        src={product.images[0] || 'https://images.pexels.com/photos/65882/chocolate-dark-coffee-confiserie-65882.jpeg?auto=compress&cs=tinysrgb&w=100'}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {product.categories?.name || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-semibold">₹{product.price.toFixed(2)}</td>
                  <td className="py-4 px-6">
                    <span className={`font-semibold ${
                      product.stock_quantity <= product.low_stock_threshold
                        ? 'text-red-600'
                        : 'text-green-600'
                    }`}>
                      {product.stock_quantity}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      product.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() =>
                          generateSticker({
                            name: product.name,
                            price: product.price,
                            sku: product.sku,
                            image: product.images?.[0] || '',
                          })
                        }
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                        title="Download Sticker"
                      >
                        <Download size={18} className="text-amber-700" />
                      </button>
                      <a
                        href={`/admin/products/edit/${product.id}`}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                      >
                        <Edit size={18} className="text-blue-600" />
                      </a>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                      >
                        <Trash2 size={18} className="text-red-600" />
                      </button>
                    </div>
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
