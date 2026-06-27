import { useEffect, useState } from 'react';
import { Star, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/ProductCard';

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  slug: string;
  short_description: string;
}

interface Testimonial {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
}

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [heroImage, setHeroImage] = useState('https://images.pexels.com/photos/1090979/pexels-photo-1090979.jpeg?auto=compress&cs=tinysrgb&w=1920');
  const [heroContent, setHeroContent] = useState({
    badge_text: 'Premium Handcrafted Gifts',
    heading_line1: 'Crafted With Love,',
    heading_line2: 'Delivered With Care',
    subheading: 'Discover our exquisite collection of handmade chocolates and personalized gifts that create unforgettable moments',
    primary_button_text: 'Shop Now',
    primary_button_url: '/shop',
    secondary_button_text: 'View Our Works',
    secondary_button_url: '/our-works'
  });

  useEffect(() => {
    const loadData = async () => {
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('is_featured', true)
        .eq('is_active', true)
        .limit(8);

      const { data: reviews } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_featured', true)
        .eq('is_active', true)
        .limit(3);

      const { data: settings } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'hero_image_url')
        .maybeSingle();

      const { data: heroData } = await supabase
        .from('cms_content')
        .select('metadata')
        .eq('key', 'hero_section')
        .maybeSingle();

      if (products) setFeaturedProducts(products);
      if (reviews) setTestimonials(reviews);
      if (settings?.value) setHeroImage(settings.value);
      if (heroData?.metadata) setHeroContent(heroData.metadata as any);
    };

    loadData();
  }, []);

  return (
    <div className="bg-gradient-to-br from-white via-rose-50/30 to-pink-50/30">
      <section className="relative min-h-[700px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${heroImage})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-rose-500/70 via-pink-500/60 to-rose-400/70" />
        </div>

        <div className="relative z-10 text-center text-white max-w-5xl px-4 py-20">
          <div className="mb-6 inline-block px-6 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
            <span className="text-sm font-medium">{heroContent.badge_text}</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            {heroContent.heading_line1}<br />
            <span className="bg-gradient-to-r from-rose-200 to-pink-200 bg-clip-text text-transparent">{heroContent.heading_line2}</span>
          </h1>
          <p className="text-xl md:text-2xl mb-10 leading-relaxed text-rose-50 max-w-3xl mx-auto">
            {heroContent.subheading}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={heroContent.primary_button_url}
              className="group bg-white hover:bg-rose-50 text-rose-600 px-10 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 inline-flex items-center justify-center shadow-xl hover:shadow-2xl hover:scale-105"
            >
              {heroContent.primary_button_text}
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
            </a>
            <a
              href={heroContent.secondary_button_url}
              className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border-2 border-white/30 px-10 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 hover:scale-105"
            >
              {heroContent.secondary_button_text}
            </a>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">Shop By Category</h2>
            <p className="text-gray-600 text-xl">Find the perfect gift for every occasion</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Chocolates',
                image: 'https://images.pexels.com/photos/65882/chocolate-dark-coffee-confiserie-65882.jpeg?auto=compress&cs=tinysrgb&w=800',
                link: '/shop?category=chocolates',
              },
              {
                name: 'Gifts',
                image: 'https://images.pexels.com/photos/264985/pexels-photo-264985.jpeg?auto=compress&cs=tinysrgb&w=800',
                link: '/shop?category=gifts',
              },
              {
                name: 'Hampers',
                image: 'https://images.pexels.com/photos/1666067/pexels-photo-1666067.jpeg?auto=compress&cs=tinysrgb&w=800',
                link: '/shop?category=hampers',
              },
            ].map((category) => (
              <a
                key={category.name}
                href={category.link}
                className="group relative h-80 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-rose-900/80 via-pink-900/40 to-transparent flex items-end">
                  <h3 className="text-white text-3xl font-bold p-8 group-hover:translate-y-[-4px] transition-transform duration-200">{category.name}</h3>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {featuredProducts.length > 0 && (
        <section className="py-24 bg-gradient-to-br from-rose-50/50 to-pink-50/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold text-gray-900 mb-4">Featured Products</h2>
              <p className="text-gray-600 text-xl">Handpicked favorites just for you</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="text-center mt-16">
              <a
                href="/shop"
                className="group inline-flex items-center bg-gradient-to-r from-rose-500 to-pink-500 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                View All Products
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </a>
            </div>
          </div>
        </section>
      )}

      {testimonials.length > 0 && (
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold text-gray-900 mb-4">Customer Reviews</h2>
              <p className="text-gray-600 text-xl">What our customers say about us</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="bg-gradient-to-br from-white to-rose-50/30 p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-rose-100">
                  <div className="flex mb-6">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} size={22} className="fill-rose-400 text-rose-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-6 text-lg">{testimonial.comment}</p>
                  <p className="font-bold text-gray-900">{testimonial.customer_name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-24 bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLS41IDM5LjVoNDEiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIuMyIgb3BhY2l0eT0iLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IGZpbGw9InVybCgjYSkiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiLz48L3N2Zz4=')] opacity-30"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-5xl font-bold mb-6">Ready to Create Something Special?</h2>
          <p className="text-xl mb-10 max-w-3xl mx-auto leading-relaxed text-rose-50">
            Let us help you craft the perfect gift for your loved ones. Custom orders welcome!
          </p>
          <a
            href="/contact"
            className="inline-block bg-white text-rose-600 px-10 py-4 rounded-2xl font-semibold text-lg hover:bg-rose-50 transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105"
          >
            Get in Touch
          </a>
        </div>
      </section>
    </div>
  );
}