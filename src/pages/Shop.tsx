import { useEffect, useState } from 'react';
import { Filter, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/ProductCard';

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  slug: string;
  short_description: string;
  compare_price: number;
  category_id: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [priceRange, setPriceRange] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, [selectedCategory, priceRange, searchQuery]);

  const loadCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('id, name, slug')
      .eq('is_active', true)
      .order('display_order');

    if (data) setCategories(data);
  };

  const loadProducts = async () => {
    let query = supabase
      .from('products')
      .select('*')
      .eq('is_active', true);

    if (selectedCategory) {
      query = query.eq('category_id', selectedCategory);
    }

    if (searchQuery) {
      query = query.ilike('name', `%${searchQuery}%`);
    }

    const { data } = await query.order('display_order');

    if (data) {
      let filtered = data;

      if (priceRange) {
        const [min, max] = priceRange.split('-').map(Number);
        filtered = filtered.filter(p => {
          if (max) return p.price >= min && p.price <= max;
          return p.price >= min;
        });
      }

      setProducts(filtered);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-rose-50/30 to-pink-50/30">
      <div className="bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLS41IDM5LjVoNDEiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIuMyIgb3BhY2l0eT0iLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IGZpbGw9InVybCgjYSkiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiLz48L3N2Zz4=')] opacity-30"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Shop Our Collection</h1>
          <p className="text-xl text-rose-50">Discover handcrafted chocolates and beautiful gifts</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4 flex-1">
            <input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white shadow-sm transition-all duration-200"
            />
          </div>

          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="lg:hidden flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <Filter size={20} />
            <span>Filters</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className={`lg:w-64 ${filterOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-xl p-6 shadow-md sticky top-24">
              <div className="flex items-center justify-between mb-4 lg:hidden">
                <h3 className="font-bold text-lg">Filters</h3>
                <button onClick={() => setFilterOpen(false)}>
                  <X size={20} />
                </button>
              </div>

              <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-3">Categories</h3>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === ''}
                      onChange={() => setSelectedCategory('')}
                      className="text-amber-900 focus:ring-amber-900"
                    />
                    <span>All Products</span>
                  </label>
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === category.id}
                        onChange={() => setSelectedCategory(category.id)}
                        className="text-amber-900 focus:ring-amber-900"
                      />
                      <span>{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-3">Price Range</h3>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="price"
                      checked={priceRange === ''}
                      onChange={() => setPriceRange('')}
                      className="text-amber-900 focus:ring-amber-900"
                    />
                    <span>All Prices</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="price"
                      checked={priceRange === '0-500'}
                      onChange={() => setPriceRange('0-500')}
                      className="text-amber-900 focus:ring-amber-900"
                    />
                    <span>Under ₹500</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="price"
                      checked={priceRange === '500-1000'}
                      onChange={() => setPriceRange('500-1000')}
                      className="text-amber-900 focus:ring-amber-900"
                    />
                    <span>₹500 - ₹1000</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="price"
                      checked={priceRange === '1000-2000'}
                      onChange={() => setPriceRange('1000-2000')}
                      className="text-amber-900 focus:ring-amber-900"
                    />
                    <span>₹1000 - ₹2000</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="price"
                      checked={priceRange === '2000-999999'}
                      onChange={() => setPriceRange('2000-999999')}
                      className="text-amber-900 focus:ring-amber-900"
                    />
                    <span>Over ₹2000</span>
                  </label>
                </div>
              </div>
            </div>
          </aside>

          <main className="flex-1">
            {products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <p className="text-gray-600">
                    Showing {products.length} {products.length === 1 ? 'product' : 'products'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}