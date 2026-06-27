import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CheckCircle } from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export default function Checkout() {
  const [product, setProduct] = useState<CartItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '+91',
    address: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  useEffect(() => {
    const buyNowProduct = localStorage.getItem('buyNowProduct');
    if (buyNowProduct) {
      setProduct(JSON.parse(buyNowProduct));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderNum = `ORD-${Date.now()}`;

      const { error: customerError, data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('whatsapp_number', formData.whatsapp)
        .maybeSingle();

      let customerId = customer?.id;

      if (!customerId) {
        const { data: newCustomer } = await supabase
          .from('customers')
          .insert({
            name: formData.name,
            whatsapp_number: formData.whatsapp,
            addresses: [formData.address],
          })
          .select()
          .single();

        customerId = newCustomer?.id;
      }

      if (!product) return;

      const { error } = await supabase.from('orders').insert({
        order_number: orderNum,
        customer_id: customerId,
        customer_name: formData.name,
        customer_whatsapp: formData.whatsapp,
        delivery_address: formData.address,
        items: [{
          product_id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          image: product.image,
        }],
        subtotal: product.price,
        delivery_fee: 0,
        total_amount: product.price,
        status: 'pending',
        notes: formData.notes,
      });

      if (!error) {
        setOrderNumber(orderNum);
        setOrderComplete(true);
        localStorage.removeItem('buyNowProduct');
      }
    } catch (err) {
      console.error('Order error:', err);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} className="text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h1>
          <p className="text-gray-600 mb-6">
            Your order number is <span className="font-bold text-amber-900">{orderNumber}</span>
          </p>
          <p className="text-gray-600 mb-8">
            We'll contact you on WhatsApp shortly to confirm your order and arrange delivery.
          </p>
          <div className="space-y-3">
            <a
              href="/shop"
              className="block w-full bg-amber-900 text-white py-3 rounded-lg font-semibold hover:bg-amber-800 transition"
            >
              Continue Shopping
            </a>
            <a
              href="/"
              className="block w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Back to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">No product selected</h1>
          <a href="/shop" className="text-amber-900 font-semibold hover:text-amber-800">
            Start Shopping
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Delivery Information</h2>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">WhatsApp Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.whatsapp}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (!value.startsWith('+91')) {
                      setFormData({ ...formData, whatsapp: '+91' });
                    } else {
                      setFormData({ ...formData, whatsapp: value });
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900"
                  placeholder="+91 9876543210"
                />
                <p className="text-sm text-gray-500 mt-1">Indian mobile number with country code</p>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Delivery Address *</label>
                <textarea
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900 h-24"
                  placeholder="Street address, city, postal code"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Order Notes (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900 h-24"
                  placeholder="Any special requests or instructions"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-900 text-white py-4 rounded-lg font-semibold text-lg hover:bg-amber-800 transition disabled:opacity-50"
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex space-x-3">
                  <img
                    src={product.image || 'https://images.pexels.com/photos/65882/chocolate-dark-coffee-confiserie-65882.jpeg?auto=compress&cs=tinysrgb&w=100'}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">Qty: 1</p>
                    <p className="font-semibold text-amber-900">₹{product.price.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>₹{product.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Delivery</span>
                  <span>FREE</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t">
                  <span>Total</span>
                  <span className="text-amber-900">₹{product.price.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}