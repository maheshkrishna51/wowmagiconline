import { useEffect, useState } from 'react';
import { Heart, ShoppingBag } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useWishlist } from '../hooks/useWishlist';

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  slug: string;
  short_description: string;
  description: string;
  compare_price: number;
  category_id: string;
  is_active: boolean;
}

interface ProductVariant {
  id: string;
  variant_name: string;
  price: number;
  compare_price: number | null;
  sku: string;
  stock_quantity: number;
}

interface ProductDetailProps {
  slug: string;
}

export default function ProductDetail({ slug }: ProductDetailProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const { isInWishlist, addToWishlist, removeFromWishlist} = useWishlist();

  useEffect(() => {
    loadProduct();
  }, [slug]);

  const loadProduct = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle();

    if (data) {
      setProduct(data);

      const { data: variantsData } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', data.id)
        .eq('is_active', true)
        .order('display_order');

      if (variantsData && variantsData.length > 0) {
        setVariants(variantsData);
        setSelectedVariant(variantsData[0]);
      }
    }
    setLoading(false);
  };

  const handleBuyNow = () => {
    if (!product) return;

    const price = selectedVariant ? selectedVariant.price : product.price;
    const variantInfo = selectedVariant ? ` - ${selectedVariant.variant_name}` : '';

    localStorage.setItem('buyNowProduct', JSON.stringify({
      id: product.id,
      name: product.name + variantInfo,
      price: price,
      quantity: 1,
      image: product.images[0] || '',
      variant_id: selectedVariant?.id || null,
      variant_name: selectedVariant?.variant_name || null,
    }));

    window.location.href = '/checkout';
  };

  const handleWishlistToggle = () => {
    if (!product) return;

    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <a href="/shop" className="text-rose-500 hover:text-rose-600 font-semibold">
            Back to Shop
          </a>
        </div>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);
  const hasDiscount = product.compare_price && product.compare_price > product.price;
  const mainImage = product.images[selectedImage] || product.images[0] || 'https://images.pexels.com/photos/65882/chocolate-dark-coffee-confiserie-65882.jpeg?auto=compress&cs=tinysrgb&w=800';

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-rose-50/30 to-pink-50/30 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <a href="/shop" className="text-rose-500 hover:text-rose-600 font-semibold">
            ← Back to Shop
          </a>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-12">
            <div>
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 mb-4">
                <img
                  src={mainImage}
                  alt={product.name}
                  className="w-full aspect-square object-cover"
                />
                {hasDiscount && (
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                    {Math.round((1 - product.price / product.compare_price!) * 100)}% OFF
                  </div>
                )}
              </div>

              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative overflow-hidden rounded-lg aspect-square bg-gradient-to-br from-rose-50 to-pink-50 border-2 transition-all ${
                        selectedImage === index
                          ? 'border-rose-500 scale-105'
                          : 'border-gray-200 hover:border-rose-300'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              {product.short_description && (
                <p className="text-lg text-gray-600 mb-6">{product.short_description}</p>
              )}

              <div className="flex items-center space-x-3 mb-6">
                <span className="text-4xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
                  ₹{(selectedVariant ? selectedVariant.price : product.price).toFixed(2)}
                </span>
                {(selectedVariant?.compare_price || hasDiscount) && (
                  <span className="text-xl text-gray-400 line-through">
                    ₹{(selectedVariant?.compare_price || product.compare_price)!.toFixed(2)}
                  </span>
                )}
              </div>

              {variants.length > 0 && (
                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-3">Pack Size:</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {variants.map((variant) => (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => setSelectedVariant(variant)}
                        className={`px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                          selectedVariant?.id === variant.id
                            ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg scale-105'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <div className="text-center">
                          <div className="font-bold">{variant.variant_name}</div>
                          <div className="text-sm mt-1">₹{variant.price.toFixed(2)}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 pt-6 mb-6">
                <div className="flex space-x-4">
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-rose-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <ShoppingBag size={20} />
                    <span>Buy Now</span>
                  </button>

                  <button
                    onClick={handleWishlistToggle}
                    className={`p-4 rounded-xl transition-all duration-200 shadow-lg ${
                      inWishlist
                        ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white'
                        : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-rose-500'
                    }`}
                  >
                    <Heart size={24} fill={inWishlist ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>

              {product.description && (
                <div className="border-t border-gray-200 pt-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
                  <div className="prose prose-rose max-w-none">
                    <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                      {product.description}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}