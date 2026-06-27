import { useState, useEffect } from 'react';
import { Menu, X, Search, Phone } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface HeaderProps {}

export default function Header({}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [siteName, setSiteName] = useState('Chocolate & Gifts');
  const [logoUrl, setLogoUrl] = useState('/logo-200200 copy.png');
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', ['site_name', 'logo_url']);

      const { data: contactData } = await supabase
        .from('cms_content')
        .select('metadata')
        .eq('key', 'contact_info')
        .maybeSingle();

      if (data) {
        const name = data.find(s => s.key === 'site_name')?.value;
        const logo = data.find(s => s.key === 'logo_url')?.value;
        if (name) setSiteName(name);
        if (logo) setLogoUrl(logo);
      }

      if (contactData?.metadata && (contactData.metadata as any).phone) {
        setPhoneNumber((contactData.metadata as any).phone);
      }
    };
    loadSettings();
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-24">
          <div className="flex items-center space-x-4 lg:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 hover:bg-rose-50 rounded-xl transition-all duration-200"
            >
              {menuOpen ? <X size={24} className="text-gray-700" /> : <Menu size={24} className="text-gray-700" />}
            </button>
          </div>

          <a href="/" className="flex items-center justify-center absolute left-1/2 transform -translate-x-1/2">
            <img src={logoUrl} alt={siteName} className="h-16 w-auto object-contain" />
          </a>

          <div className="flex-1"></div>

          <nav className="hidden lg:flex items-center space-x-8">
            <a href="/" className="text-gray-600 hover:text-rose-500 font-medium transition-colors duration-200 relative group">
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-rose-500 to-pink-500 group-hover:w-full transition-all duration-200"></span>
            </a>
            <a href="/shop" className="text-gray-600 hover:text-rose-500 font-medium transition-colors duration-200 relative group">
              Shop
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-rose-500 to-pink-500 group-hover:w-full transition-all duration-200"></span>
            </a>
            <a href="/our-works" className="text-gray-600 hover:text-rose-500 font-medium transition-colors duration-200 relative group">
              Our Works
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-rose-500 to-pink-500 group-hover:w-full transition-all duration-200"></span>
            </a>
            <a href="/about" className="text-gray-600 hover:text-rose-500 font-medium transition-colors duration-200 relative group">
              About
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-rose-500 to-pink-500 group-hover:w-full transition-all duration-200"></span>
            </a>
            <a href="/contact" className="text-gray-600 hover:text-rose-500 font-medium transition-colors duration-200 relative group">
              Contact
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-rose-500 to-pink-500 group-hover:w-full transition-all duration-200"></span>
            </a>
          </nav>

          <div className="flex items-center space-x-2">
            {phoneNumber && (
              <a
                href={`tel:${phoneNumber}`}
                className="hidden lg:flex items-center space-x-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white px-4 py-2.5 rounded-xl font-medium hover:shadow-lg transition-all duration-200 hover:scale-105"
              >
                <Phone size={18} />
                <span>Call to Book</span>
              </a>
            )}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2.5 hover:bg-rose-50 rounded-xl transition-all duration-200 text-gray-600 hover:text-rose-500"
            >
              <Search size={20} />
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="pb-4">
            <input
              type="search"
              placeholder="Search products..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-gray-50 transition-all duration-200"
              autoFocus
            />
          </div>
        )}
      </div>

      {menuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <nav className="container mx-auto px-4 py-4 flex flex-col space-y-3">
            <a href="/" onClick={() => setMenuOpen(false)} className="text-gray-700 hover:text-amber-900 font-medium py-2">Home</a>
            <a href="/shop" onClick={() => setMenuOpen(false)} className="text-gray-700 hover:text-amber-900 font-medium py-2">Shop</a>
            <a href="/our-works" onClick={() => setMenuOpen(false)} className="text-gray-700 hover:text-amber-900 font-medium py-2">Our Works</a>
            <a href="/about" onClick={() => setMenuOpen(false)} className="text-gray-700 hover:text-amber-900 font-medium py-2">About</a>
            <a href="/contact" onClick={() => setMenuOpen(false)} className="text-gray-700 hover:text-amber-900 font-medium py-2">Contact</a>
            {phoneNumber && (
              <a
                href={`tel:${phoneNumber}`}
                className="flex items-center justify-center space-x-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white px-4 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200 mt-2"
              >
                <Phone size={18} />
                <span>Call to Book</span>
              </a>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
