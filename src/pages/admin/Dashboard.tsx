import { useEffect, useState } from 'react';
import { Package, ShoppingBag, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalPosOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
    lowStock: 0,
    totalRevenue: 0,
    posRevenue: 0,
    totalCustomers: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    loadStats();
    loadRecentOrders();
  }, []);

  const loadStats = async () => {
    const [orders, posOrders, products, customers] = await Promise.all([
      supabase.from('orders').select('total_amount, status'),
      supabase.from('pos_orders').select('total_amount, status'),
      supabase.from('products').select('stock_quantity, low_stock_threshold'),
      supabase.from('user_profiles').select('id'),
    ]);

    const totalOrders = orders.data?.length || 0;
    const totalPosOrders = posOrders.data?.length || 0;
    const pendingOrders = orders.data?.filter(o => o.status === 'pending').length || 0;
    const totalRevenue = orders.data?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;
    const posRevenue = posOrders.data?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;
    const totalProducts = products.data?.length || 0;
    const lowStock = products.data?.filter(p => p.stock_quantity <= p.low_stock_threshold).length || 0;
    const totalCustomers = customers.data?.length || 0;

    setStats({
      totalOrders,
      totalPosOrders,
      pendingOrders,
      totalProducts,
      lowStock,
      totalRevenue,
      posRevenue,
      totalCustomers,
    });
  };

  const loadRecentOrders = async () => {
    const [onlineOrders, posOrdersData] = await Promise.all([
      supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
      supabase.from('pos_orders').select('*').order('created_at', { ascending: false }).limit(5),
    ]);

    const combined = [
      ...(onlineOrders.data || []).map(o => ({ ...o, type: 'online' })),
      ...(posOrdersData.data || []).map(o => ({ ...o, type: 'pos' }))
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10);

    setRecentOrders(combined);
  };

  const statCards = [
    {
      title: 'Online Orders',
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: 'bg-blue-500',
    },
    {
      title: 'POS Orders',
      value: stats.totalPosOrders,
      icon: ShoppingBag,
      color: 'bg-cyan-500',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: AlertCircle,
      color: 'bg-yellow-500',
    },
    {
      title: 'Online Revenue',
      value: `₹${stats.totalRevenue.toFixed(2)}`,
      icon: TrendingUp,
      color: 'bg-green-500',
    },
    {
      title: 'POS Revenue',
      value: `₹${stats.posRevenue.toFixed(2)}`,
      icon: TrendingUp,
      color: 'bg-emerald-500',
    },
    {
      title: 'Total Revenue',
      value: `₹${(stats.totalRevenue + stats.posRevenue).toFixed(2)}`,
      icon: TrendingUp,
      color: 'bg-green-700',
    },
    {
      title: 'Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-amber-500',
    },
    {
      title: 'Low Stock Items',
      value: stats.lowStock,
      icon: AlertCircle,
      color: 'bg-red-500',
    },
    {
      title: 'Customers',
      value: stats.totalCustomers,
      icon: Users,
      color: 'bg-slate-500',
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((card) => (
          <div key={card.title} className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
              </div>
              <div className={`${card.color} p-4 rounded-lg`}>
                <card.icon size={28} className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Orders</h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Order #</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Total</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      order.type === 'pos' ? 'bg-cyan-100 text-cyan-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {order.type === 'pos' ? 'POS' : 'Online'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-amber-900 font-medium">
                      {order.order_number}
                    </span>
                  </td>
                  <td className="py-3 px-4">{order.customer_name}</td>
                  <td className="py-3 px-4 font-semibold">₹{order.total_amount.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
