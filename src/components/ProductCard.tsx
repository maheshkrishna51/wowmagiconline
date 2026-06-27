import { Heart } from 'lucide-react';
import { useWishlist } from '../hooks/useWishlist';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
    slug: string;
    short_description: string;
    compare_price?: number;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };

  const image = product.images[0] || 'https://images.pexels.com/photos/65882/chocolate-dark-coffee-confiserie-65882.jpeg?auto=compress&cs=tinysrgb&w=400';
  const hasDiscount = product.compare_price && product.compare_price > product.price;

  return (
    <a href={`/product/${product.slug}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-rose-200">
        <div className="relative overflow-hidden aspect-square bg-gradient-to-br from-rose-50 to-pink-50">
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />

          {hasDiscount && (
            <div className="absolute top-4 left-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg">
              {Math.round((1 - product.price / product.compare_price!) * 100)}% OFF
            </div>
          )}

          <button
            onClick={handleWishlistClick}
            className={`absolute top-4 right-4 p-2.5 rounded-xl transition-all duration-200 shadow-lg backdrop-blur-sm ${
              inWishlist
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white scale-110'
                : 'bg-white/90 text-gray-700 hover:bg-gradient-to-r hover:from-rose-500 hover:to-pink-500 hover:text-white hover:scale-110'
            }`}
          >
            <Heart size={18} fill={inWishlist ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div className="p-5">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-rose-500 transition-colors duration-200 text-lg">
            {product.name}
          </h3>

          {product.short_description && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">{product.short_description}</p>
          )}

          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">₹{product.price.toFixed(2)}</span>
            {hasDiscount && (
              <span className="text-sm text-gray-400 line-through">
                ₹{product.compare_price!.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>
    </a>
  );
}
