import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react';

const Cart = () => {
  const { cartItems, addToCart, removeFromCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const checkoutHandler = () => {
    if (user) navigate('/checkout');
    else navigate('/login?redirect=/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
        <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Your cart is empty</h2>
        <p className="text-gray-500">Looks like you haven't added anything yet.</p>
        <Link to="/" className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-blue-500/30">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8">
      <h1 className="text-3xl font-black text-gray-900 mb-8">Shopping Cart</h1>

      <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <ul className="divide-y divide-gray-100">
              {cartItems.map((item) => (
                <li key={item.product} className="p-6 flex py-6 sm:py-8">
                  <div className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden border border-gray-100">
                    <img
                      src={item.image || '/localstore.svg'}
                      alt={item.name}
                      className="w-full h-full object-center object-cover"
                    />
                  </div>

                  <div className="ml-4 flex-1 flex flex-col justify-between sm:ml-6">
                    <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                      <div>
                        <div className="flex justify-between">
                          <h3 className="text-lg font-semibold text-gray-900">
                            <Link to={`/products/${item.product}`} className="hover:text-blue-600 transition-colors">
                              {item.name}
                            </Link>
                          </h3>
                        </div>
                        <p className="mt-1 text-xl font-black text-blue-600">₹{item.price.toFixed(2)}</p>
                      </div>

                      <div className="mt-4 sm:mt-0 sm:pr-9 flex items-center gap-4">
                        <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                          <button
                            onClick={() => addToCart(item, item.qty - 1)}
                            disabled={item.qty <= 1}
                            className="p-2 text-gray-600 hover:text-blue-600 disabled:opacity-50 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-4 font-semibold text-gray-900">{item.qty}</span>
                          <button
                            onClick={() => addToCart(item, item.qty + 1)}
                            disabled={item.qty >= item.stock}
                            className="p-2 text-gray-600 hover:text-blue-600 disabled:opacity-50 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors ml-auto sm:ml-0"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 lg:mt-0 lg:col-span-4 sticky top-24">
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">Order Summary</h2>

          <dl className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <dt className="text-sm text-gray-600">Subtotal ({cartItems.reduce((acc, item) => acc + item.qty, 0)} items)</dt>
              <dd className="text-sm font-medium text-gray-900">
                ₹{cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2)}
              </dd>
            </div>
            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
              <dt className="text-base font-bold text-gray-900">Order total</dt>
              <dd className="text-xl font-black text-blue-600">
                ₹{cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2)}
              </dd>
            </div>
          </dl>

          <div className="mt-8">
            <button
              onClick={checkoutHandler}
              className="w-full bg-blue-600 border border-transparent rounded-xl shadow-sm py-4 px-4 text-base font-bold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors flex items-center justify-center gap-2"
            >
              Proceed to Checkout
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
