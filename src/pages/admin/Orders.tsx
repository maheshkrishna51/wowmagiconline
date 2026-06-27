import { useEffect, useState } from 'react';
import { MessageSquare, Pencil, X, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface OrderItem {
  product_name?: string;
  name?: string;
  price: number;
  quantity: number;
  variant?: string;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_whatsapp?: string;
  delivery_address?: string;
  items: OrderItem[];
  subtotal: number;
  delivery_fee?: number;
  total_amount: number;
  status: string;
  notes?: string;
  admin_notes?: string;
  whatsapp_sent?: boolean;
  payment_method?: string;
  amount_paid?: number;
  change_amount?: number;
  created_at: string;
  updated_at?: string;
}

interface EditOrderForm {
  customer_name: string;
  customer_whatsapp: string;
  delivery_address: string;
  status: string;
  notes: string;
  admin_notes: string;
  payment_method: string;
  items: OrderItem[];
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [posOrders, setPosOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [orderType, setOrderType] = useState<'online' | 'pos'>('online');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editForm, setEditForm] = useState<EditOrderForm | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [statusFilter, orderType]);

  const loadOrders = async () => {
    if (orderType === 'online') {
      let query = supabase.from('orders').select('*');
      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }
      const { data } = await query.order('created_at', { ascending: false });
      if (data) setOrders(data);
    } else {
      let query = supabase.from('pos_orders').select('*');
      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }
      const { data } = await query.order('created_at', { ascending: false });
      if (data) setPosOrders(data);
    }
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    const tableName = orderType === 'online' ? 'orders' : 'pos_orders';
    const { error } = await supabase
      .from(tableName)
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (!error) {
      loadOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    }
  };

  const sendWhatsAppMessage = (order: Order) => {
    const message = `Hello ${order.customer_name}! Your order ${order.order_number} has been received. Total: ₹${order.total_amount.toFixed(2)}. We'll contact you shortly!`;
    const phone = (order.customer_whatsapp || '').replace(/[^0-9]/g, '');
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const openEditOrder = (order: Order) => {
    setEditingOrder(order);
    setEditForm({
      customer_name: order.customer_name || '',
      customer_whatsapp: order.customer_whatsapp || '',
      delivery_address: order.delivery_address || '',
      status: order.status || 'pending',
      notes: order.notes || '',
      admin_notes: order.admin_notes || '',
      payment_method: order.payment_method || 'cash',
      items: order.items ? order.items.map(item => ({ ...item })) : [],
    });
  };

  const closeEditOrder = () => {
    setEditingOrder(null);
    setEditForm(null);
  };

  const updateItemQuantity = (index: number, quantity: number) => {
    if (!editForm || quantity < 1) return;
    setEditForm(prev => {
      if (!prev) return prev;
      const updated = [...prev.items];
      updated[index] = { ...updated[index], quantity };
      return { ...prev, items: updated };
    });
  };

  const updateItemPrice = (index: number, price: number) => {
    if (!editForm) return;
    setEditForm(prev => {
      if (!prev) return prev;
      const updated = [...prev.items];
      updated[index] = { ...updated[index], price };
      return { ...prev, items: updated };
    });
  };

  const removeItem = (index: number) => {
    if (!editForm) return;
    setEditForm(prev => {
      if (!prev) return prev;
      return { ...prev, items: prev.items.filter((_, i) => i !== index) };
    });
  };

  const calculateEditTotal = () => {
    if (!editForm) return 0;
    return editForm.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleSaveOrder = async () => {
    if (!editingOrder || !editForm) return;
    setSaving(true);

    const tableName = orderType === 'online' ? 'orders' : 'pos_orders';
    const newSubtotal = calculateEditTotal();

    const updateData: Record<string, unknown> = {
      customer_name: editForm.customer_name,
      status: editForm.status,
      notes: editForm.notes,
      items: editForm.items,
      subtotal: parseFloat(newSubtotal.toFixed(2)),
      updated_at: new Date().toISOString(),
    };

    if (orderType === 'online') {
      updateData.customer_whatsapp = editForm.customer_whatsapp;
      updateData.delivery_address = editForm.delivery_address;
      updateData.admin_notes = editForm.admin_notes;
      const deliveryFee = editingOrder.delivery_fee || 0;
      updateData.total_amount = parseFloat((newSubtotal + deliveryFee).toFixed(2));
    } else {
      updateData.payment_method = editForm.payment_method;
      updateData.total_amount = parseFloat(newSubtotal.toFixed(2));
    }

    const { error } = await supabase
      .from(tableName)
      .update(updateData)
      .eq('id', editingOrder.id);

    if (!error) {
      await loadOrders();
      if (selectedOrder?.id === editingOrder.id) {
        setSelectedOrder(null);
      }
      closeEditOrder();
    } else {
      alert('Failed to update order. Please try again.');
    }
    setSaving(false);
  };

  const currentOrders = orderType === 'online' ? orders : posOrders;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Orders</h1>

      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-center space-x-4 flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <label className="font-medium text-gray-700">Order Type:</label>
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setOrderType('online')}
                className={`px-4 py-2 font-medium transition ${
                  orderType === 'online'
                    ? 'bg-amber-900 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Online Orders
              </button>
              <button
                onClick={() => setOrderType('pos')}
                className={`px-4 py-2 font-medium transition ${
                  orderType === 'pos'
                    ? 'bg-amber-900 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                POS Orders
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <label className="font-medium text-gray-700">Filter by status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900"
            >
              <option value="">All Orders</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Order #</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Customer</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Total</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
                    <th className="text-right py-4 px-6 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className={`border-t border-gray-100 hover:bg-gray-50 cursor-pointer ${
                        selectedOrder?.id === order.id ? 'bg-amber-50' : ''
                      }`}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="py-4 px-6 font-medium">{order.order_number}</td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium">{order.customer_name}</p>
                          {orderType === 'online' && order.customer_whatsapp && (
                            <p className="text-sm text-gray-500">{order.customer_whatsapp}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 font-semibold">{'₹'}{order.total_amount.toFixed(2)}</td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditOrder(order);
                            }}
                            className="p-2 hover:bg-amber-50 rounded-lg transition text-amber-900"
                            title="Edit order"
                          >
                            <Pencil size={16} />
                          </button>
                          {orderType === 'online' && order.customer_whatsapp && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                sendWhatsAppMessage(order);
                              }}
                              className="p-2 hover:bg-gray-100 rounded-lg transition"
                              title="Send WhatsApp message"
                            >
                              <MessageSquare size={18} className="text-green-600" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          {selectedOrder ? (
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                <button
                  onClick={() => openEditOrder(selectedOrder)}
                  className="p-2 hover:bg-amber-50 rounded-lg transition text-amber-900"
                  title="Edit order"
                >
                  <Pencil size={16} />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm font-medium text-gray-600">Order Number</label>
                  <p className="font-semibold">{selectedOrder.order_number}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Date</label>
                  <p>{new Date(selectedOrder.created_at).toLocaleString()}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Customer</label>
                  <p className="font-medium">{selectedOrder.customer_name}</p>
                  {orderType === 'online' && selectedOrder.customer_whatsapp && (
                    <p className="text-sm text-gray-600">{selectedOrder.customer_whatsapp}</p>
                  )}
                </div>

                {orderType === 'online' && selectedOrder.delivery_address && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Delivery Address</label>
                    <p className="text-sm">{selectedOrder.delivery_address}</p>
                  </div>
                )}

                {orderType === 'pos' && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Payment Method</label>
                      <p className="capitalize">{selectedOrder.payment_method}</p>
                    </div>
                    {selectedOrder.payment_method === 'cash' && (
                      <>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Amount Paid</label>
                          <p>{'₹'}{selectedOrder.amount_paid?.toFixed(2) || '0.00'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Change</label>
                          <p>{'₹'}{selectedOrder.change_amount?.toFixed(2) || '0.00'}</p>
                        </div>
                      </>
                    )}
                  </>
                )}

                {selectedOrder.notes && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Customer Notes</label>
                    <p className="text-sm">{selectedOrder.notes}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-2">Status</label>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => updateStatus(selectedOrder.id, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item: OrderItem, index: number) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.product_name || item.name} x{item.quantity}</span>
                      <span className="font-semibold">{'₹'}{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-amber-900">{'₹'}{selectedOrder.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md p-6 text-center text-gray-500">
              Select an order to view details
            </div>
          )}
        </div>
      </div>

      {editingOrder && editForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Edit Order</h2>
                <p className="text-sm text-gray-500 mt-0.5">{editingOrder.order_number}</p>
              </div>
              <button
                onClick={closeEditOrder}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={editForm.customer_name}
                    onChange={(e) => setEditForm(prev => prev ? { ...prev, customer_name: e.target.value } : prev)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm(prev => prev ? { ...prev, status: e.target.value } : prev)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900 transition"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {orderType === 'online' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
                    <input
                      type="text"
                      value={editForm.customer_whatsapp}
                      onChange={(e) => setEditForm(prev => prev ? { ...prev, customer_whatsapp: e.target.value } : prev)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                    <input
                      type="text"
                      value={editForm.delivery_address}
                      onChange={(e) => setEditForm(prev => prev ? { ...prev, delivery_address: e.target.value } : prev)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900 transition"
                    />
                  </div>
                </div>
              )}

              {orderType === 'pos' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select
                    value={editForm.payment_method}
                    onChange={(e) => setEditForm(prev => prev ? { ...prev, payment_method: e.target.value } : prev)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900 transition"
                  >
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order Items</label>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-2.5 px-4 font-medium text-gray-600">Item</th>
                        <th className="text-center py-2.5 px-4 font-medium text-gray-600 w-24">Qty</th>
                        <th className="text-right py-2.5 px-4 font-medium text-gray-600 w-28">Price</th>
                        <th className="text-right py-2.5 px-4 font-medium text-gray-600 w-28">Subtotal</th>
                        <th className="w-12"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {editForm.items.map((item, index) => (
                        <tr key={index} className="border-t border-gray-100">
                          <td className="py-3 px-4 font-medium text-gray-900">
                            {item.product_name || item.name}
                            {item.variant && (
                              <span className="block text-xs text-gray-500">{item.variant}</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                              className="w-full text-center px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900 transition"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="number"
                              min={0}
                              step="0.01"
                              value={item.price}
                              onChange={(e) => updateItemPrice(index, parseFloat(e.target.value) || 0)}
                              className="w-full text-right px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900 transition"
                            />
                          </td>
                          <td className="py-3 px-4 text-right font-semibold text-gray-900">
                            {'₹'}{(item.price * item.quantity).toFixed(2)}
                          </td>
                          <td className="py-3 px-2">
                            {editForm.items.length > 1 && (
                              <button
                                onClick={() => removeItem(index)}
                                className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition"
                                title="Remove item"
                              >
                                <X size={14} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr className="border-t border-gray-200">
                        <td colSpan={3} className="py-3 px-4 text-right font-bold text-gray-900">
                          Total
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-amber-900 text-base">
                          {'₹'}{calculateEditTotal().toFixed(2)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm(prev => prev ? { ...prev, notes: e.target.value } : prev)}
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900 resize-none transition"
                  placeholder="Customer notes..."
                />
              </div>

              {orderType === 'online' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes</label>
                  <textarea
                    value={editForm.admin_notes}
                    onChange={(e) => setEditForm(prev => prev ? { ...prev, admin_notes: e.target.value } : prev)}
                    rows={2}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900 resize-none transition"
                    placeholder="Internal notes..."
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-2xl">
              <button
                onClick={closeEditOrder}
                className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveOrder}
                disabled={saving || !editForm.customer_name.trim() || editForm.items.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 bg-amber-900 text-white rounded-lg hover:bg-amber-800 font-medium transition disabled:opacity-50"
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
