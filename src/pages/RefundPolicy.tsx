import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function RefundPolicy() {
  const [content, setContent] = useState('');

  useEffect(() => {
    const loadContent = async () => {
      const { data } = await supabase
        .from('content_pages')
        .select('content')
        .eq('page_key', 'refund_policy')
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
          <h1 className="text-6xl font-bold mb-4">Refund Policy</h1>
          <p className="text-xl text-rose-50">Returns, refunds, and exchanges information</p>
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
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">1. Our Commitment</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    We stand behind the quality of our products. If you're not completely satisfied with your
                    purchase, we're here to help. Please read our refund policy carefully.
                  </p>
                </section>

                <section>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">2. Eligibility for Refunds</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    You may request a refund if:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Your order arrives damaged or defective</li>
                    <li>You receive the wrong items</li>
                    <li>The products don't match the description</li>
                    <li>Your order never arrives (after investigation)</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">3. Non-Refundable Items</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Due to the nature of our products, the following are not eligible for refunds:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Custom or personalized orders (after production begins)</li>
                    <li>Perishable goods that have been opened or consumed</li>
                    <li>Gift cards</li>
                    <li>Sale or clearance items (unless defective)</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">4. Return Process</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    To initiate a return:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                    <li>Contact us within 48 hours of receiving your order</li>
                    <li>Provide your order number and photos of the issue</li>
                    <li>Wait for return authorization from our team</li>
                    <li>Ship the item back using the provided instructions</li>
                  </ol>
                </section>

                <section>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">5. Refund Timeline</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Once we receive and inspect your return, we will notify you of the approval or rejection.
                    If approved, your refund will be processed within 5-7 business days to your original payment
                    method.
                  </p>
                </section>

                <section>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">6. Exchanges</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    We offer exchanges for damaged or defective items only. If you need to exchange an item,
                    contact us immediately and we'll arrange for a replacement to be sent.
                  </p>
                </section>

                <section>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">7. Shipping Costs</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    If the return is due to our error (wrong item, defective product), we will cover return
                    shipping costs. For other returns, customers are responsible for return shipping expenses.
                  </p>
                </section>

                <section>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">8. Damaged in Transit</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    If your order arrives damaged, please take photos and contact us immediately. We work with
                    carriers to resolve shipping damage and will replace or refund your order promptly.
                  </p>
                </section>

                <section>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">9. Contact Us</h2>
                  <p className="text-gray-700 leading-relaxed">
                    For questions about returns or refunds, please contact our customer service team through
                    our contact page or call us directly. We're here to help!
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