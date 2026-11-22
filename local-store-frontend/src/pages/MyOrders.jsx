import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { Package, Clock, CheckCircle, ChevronRight, Truck, XCircle } from 'lucide-react';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/api/orders/myorders');
        setOrders(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'text-orange-500 bg-orange-50';
      case 'Packed': return 'text-blue-500 bg-blue-50';
      case 'Out for Delivery': return 'text-indigo-600 bg-indigo-50';
      case 'Delivered': return 'text-green-600 bg-green-50';
      case 'Cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return <Clock className="w-5 h-5" />;
      case 'Packed': return <Package className="w-5 h-5" />;
      case 'Out for Delivery': return <Truck className="w-5 h-5" />;
      case 'Delivered': return <CheckCircle className="w-5 h-5" />;
      case 'Cancelled': return <XCircle className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  if (loading) return <div className="text-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div></div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-black text-gray-900 mb-8">My Orders</h1>

      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl">{error}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h2>
          <p className="text-gray-500 mb-6">Looks like you haven't placed any orders yet.</p>
          <Link to="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              to={`/order/${order._id}`}
              key={order._id}
              className="block bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow group cursor-pointer"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${getStatusColor(order.status).split(' ')[1]}`}>
                    {getStatusIcon(order.status)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium mb-1">
                      Order #{order._id.substring(order._id.length - 8)}
                    </p>
                    <p className="text-gray-900 font-bold">
                      {order.orderItems.length} item{order.orderItems.length > 1 ? 's' : ''} • ₹{order.totalPrice.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-0 pt-4 sm:pt-0 mt-2 sm:mt-0 border-gray-100">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  <ChevronRight className="w-6 h-6 text-gray-300 group-hover:text-blue-600 transition-colors" />
                </div>

              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
