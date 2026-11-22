import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { ShoppingCart, User, LogOut, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const cartItemCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                LocalStore
              </h1>
            </Link>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            <Link to="/products" className="hidden sm:inline text-gray-600 hover:text-blue-600 font-medium transition-colors">
              Products
            </Link>

            <Link to="/cart" aria-label={`Cart, ${cartItemCount} items`} className="text-gray-600 hover:text-blue-600 font-medium transition-colors relative">
              <ShoppingCart className="w-6 h-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center space-x-4">
                {user.role === 'admin' && (
                  <Link to="/admin" aria-label="Admin dashboard" className="text-gray-600 hover:text-blue-600 flex items-center transition-colors" title="Dashboard">
                    <LayoutDashboard className="w-5 h-5" />
                  </Link>
                )}
                <Link to="/myorders" className="text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                  <User className="w-4 h-4" />
                  {user.name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-red-600 flex items-center transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium flex items-center transition-colors">
                  Login
                </Link>
                <Link to="/register" className="bg-blue-600 text-white px-4 py-2 flex items-center rounded-md hover:bg-blue-700 font-medium transition-colors">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
