import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import api from '../api';

const Checkout = () => {
  const { user } = useContext(AuthContext);
  const { cartItems, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  const savedAddress = JSON.parse(localStorage.getItem('shippingAddress')) || {};

  const [address, setAddress] = useState(savedAddress.address || '');
  const [city, setCity] = useState(savedAddress.city || '');
  const [postalCode, setPostalCode] = useState(savedAddress.postalCode || '');
  const [country, setCountry] = useState(savedAddress.country || 'India');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Coupon State
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=checkout');
    }
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [user, navigate, cartItems]);

  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const shippingPrice = itemsPrice > 100 ? 0 : 10;

  // Calculate discount based on applied coupon
  useEffect(() => {
    if (appliedCoupon === 'SAVE200' && itemsPrice >= 1000) {
      setDiscountAmount(200);
    } else if (appliedCoupon === 'SAVE50' && itemsPrice >= 200) {
      setDiscountAmount(50);
    } else if (appliedCoupon === 'SAVE20' && itemsPrice >= 100) {
      setDiscountAmount(20);
    } else {
      setDiscountAmount(0);
      setAppliedCoupon(null);
    }
  }, [itemsPrice, appliedCoupon]);

  const totalPrice = itemsPrice + shippingPrice - discountAmount;

  const handleApplyCoupon = (code) => {
    const uppercaseCode = code.trim().toUpperCase();
    if (uppercaseCode === 'SAVE200' && itemsPrice >= 1000) {
      setAppliedCoupon('SAVE200');
    } else if (uppercaseCode === 'SAVE50' && itemsPrice >= 200) {
      setAppliedCoupon('SAVE50');
    } else if (uppercaseCode === 'SAVE20' && itemsPrice >= 100) {
      setAppliedCoupon('SAVE20');
    } else {
      alert('Coupon is invalid or threshold not met.');
    }
  };

  const placeOrderHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post(
        '/api/orders',
        {
          orderItems: cartItems.map(item => ({
            product: item.product,
            quantity: item.qty,
          })),
          shippingAddress: { address, city, postalCode, country },
          paymentMethod: 'COD',
          couponCode: appliedCoupon,
        }
      );

      // Save address for future use
      localStorage.setItem('shippingAddress', JSON.stringify({ address, city, postalCode, country }));

      clearCart();
      setLoading(false);
      alert('Order placed successfully! Order ID: ' + data._id);
      navigate('/myorders'); // Redirect to My Orders instead of Home
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">

        {/* Shipping Form */}
        <div className="lg:col-span-8">
          <form onSubmit={placeOrderHandler} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping Address</h2>

            {error && <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">{error}</div>}

            <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <div className="mt-1">
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <div className="mt-1">
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                <div className="mt-1">
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Country</label>
                <div className="mt-1">
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-gray-100 pt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Method</h2>
              <div className="flex items-center">
                <input
                  id="cod"
                  name="paymentMethod"
                  type="radio"
                  defaultChecked
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                />
                <label htmlFor="cod" className="ml-3 block text-sm font-medium text-gray-700">
                  Cash on Delivery (COD)
                </label>
              </div>
            </div>

            {/* Expected Delivery Time */}
            <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-6 flex items-start space-x-4">
              <div className="text-3xl">⚡</div>
              <div>
                <h3 className="text-lg font-bold text-blue-900">Superfast Delivery</h3>
                <p className="text-blue-700 mt-1">Expected delivery in <span className="font-bold">9-12 minutes</span>.</p>
                <p className="text-sm text-blue-600 mt-1">Your order is prepared at the nearest dark store.</p>
              </div>
            </div>
          </form>
        </div>

        {/* Order Summary Sidebar */}
        <div className="mt-16 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 lg:mt-0 lg:col-span-4 sticky top-24">
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">Order Summary</h2>

          <ul className="mt-6 space-y-4 max-h-60 overflow-y-auto">
            {cartItems.map((item, index) => (
              <li key={index} className="flex justify-between items-center text-sm">
                <span className="text-gray-600 flex-1 truncate pr-4">{item.name} x {item.qty}</span>
                <span className="font-medium text-gray-900">₹{(item.price * item.qty).toFixed(2)}</span>
              </li>
            ))}
          </ul>

          <dl className="mt-6 space-y-4 border-t border-gray-100 pt-6">
            <div className="flex items-center justify-between">
              <dt className="text-sm text-gray-600">Items</dt>
              <dd className="text-sm font-medium text-gray-900">₹{itemsPrice.toFixed(2)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-sm text-gray-600">Shipping</dt>
              <dd className="text-sm font-medium text-gray-900">₹{shippingPrice.toFixed(2)}</dd>
            </div>
            {discountAmount > 0 && (
              <div className="flex items-center justify-between text-green-600 font-bold">
                <dt className="text-sm">Discount ({appliedCoupon})</dt>
                <dd className="text-sm">-₹{discountAmount.toFixed(2)}</dd>
              </div>
            )}

            {/* Coupon Section */}
            <div className="border-t border-gray-100 pt-4 pb-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Have a coupon?</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Enter code"
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm uppercase"
                />
                <button
                  onClick={() => handleApplyCoupon(couponInput)}
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-900 hover:bg-gray-800 focus:outline-none"
                >
                  Apply
                </button>
              </div>

              {/* Eligible Coupons Hint */}
              <div className="mt-3 flex flex-wrap gap-2">
                {itemsPrice >= 100 && (
                   <button onClick={() => handleApplyCoupon('SAVE20')} className="text-xs bg-green-50 text-green-700 px-2 py-1 border border-green-200 rounded font-bold hover:bg-green-100">Use SAVE20 (-₹20)</button>
                )}
                {itemsPrice >= 200 && (
                   <button onClick={() => handleApplyCoupon('SAVE50')} className="text-xs bg-green-50 text-green-700 px-2 py-1 border border-green-200 rounded font-bold hover:bg-green-100">Use SAVE50 (-₹50)</button>
                )}
                {itemsPrice >= 1000 && (
                   <button onClick={() => handleApplyCoupon('SAVE200')} className="text-xs bg-green-50 text-green-700 px-2 py-1 border border-green-200 rounded font-bold hover:bg-green-100">Use SAVE200 (-₹200)</button>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
              <dt className="text-base font-bold text-gray-900">Total</dt>
              <dd className="text-xl font-black text-blue-600">₹{totalPrice.toFixed(2)}</dd>
            </div>
          </dl>

          <div className="mt-8">
            <button
              onClick={placeOrderHandler}
              disabled={loading}
              className={`w-full bg-blue-600 border border-transparent rounded-xl shadow-sm py-4 px-4 text-base font-bold text-white transition-colors flex items-center justify-center ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'}`}
            >
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
