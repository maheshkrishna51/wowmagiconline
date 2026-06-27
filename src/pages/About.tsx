import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function About() {
  const [content, setContent] = useState('');

  useEffect(() => {
    const loadContent = async () => {
      const { data } = await supabase
        .from('cms_content')
        .select('content')
        .eq('key', 'about_us')
        .maybeSingle();

      if (data) setContent(data.content);
    };
    loadContent();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-rose-50/30 to-pink-50/30">
      <div className="bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLS41IDM5LjVoNDEiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIuMyIgb3BhY2l0eT0iLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IGZpbGw9InVybCgjYSkiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiLz48L3N2Zz4=')] opacity-30"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-6xl font-bold mb-4">About Us</h1>
          <p className="text-xl text-rose-50">Learn more about our story and passion</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-rose-100">
            {content ? (
              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            ) : (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
                <p className="text-gray-700 leading-relaxed mb-6">
                  Welcome to our custom chocolate and gift store, where every creation is crafted with
                  love and attention to detail. We specialize in creating beautiful, personalized
                  chocolates and gift hampers that make every occasion special.
                </p>
                <p className="text-gray-700 leading-relaxed mb-6">
                  Our journey began with a simple passion for bringing joy to people through
                  exquisite handmade chocolates and thoughtfully curated gifts. Today, we continue
                  that tradition by offering premium products that combine quality, creativity, and
                  personal touch.
                </p>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">What We Offer</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                  <li>Handcrafted premium chocolates</li>
                  <li>Personalized gift items</li>
                  <li>Custom gift hampers and baskets</li>
                  <li>Special occasion packages</li>
                  <li>Corporate gifting solutions</li>
                </ul>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Promise</h3>
                <p className="text-gray-700 leading-relaxed">
                  We are committed to using only the finest ingredients and materials in our
                  products. Every item is carefully crafted to ensure the highest quality and
                  customer satisfaction. Your happiness is our success.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}