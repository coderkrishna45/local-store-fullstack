import { useState, useEffect, useContext } from 'react';
import api from '../api';
import Inventory from '../components/Inventory';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Package, ShoppingBag, Users, TrendingUp } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    orders: 0,
    revenue: 0,
  });
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const [ordersRes, productsRes, categoriesRes] = await Promise.all([
          api.get('/api/orders'),
          api.get('/api/products'),
          api.get('/api/categories'),
        ]);

        const orders = ordersRes.data;
        setProducts(productsRes.data);
        setCategories(categoriesRes.data);

        const delivered = orders.filter(order => order.status === 'Delivered');
        const totalRevenue = delivered.reduce((sum, order) => sum + order.totalPrice, 0);
        const monthlyTotals = new Map();
        for (const order of delivered) {
          const month = order.createdAt.slice(0, 7);
          monthlyTotals.set(month, (monthlyTotals.get(month) || 0) + order.totalPrice);
        }
        setChartData([...monthlyTotals.entries()].sort(([a], [b]) => a.localeCompare(b))
          .map(([name, sales]) => ({ name, sales })));

        setStats({
          orders: orders.length,
          revenue: totalRevenue,
        });

        setRecentOrders(orders.slice(0, 5));
        setLoading(false);
      } catch (error) {
        setError(error.response?.data?.message || 'Could not load the dashboard.');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, navigate]);

  if (loading) return <div className="text-center py-20">Loading dashboard...</div>;
  if (error) return <p role="alert" className="text-center py-20">{error}</p>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Admin Dashboard</h2>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="bg-blue-100 p-3 rounded-xl"><ShoppingBag className="w-8 h-8 text-blue-600" /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Products</p>
            <p className="text-2xl font-bold text-gray-900">{products.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="bg-purple-100 p-3 rounded-xl"><Package className="w-8 h-8 text-purple-600" /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900">{stats.orders}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="bg-green-100 p-3 rounded-xl"><TrendingUp className="w-8 h-8 text-green-600" /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Revenue</p>
            <p className="text-2xl font-bold text-gray-900">₹{stats.revenue.toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="bg-red-100 p-3 rounded-xl"><Users className="w-8 h-8 text-red-600" /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Low Stock Items</p>
            <p className="text-2xl font-bold text-gray-900">{products.filter(product => product.stock <= 5).length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Delivered Order Revenue by Order Month</h3>
          {chartData.length === 0 ? <p>No delivered orders yet.</p> : <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#F3F4F6'}} />
                <Bar dataKey="sales" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>}
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Recent Orders</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">ID</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3 rounded-r-lg">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order._id} className="border-b border-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900 truncate max-w-[100px]">{order._id.substring(0, 8)}...</td>
                    <td className="px-4 py-3">₹{order.totalPrice.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold
                        ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                          order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan="3" className="px-4 py-4 text-center text-gray-500">No orders yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Inventory products={products} categories={categories} onProductsChange={setProducts} />
    </div>
  );
};

export default AdminDashboard;
