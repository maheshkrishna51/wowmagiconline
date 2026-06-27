import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Plus, Minus, ShoppingCart, Trash2, User, Smartphone, IndianRupee, X } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  stock_quantity: number;
  category_id: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface Customer {
  id: string;
  full_name: string;
  email: string;
  phone: string;
}

export default function POS() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi'>('cash');
  const [amountPaid, setAmountPaid] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, selectedCategory, products]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, full_name, email')
        .order('full_name');

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category_id === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
      if (existingItem.quantity < product.stock_quantity) {
        setCart(cart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      }
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else if (newQuantity <= product.stock_quantity) {
      setCart(cart.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCustomer(null);
    setAmountPaid('');
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateChange = () => {
    const total = calculateTotal();
    const paid = parseFloat(amountPaid) || 0;
    return Math.max(0, paid - total);
  };

  const processOrder = async () => {
    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }

    const total = calculateTotal();
    const paid = parseFloat(amountPaid) || 0;

    if (paymentMethod === 'cash') {
      if (paid < total) {
        alert('Insufficient payment amount');
        return;
      }
    }

    try {
      setProcessingOrder(true);

      const orderItems = cart.map(item => ({
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        price: parseFloat(item.price.toFixed(2)),
        image_url: item.images?.[0] || null
      }));

      const orderData = {
        customer_id: selectedCustomer?.id || null,
        customer_name: selectedCustomer?.full_name || 'Walk-in Customer',
        items: orderItems,
        subtotal: parseFloat(total.toFixed(2)),
        tax: 0,
        discount: 0,
        total_amount: parseFloat(total.toFixed(2)),
        payment_method: paymentMethod,
        amount_paid: paymentMethod === 'cash' ? parseFloat(paid.toFixed(2)) : parseFloat(total.toFixed(2)),
        change_amount: paymentMethod === 'cash' ? parseFloat(calculateChange().toFixed(2)) : 0,
        status: 'completed'
      };

      const { data: order, error: orderError } = await supabase
        .from('pos_orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) throw orderError;

      for (const item of cart) {
        const { error: stockError } = await supabase
          .from('products')
          .update({ stock_quantity: item.stock_quantity - item.quantity })
          .eq('id', item.id);

        if (stockError) throw stockError;
      }

      alert(`POS Order completed successfully!\n\nOrder #: ${order.order_number}\nTotal: ₹${total.toFixed(2)}${paymentMethod === 'cash' ? `\nPaid: ₹${amountPaid}\nChange: ₹${calculateChange().toFixed(2)}` : ''}`);

      clearCart();
      fetchProducts();
    } catch (error) {
      console.error('Error processing POS order:', error);
      alert('Failed to process order. Please try again.');
    } finally {
      setProcessingOrder(false);
    }
  };

  const categories = ['all', ...new Set(products.map(p => p.category_id))];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-900" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Point of Sale</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 20rem)' }}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map(product => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  disabled={product.stock_quantity === 0}
                  className={`p-4 rounded-lg border-2 transition ${
                    product.stock_quantity === 0
                      ? 'border-gray-200 opacity-50 cursor-not-allowed'
                      : 'border-gray-200 hover:border-amber-500 hover:shadow-md'
                  }`}
                >
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full aspect-square object-cover rounded-lg mb-2"
                    />
                  ) : (
                    <div className="w-full aspect-square bg-gray-100 rounded-lg mb-2 flex items-center justify-center text-gray-400 text-xs">
                      No image
                    </div>
                  )}
                  <h3 className="font-semibold text-sm text-gray-900 truncate">{product.name}</h3>
                  <p className="text-amber-900 font-bold mt-1">₹{product.price.toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-1">Stock: {product.stock_quantity}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col" style={{ maxHeight: 'calc(100vh - 12rem)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <ShoppingCart size={24} className="mr-2" />
              Cart
            </h2>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Clear
              </button>
            )}
          </div>

          <div className="mb-4">
            <button
              onClick={() => setShowCustomerModal(true)}
              className="w-full flex items-center justify-between p-3 border-2 border-gray-300 rounded-lg hover:border-amber-500 transition"
            >
              <div className="flex items-center">
                <User size={20} className="mr-2 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  {selectedCustomer ? selectedCustomer.full_name : 'Walk-in Customer (Optional)'}
                </span>
              </div>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto mb-4 space-y-2">
            {cart.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Cart is empty</p>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-gray-900">{item.name}</h4>
                    <p className="text-amber-900 font-bold text-sm">₹{item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1 hover:bg-gray-200 rounded"
                      disabled={item.quantity >= item.stock_quantity}
                    >
                      <Plus size={16} />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1 hover:bg-red-100 text-red-600 rounded ml-2"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <>
              <div className="border-t pt-4 mb-4">
                <div className="flex items-center space-x-2 mb-3">
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg font-medium transition ${
                      paymentMethod === 'cash'
                        ? 'bg-amber-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <IndianRupee size={20} />
                    <span>Cash</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('upi')}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg font-medium transition ${
                      paymentMethod === 'upi'
                        ? 'bg-amber-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Smartphone size={20} />
                    <span>UPI</span>
                  </button>
                </div>

                {paymentMethod === 'cash' && (
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount Paid
                    </label>
                    <input
                      type="number"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                    {amountPaid && (
                      <p className="text-sm text-gray-600 mt-1">
                        Change: ₹{calculateChange().toFixed(2)}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold text-gray-700">Total:</span>
                  <span className="text-2xl font-bold text-amber-900">
                    ₹{calculateTotal().toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={processOrder}
                disabled={processingOrder}
                className="w-full bg-amber-900 text-white py-3 rounded-lg font-semibold hover:bg-amber-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processingOrder ? 'Processing...' : 'Complete Sale'}
              </button>
            </>
          )}
        </div>
      </div>

      {showCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">Select Customer</h2>
              <button
                onClick={() => setShowCustomerModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-2">
                {customers.map(customer => (
                  <button
                    key={customer.id}
                    onClick={() => {
                      setSelectedCustomer(customer);
                      setShowCustomerModal(false);
                    }}
                    className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:border-amber-500 transition"
                  >
                    <p className="font-semibold text-gray-900">{customer.full_name}</p>
                    <p className="text-sm text-gray-600">{customer.email}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}