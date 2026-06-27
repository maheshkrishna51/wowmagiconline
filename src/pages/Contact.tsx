import { useEffect, useState } from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Contact() {
  const [contactInfo, setContactInfo] = useState({
    phone: '',
    email: '',
    address: '',
    hours: '',
  });

  useEffect(() => {
    const loadContactInfo = async () => {
      const { data } = await supabase
        .from('cms_content')
        .select('metadata')
        .eq('key', 'contact_info')
        .maybeSingle();

      if (data?.metadata) {
        setContactInfo(data.metadata as any);
      }
    };
    loadContactInfo();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-rose-50/30 to-pink-50/30">
      <div className="bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLS41IDM5LjVoNDEiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIuMyIgb3BhY2l0eT0iLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IGZpbGw9InVybCgjYSkiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiLz48L3N2Zz4=')] opacity-30"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-6xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-rose-50">Get in touch with us for custom orders and inquiries</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Get In Touch</h2>

            <div className="space-y-6">
              {contactInfo.address && (
                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-rose-100 to-pink-100 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <MapPin className="text-rose-500" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Address</h3>
                    <p className="text-gray-700">{contactInfo.address}</p>
                  </div>
                </div>
              )}

              {contactInfo.phone && (
                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-rose-100 to-pink-100 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Phone className="text-rose-500" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Phone</h3>
                    <a href={`tel:${contactInfo.phone}`} className="text-gray-700 hover:text-amber-900">
                      {contactInfo.phone}
                    </a>
                  </div>
                </div>
              )}

              {contactInfo.email && (
                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-rose-100 to-pink-100 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Mail className="text-rose-500" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Email</h3>
                    <a href={`mailto:${contactInfo.email}`} className="text-gray-700 hover:text-rose-500 transition-colors duration-200">
                      {contactInfo.email}
                    </a>
                  </div>
                </div>
              )}

              {contactInfo.hours && (
                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-rose-100 to-pink-100 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Clock className="text-rose-500" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Business Hours</h3>
                    <p className="text-gray-700 whitespace-pre-line">{contactInfo.hours}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-12 bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-8 border border-rose-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Custom Orders</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Looking for something unique? We specialize in custom orders for all occasions!
                Contact us to discuss your ideas and we'll bring them to life.
              </p>
              <a
                href="/shop"
                className="inline-block bg-amber-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-800 transition"
              >
                Browse Products
              </a>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h2>

            <form className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Email</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Phone (Optional)</label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900"
                  placeholder="+1234567890"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Message</label>
                <textarea
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900 h-32"
                  placeholder="Tell us about your requirements..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-900 text-white py-3 rounded-lg font-semibold hover:bg-amber-800 transition"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}