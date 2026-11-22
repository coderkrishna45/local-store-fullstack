import { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { ShoppingBag, ChevronRight } from 'lucide-react';

const FloatingCart = () => {
  const { cartItems } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show floating cart on these pages
  if (cartItems.length === 0 || location.pathname === '/cart' || location.pathname === '/checkout') {
    return null;
  }

  const itemsCount = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const totalPrice = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 px-4 sm:px-0 sm:max-w-md sm:mx-auto">
      <div
        onClick={() => navigate('/cart')}
        className="bg-blue-600 text-white rounded-xl shadow-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-blue-700 transition-all transform hover:-translate-y-1"
      >
        <div className="flex items-center space-x-4">
          <div className="relative">
            <ShoppingBag className="w-8 h-8" />
            <span className="absolute -top-2 -right-2 bg-white text-blue-600 text-xs font-black rounded-full h-5 w-5 flex items-center justify-center border-2 border-blue-600">
              {itemsCount}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold opacity-90">{itemsCount} Item{itemsCount > 1 && 's'}</span>
            <span className="text-lg font-black">₹{totalPrice.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex items-center text-sm font-bold bg-blue-500/50 px-3 py-2 rounded-lg">
          View Cart <ChevronRight className="w-5 h-5 ml-1" />
        </div>
      </div>
    </div>
  );
};

export default FloatingCart;
