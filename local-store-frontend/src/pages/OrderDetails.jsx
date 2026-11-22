import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { CheckCircle2, Clock, Package, Truck, ArrowLeft, MapPin } from 'lucide-react';

const OrderDetails = () => {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const { data } = await api.get(`/api/orders/${id}`);
        setOrder(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

  if (loading) return <div className="text-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div></div>;

  if (error) return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="bg-red-50 text-red-600 p-4 rounded-xl">{error}</div>
      <Link to="/myorders" className="text-blue-600 hover:underline mt-4 inline-block font-medium">← Back to My Orders</Link>
    </div>
  );

  if (!order) return null;

  // Define tracking steps
  const steps = [
    { id: 'Pending', name: 'Order Received', icon: Clock },
    { id: 'Packed', name: 'Order Packed', icon: Package },
    { id: 'Out for Delivery', name: 'Out for Delivery', icon: Truck },
    { id: 'Delivered', name: 'Delivered', icon: CheckCircle2 }
  ];

  const getStepIndex = (status) => {
    if (status === 'Cancelled') return -1;
    return steps.findIndex(step => step.id === status);
  };

  const currentStepIndex = getStepIndex(order.status);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <Link to="/myorders" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to My Orders
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Order #{order._id.substring(order._id.length - 8).toUpperCase()}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </p>
          </div>
          {order.status === 'Cancelled' ? (
            <span className="bg-red-100 text-red-700 px-4 py-2 rounded-lg font-bold text-sm text-center">
              Order Cancelled
            </span>
          ) : (
            <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-bold text-sm text-center">
              Total: ₹{order.totalPrice.toFixed(2)}
            </span>
          )}
          {(order.shippingPrice > 0 || order.discount > 0) && (
            <p className="text-sm text-gray-500 sm:text-right">
              Items ₹{(order.itemsPrice ?? order.totalPrice).toFixed(2)}
              {order.shippingPrice > 0 ? ` · Delivery ₹${order.shippingPrice.toFixed(2)}` : ''}
              {order.discount > 0 ? ` · ${order.couponCode || 'Coupon'} −₹${order.discount.toFixed(2)}` : ''}
            </p>
          )}
        </div>

        {/* Tracking Timeline */}
        {order.status !== 'Cancelled' && (
          <div className="p-8 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-8">Order Status</h2>
            <div className="relative">
              <div className="absolute left-8 top-0 h-full w-0.5 bg-gray-200" aria-hidden="true"></div>
              <ul className="relative space-y-8">
                {steps.map((step, stepIdx) => {
                  const isCompleted = stepIdx <= currentStepIndex;
                  const isCurrent = stepIdx === currentStepIndex;
                  const Icon = step.icon;

                  return (
                    <li key={step.name} className="relative flex items-start gap-6">
                      <span className={`relative flex h-16 w-16 items-center justify-center rounded-full border-4 z-10 bg-white
                        ${isCompleted ? 'border-blue-600' : 'border-gray-300'}
                      `}>
                        <Icon className={`h-6 w-6 ${isCompleted ? 'text-blue-600' : 'text-gray-400'}`} />
                      </span>
                      <div className="flex flex-col justify-center min-h-[4rem]">
                        <h3 className={`text-lg font-bold ${isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                          {step.name}
                        </h3>
                        {isCurrent && step.id === 'Pending' && (
                          <p className="text-sm text-gray-500">We are assigning a delivery partner.</p>
                        )}
                        {isCurrent && step.id === 'Out for Delivery' && (
                          <p className="text-sm text-blue-600 font-medium">Arriving in approx. 9-12 minutes!</p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}

        {/* Shipping details */}
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Delivery Address</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {order.shippingAddress.address}<br />
                {order.shippingAddress.city}, {order.shippingAddress.postalCode}<br />
                {order.shippingAddress.country}
              </p>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="p-6">
          <h3 className="font-bold text-gray-900 mb-4">Items Summary</h3>
          <ul className="space-y-4">
            {order.orderItems.map((item) => (
              <li key={item._id} className="flex justify-between items-center py-2">
                <div className="flex items-center gap-4">
                  <div className="bg-gray-100 w-12 h-12 rounded-lg flex items-center justify-center font-bold text-gray-500 text-sm">
                    {item.quantity}x
                  </div>
                  <span className="text-gray-900 font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
};

export default OrderDetails;
