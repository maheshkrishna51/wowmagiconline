import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function ShippingPolicy() {
  const [content, setContent] = useState('');

  useEffect(() => {
    const loadContent = async () => {
      const { data } = await supabase
        .from('content_pages')
        .select('content')
        .eq('page_key', 'shipping_policy')
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
          <h1 className="text-6xl font-bold mb-4">Shipping Policy</h1>
          <p className="text-xl text-rose-50">Delivery information and shipping terms</p>
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
              <div className="space-y-8">
                <section>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">1. Shipping Methods</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    We offer various shipping options to ensure your gifts arrive fresh and on time. Shipping
                    methods and delivery times are calculated at checkout based on your location.
                  </p>
                </section>

                <section>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">2. Processing Time</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Orders are typically processed within 1-2 business days. Custom orders may require additional
                    time for preparation. We will notify you if your order requires extended processing time.
                  </p>
                </section>

                <section>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">3. Delivery Times</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Delivery times vary by location:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Local delivery: 1-2 business days</li>
                    <li>Regional shipping: 2-4 business days</li>
                    <li>National shipping: 3-7 business days</li>
                    <li>Express delivery available for rush orders</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">4. Shipping Costs</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Shipping costs are calculated based on order weight, delivery location, and selected shipping
                    method. You will see the exact shipping cost before completing your purchase.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    Free shipping may be available for orders above a certain amount. Check our promotions page
                    for current offers.
                  </p>
                </section>

                <section>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">5. Order Tracking</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Once your order ships, you will receive a tracking number via email. You can use this number
                    to track your package's delivery progress.
                  </p>
                </section>

                <section>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">6. Delivery Issues</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    If there are any issues with your delivery, please contact us immediately. We will work with
                    the shipping carrier to resolve any problems and ensure you receive your order.
                  </p>
                </section>

                <section>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">7. International Shipping</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Currently, we only ship within our local region. For international inquiries, please contact
                    us directly to discuss custom arrangements.
                  </p>
                </section>

                <section>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">8. Special Handling</h2>
                  <p className="text-gray-700 leading-relaxed">
                    Our products are packaged with care to ensure freshness. Chocolates are shipped with
                    appropriate insulation and cooling packs when necessary. Please refrigerate perishable items
                    upon receipt.
                  </p>
                </section>

                <div className="pt-8 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Last updated: {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}