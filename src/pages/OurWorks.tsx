import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  images: string[];
  category: string;
}

export default function OurWorks() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    loadPortfolio();
  }, [selectedCategory]);

  const loadPortfolio = async () => {
    let query = supabase
      .from('portfolio_items')
      .select('*')
      .eq('is_active', true);

    if (selectedCategory) {
      query = query.eq('category', selectedCategory);
    }

    const { data } = await query.order('display_order');

    if (data) {
      setItems(data);
      const cats = [...new Set(data.map(item => item.category).filter(Boolean))];
      setCategories(cats);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-rose-50/30 to-pink-50/30">
      <div className="bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLS41IDM5LjVoNDEiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIuMyIgb3BhY2l0eT0iLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IGZpbGw9InVybCgjYSkiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiLz48L3N2Zz4=')] opacity-30"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Our Works</h1>
          <p className="text-xl text-rose-50">Explore our portfolio of custom creations and satisfied customers</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {categories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-sm ${
                selectedCategory === ''
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-sm ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No portfolio items to display yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 group"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={item.images[0] || 'https://images.pexels.com/photos/6220337/pexels-photo-6220337.jpeg?auto=compress&cs=tinysrgb&w=600'}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  {item.description && (
                    <p className="text-gray-600 leading-relaxed mb-3">{item.description}</p>
                  )}
                  {item.category && (
                    <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 rounded-full text-sm font-semibold">
                      {item.category}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}