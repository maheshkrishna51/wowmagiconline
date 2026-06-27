import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function PrivacyPolicy() {
  const [content, setContent] = useState('');

  useEffect(() => {
    const loadContent = async () => {
      const { data } = await supabase
        .from('content_pages')
        .select('content')
        .eq('page_key', 'privacy_policy')
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
          <h1 className="text-6xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-xl text-rose-50">How we collect, use, and protect your information</p>
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
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    We collect information you provide directly to us when you make a purchase, create an account,
                    or contact us. This may include your name, email address, phone number, delivery address, and
                    payment information.
                  </p>
                </section>

                <section>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    We use the information we collect to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Process and fulfill your orders</li>
                    <li>Send you order confirmations and updates</li>
                    <li>Respond to your questions and requests</li>
                    <li>Improve our products and services</li>
                    <li>Send you marketing communications (with your consent)</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">3. Information Sharing</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    We do not sell, trade, or rent your personal information to third parties. We may share your
                    information with trusted service providers who assist us in operating our website and conducting
                    our business, subject to confidentiality agreements.
                  </p>
                </section>

                <section>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">4. Data Security</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    We implement appropriate security measures to protect your personal information. However, no
                    method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
                  </p>
                </section>

                <section>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">5. Your Rights</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    You have the right to access, correct, or delete your personal information. You may also opt-out
                    of marketing communications at any time. Contact us to exercise these rights.
                  </p>
                </section>

                <section>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">6. Cookies</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    We use cookies to enhance your browsing experience and analyze site traffic. You can control
                    cookie preferences through your browser settings.
                  </p>
                </section>

                <section>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">7. Contact Us</h2>
                  <p className="text-gray-700 leading-relaxed">
                    If you have any questions about this Privacy Policy, please contact us through our contact page
                    or email us directly.
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