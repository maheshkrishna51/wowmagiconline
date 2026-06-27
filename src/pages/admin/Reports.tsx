import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { TrendingUp, DollarSign, ShoppingBag, Users, Package, Calendar, AlertTriangle, Box, FileDown } from 'lucide-react';
import { downloadReportPdf } from '../../utils/generateReportPdf';

interface ReportStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueGrowth: number;
  ordersGrowth: number;
}

interface SalesData {
  date: string;
  revenue: number;
  orders: number;
}

interface InventoryItem {
  id: string;
  name: string;
  image_url: string;
  category: string;
  category_id: string;
  stock: number;
  cost_price: number;
  price: number;
  cost_value: number;
  sales_value: number;
  is_low_stock: boolean;
}

export default function Reports() {
  const [stats, setStats] = useState<ReportStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    revenueGrowth: 0,
    ordersGrowth: 0,
  });
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dateRange, setDateRange] = useState('7days');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'sales' | 'inventory'>('sales');

  useEffect(() => {
    fetchReportData();
    fetchInventoryData();
    fetchCategories();
  }, [dateRange]);

  const fetchCategories = async () => {
    try {
      const { data } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');

      if (data) {
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchInventoryData = async () => {
    try {
      const { data: products } = await supabase
        .from('products')
        .select(`
          id,
          name,
          images,
          category_id,
          categories (name),
          stock_quantity,
          price,
          cost_price
        `)
        .order('stock_quantity', { ascending: true });

      if (products) {
        const inventoryItems: InventoryItem[] = products.map(product => {
          const images = product.images as string[] | null;
          return {
          id: product.id,
          name: product.name,
          image_url: images?.[0] || '',
          category: product.categories?.name || 'Uncategorized',
          category_id: product.category_id,
          stock: product.stock_quantity,
          cost_price: parseFloat(product.cost_price || '0'),
          price: parseFloat(product.price),
          cost_value: product.stock_quantity * parseFloat(product.cost_price || '0'),
          sales_value: product.stock_quantity * parseFloat(product.price),
          is_low_stock: product.stock_quantity <= 10,
        };
        });

        setInventoryData(inventoryItems);
      }
    } catch (error) {
      console.error('Error fetching inventory data:', error);
    }
  };

  const fetchReportData = async () => {
    try {
      setLoading(true);

      const endDate = new Date();
      let startDate = new Date();

      switch (dateRange) {
        case '7days':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30days':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90days':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case 'year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      const { data: allOrders } = await supabase
        .from('orders')
        .select('total_amount, created_at');

      const { data: customers } = await supabase
        .from('user_profiles')
        .select('id');

      const { data: products } = await supabase
        .from('products')
        .select('id');

      const totalRevenue = orders?.reduce((sum, order) => sum + parseFloat(order.total_amount), 0) || 0;
      const totalOrders = orders?.length || 0;

      const previousPeriodStart = new Date(startDate);
      previousPeriodStart.setTime(previousPeriodStart.getTime() - (endDate.getTime() - startDate.getTime()));

      const { data: previousOrders } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', previousPeriodStart.toISOString())
        .lt('created_at', startDate.toISOString());

      const previousRevenue = previousOrders?.reduce((sum, order) => sum + parseFloat(order.total_amount), 0) || 0;
      const previousOrderCount = previousOrders?.length || 0;

      const revenueGrowth = previousRevenue > 0
        ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
        : 0;
      const ordersGrowth = previousOrderCount > 0
        ? ((totalOrders - previousOrderCount) / previousOrderCount) * 100
        : 0;

      const salesByDate: { [key: string]: { revenue: number; orders: number } } = {};
      orders?.forEach(order => {
        const date = new Date(order.created_at).toISOString().split('T')[0];
        if (!salesByDate[date]) {
          salesByDate[date] = { revenue: 0, orders: 0 };
        }
        salesByDate[date].revenue += parseFloat(order.total_amount);
        salesByDate[date].orders += 1;
      });

      const salesDataArray = Object.entries(salesByDate)
        .map(([date, data]) => ({
          date,
          revenue: data.revenue,
          orders: data.orders,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      setStats({
        totalRevenue,
        totalOrders,
        totalCustomers: customers?.length || 0,
        totalProducts: products?.length || 0,
        revenueGrowth,
        ordersGrowth,
      });

      setSalesData(salesDataArray);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-900" />
      </div>
    );
  }

  const maxRevenue = Math.max(...salesData.map(d => d.revenue), 1);

  const filteredInventory = selectedCategory === 'all'
    ? inventoryData
    : inventoryData.filter(item => item.category_id === selectedCategory);

  const lowStockCount = filteredInventory.filter(item => item.is_low_stock).length;
  const totalCostValue = filteredInventory.reduce((sum, item) => sum + item.cost_value, 0);
  const totalSalesValue = filteredInventory.reduce((sum, item) => sum + item.sales_value, 0);
  const potentialProfit = totalSalesValue - totalCostValue;
  const outOfStockCount = filteredInventory.filter(item => item.stock === 0).length;

  const handleDownloadPdf = () => {
    if (activeTab === 'sales') {
      downloadReportPdf({
        type: 'sales',
        dateRange,
        totalRevenue: stats.totalRevenue,
        totalOrders: stats.totalOrders,
        totalCustomers: stats.totalCustomers,
        totalProducts: stats.totalProducts,
        revenueGrowth: stats.revenueGrowth,
        ordersGrowth: stats.ordersGrowth,
        salesData,
      });
    } else {
      const categoryName = selectedCategory === 'all'
        ? 'All Categories'
        : categories.find(c => c.id === selectedCategory)?.name || 'Unknown';

      downloadReportPdf({
        type: 'inventory',
        categoryName,
        totalCostValue,
        totalSalesValue,
        potentialProfit,
        lowStockCount,
        outOfStockCount,
        items: filteredInventory,
      });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <div className="flex items-center space-x-3">
          <Calendar size={20} className="text-gray-500" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
            <option value="year">Last year</option>
          </select>
          <button
            onClick={handleDownloadPdf}
            className="flex items-center space-x-2 px-4 py-2 bg-amber-900 text-white rounded-lg hover:bg-amber-800 transition font-medium"
          >
            <FileDown size={18} />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setActiveTab('sales')}
          className={`px-6 py-3 rounded-lg font-semibold transition ${activeTab === 'sales'
              ? 'bg-amber-900 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Sales Report
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-6 py-3 rounded-lg font-semibold transition ${activeTab === 'inventory'
              ? 'bg-amber-900 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Inventory Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ₹{stats.totalRevenue.toFixed(2)}
              </p>
              {stats.revenueGrowth !== 0 && (
                <p className={`text-sm mt-2 flex items-center ${stats.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <TrendingUp size={16} className="mr-1" />
                  {stats.revenueGrowth > 0 ? '+' : ''}{stats.revenueGrowth.toFixed(1)}% vs previous period
                </p>
              )}
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalOrders}</p>
              {stats.ordersGrowth !== 0 && (
                <p className={`text-sm mt-2 flex items-center ${stats.ordersGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <TrendingUp size={16} className="mr-1" />
                  {stats.ordersGrowth > 0 ? '+' : ''}{stats.ordersGrowth.toFixed(1)}% vs previous period
                </p>
              )}
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <ShoppingBag size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalCustomers}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Users size={24} className="text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalProducts}</p>
            </div>
            <div className="bg-amber-100 p-3 rounded-lg">
              <Package size={24} className="text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {activeTab === 'sales' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Sales Overview</h2>

          {salesData.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-12 gap-2 items-end h-64">
              {salesData.map((data, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="w-full bg-amber-200 rounded-t hover:bg-amber-300 transition cursor-pointer relative group"
                    style={{ height: `${(data.revenue / maxRevenue) * 100}%`, minHeight: '20px' }}
                  >
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                      ₹{data.revenue.toFixed(2)}<br />{data.orders} orders
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2 rotate-45 origin-left">
                    {new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Orders</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Revenue</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Avg Order Value</th>
                  </tr>
                </thead>
                <tbody>
                  {salesData.map((data, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-900">
                        {new Date(data.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-900">{data.orders}</td>
                      <td className="py-3 px-4 text-right text-gray-900">₹{data.revenue.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right text-gray-900">
                        ₹{(data.revenue / data.orders).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No sales data available for this period</p>
          )}
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
            <div className="flex items-center space-x-3">
              <label className="text-sm font-semibold text-gray-700">Filter by Category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cost Value</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    ₹{totalCostValue.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Inventory at cost</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <DollarSign size={24} className="text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sales Value</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    ₹{totalSalesValue.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Potential revenue</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <DollarSign size={24} className="text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Potential Profit</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    ₹{potentialProfit.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {totalCostValue > 0 ? `${((potentialProfit / totalCostValue) * 100).toFixed(1)}% margin` : 'N/A'}
                  </p>
                </div>
                <div className="bg-amber-100 p-3 rounded-lg">
                  <TrendingUp size={24} className="text-amber-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{outOfStockCount}</p>
                  <p className="text-xs text-gray-500 mt-1">Needs restock</p>
                </div>
                <div className="bg-red-100 p-3 rounded-lg">
                  <Box size={24} className="text-red-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Low Stock Alert</h3>
              <div className="space-y-3">
                {lowStockCount > 0 ? (
                  filteredInventory
                    .filter(item => item.is_low_stock)
                    .slice(0, 5)
                    .map(item => (
                      <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-500">{item.category}</p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                          {item.stock} units
                        </span>
                      </div>
                    ))
                ) : (
                  <p className="text-gray-500 text-center py-4">All products are adequately stocked</p>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Top 5 Products by Value</h3>
              <div className="space-y-3">
                {filteredInventory
                  .sort((a, b) => b.sales_value - a.sales_value)
                  .slice(0, 5)
                  .map(item => (
                    <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.stock} units in stock</p>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        ₹{item.sales_value.toFixed(2)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Detailed Inventory Report</h2>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Product</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Stock</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Cost Price</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Selling Price</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Cost Value</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Sales Value</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-900 font-medium">{item.name}</td>
                      <td className="py-3 px-4 text-gray-600">{item.category}</td>
                      <td className={`py-3 px-4 text-right font-semibold ${
                        item.stock === 0 ? 'text-red-600' : item.is_low_stock ? 'text-yellow-600' : 'text-gray-900'
                      }`}>
                        {item.stock}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600">₹{item.cost_price.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right text-gray-900">₹{item.price.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right text-gray-600 font-semibold">
                        ₹{item.cost_value.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-900 font-semibold">
                        ₹{item.sales_value.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {item.stock === 0 ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Out of Stock
                          </span>
                        ) : item.is_low_stock ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            In Stock
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 font-semibold border-t-2">
                    <td colSpan={5} className="py-3 px-4 text-right text-gray-900">Totals:</td>
                    <td className="py-3 px-4 text-right text-gray-900">₹{totalCostValue.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right text-gray-900">₹{totalSalesValue.toFixed(2)}</td>
                    <td></td>
                  </tr>
                  <tr className="bg-amber-50 font-semibold">
                    <td colSpan={5} className="py-3 px-4 text-right text-gray-900">Potential Profit:</td>
                    <td colSpan={2} className="py-3 px-4 text-right text-amber-900 text-lg">
                      ₹{potentialProfit.toFixed(2)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}