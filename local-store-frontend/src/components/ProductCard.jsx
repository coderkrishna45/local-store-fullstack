import { useNavigate } from 'react-router-dom';
import { Plus, Minus } from 'lucide-react';
import { useContext } from 'react';
import { CartContext } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { cartItems, addToCart, removeFromCart } = useContext(CartContext);
  const navigate = useNavigate();

  // Check if item is already in cart
  const cartItem = cartItems.find((x) => x.product === product._id);
  const qtyInCart = cartItem ? cartItem.qty : 0;

  const handleCardClick = () => {
    navigate(`/products/${product._id}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleIncreaseQty = (e) => {
    e.stopPropagation();
    if (qtyInCart < product.stock) {
      addToCart(product, qtyInCart + 1);
    }
  };

  const handleDecreaseQty = (e) => {
    e.stopPropagation();
    if (qtyInCart > 1) {
      addToCart(product, qtyInCart - 1);
    } else if (qtyInCart === 1) {
      removeFromCart(product._id);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100 flex flex-col h-full cursor-pointer group"
    >
      <div className="overflow-hidden relative bg-gray-50 flex items-center justify-center p-4 h-40">
        <img
          src={product.image || '/localstore.svg'}
          alt={product.name}
          className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
        />
        {qtyInCart > 0 && (
          <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md z-10">
            {qtyInCart} in cart
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight flex-1 pr-2">
            {product.name}
          </h3>
        </div>

        <p className="text-gray-400 text-xs mb-3 line-clamp-1">{product.weight} • {product.description}</p>

        <div className="mt-auto flex items-end justify-between">
          <div>
            <span className="text-base font-black text-gray-900 block leading-none">₹{product.price.toFixed(2)}</span>
          </div>

          <div className="z-10" onClick={(e) => e.stopPropagation()}>
            {qtyInCart > 0 ? (
              <div className="flex items-center bg-blue-600 rounded-lg shadow-sm border border-blue-600 overflow-hidden text-white w-20 h-8">
                <button
                  onClick={handleDecreaseQty}
                  className="w-1/3 h-full flex items-center justify-center hover:bg-blue-700 transition-colors active:bg-blue-800"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-1/3 h-full flex items-center justify-center font-bold text-sm bg-white text-blue-600">
                  {qtyInCart}
                </span>
                <button
                  onClick={handleIncreaseQty}
                  disabled={qtyInCart >= product.stock}
                  className="w-1/3 h-full flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 transition-colors active:bg-blue-800"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : product.stock === 0 ? (
              <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                Out of Stock
              </span>
            ) : (
              <button
                onClick={handleAddToCart}
                className="bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700 active:bg-blue-100 px-4 h-8 rounded-lg text-sm font-bold transition-colors shadow-sm flex items-center justify-center min-w-[5rem]"
              >
                ADD
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
