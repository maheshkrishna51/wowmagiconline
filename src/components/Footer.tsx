import { Facebook, Instagram, Youtube, Mail, MapPin, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Footer() {
  const [contactInfo, setContactInfo] = useState({
    phone: '',
    email: '',
    address: '',
  });

  const [socialLinks, setSocialLinks] = useState({
    facebook: '',
    instagram: '',
    youtube: '',
  });

  useEffect(() => {
    const loadContactInfo = async () => {
      const { data } = await supabase
        .from('cms_content')
        .select('metadata')
        .eq('key', 'contact_info')
        .maybeSingle();

      if (data?.metadata) {
        setContactInfo({
          phone: (data.metadata as any).phone || '',
          email: (data.metadata as any).email || '',
          address: (data.metadata as any).address || '',
        });
      }
    };

    const loadSocialLinks = async () => {
      const { data } = await supabase
        .from('cms_content')
        .select('metadata')
        .eq('key', 'social_media_links')
        .maybeSingle();

      if (data?.metadata) {
        setSocialLinks({
          facebook: (data.metadata as any).facebook || '',
          instagram: (data.metadata as any).instagram || '',
          youtube: (data.metadata as any).youtube || '',
        });
      }
    };

    loadContactInfo();
    loadSocialLinks();
  }, []);

  return (
    <footer className="bg-gradient-to-br from-rose-50 via-pink-50 to-white border-t border-rose-100">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <h3 className="text-gray-900 text-lg font-bold mb-4 bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">About Us</h3>
            <p className="text-sm leading-relaxed text-gray-600">
              Creating beautiful custom chocolates and gifts for every special occasion.
              Quality and personalization are at the heart of everything we do.
            </p>
          </div>

          <div>
            <h3 className="text-gray-900 text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="/shop" className="text-gray-600 hover:text-rose-500 transition-colors duration-200">Shop</a></li>
              <li><a href="/our-works" className="text-gray-600 hover:text-rose-500 transition-colors duration-200">Our Works</a></li>
              <li><a href="/about" className="text-gray-600 hover:text-rose-500 transition-colors duration-200">About Us</a></li>
              <li><a href="/contact" className="text-gray-600 hover:text-rose-500 transition-colors duration-200">Contact</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-gray-900 text-lg font-bold mb-4">Policies</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="/privacy-policy" className="text-gray-600 hover:text-rose-500 transition-colors duration-200">Privacy Policy</a></li>
              <li><a href="/shipping-policy" className="text-gray-600 hover:text-rose-500 transition-colors duration-200">Shipping Policy</a></li>
              <li><a href="/refund-policy" className="text-gray-600 hover:text-rose-500 transition-colors duration-200">Refund Policy</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-gray-900 text-lg font-bold mb-4">Contact Info</h3>
            <ul className="space-y-3 text-sm">
              {contactInfo.phone && (
                <li className="flex items-start space-x-3 text-gray-600">
                  <Phone size={16} className="mt-1 flex-shrink-0 text-rose-500" />
                  <span>{contactInfo.phone}</span>
                </li>
              )}
              {contactInfo.email && (
                <li className="flex items-start space-x-3 text-gray-600">
                  <Mail size={16} className="mt-1 flex-shrink-0 text-rose-500" />
                  <span>{contactInfo.email}</span>
                </li>
              )}
              {contactInfo.address && (
                <li className="flex items-start space-x-3 text-gray-600">
                  <MapPin size={16} className="mt-1 flex-shrink-0 text-rose-500" />
                  <span>{contactInfo.address}</span>
                </li>
              )}
            </ul>

            <div className="flex space-x-3 mt-6">
              {socialLinks.facebook && (
                <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white rounded-xl hover:bg-gradient-to-r hover:from-rose-500 hover:to-pink-500 text-gray-600 hover:text-white transition-all duration-200 shadow-sm">
                  <Facebook size={20} />
                </a>
              )}
              {socialLinks.instagram && (
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white rounded-xl hover:bg-gradient-to-r hover:from-rose-500 hover:to-pink-500 text-gray-600 hover:text-white transition-all duration-200 shadow-sm">
                  <Instagram size={20} />
                </a>
              )}
              {socialLinks.youtube && (
                <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white rounded-xl hover:bg-gradient-to-r hover:from-rose-500 hover:to-pink-500 text-gray-600 hover:text-white transition-all duration-200 shadow-sm">
                  <Youtube size={20} />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-rose-100 mt-12 pt-8 text-center">
          <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} WowMagic. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
