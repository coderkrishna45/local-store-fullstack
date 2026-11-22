import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { CartContext } from '../context/CartContext';
import { ShoppingCart, ArrowLeft, ShieldCheck, Truck } from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/api/products/${id}`);
        setProduct(data);
        setLoading(false);
      } catch (err) {
        setError('Product not found');
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const addToCartHandler = () => {
    addToCart(product, qty);
    navigate('/cart');
  };

  if (loading) return <div className="text-center py-20 animate-pulse text-xl text-gray-500">Loading product...</div>;
  if (error) return <div className="text-center py-20 text-red-600 text-xl font-bold">{error}</div>;
  if (!product) return null;

  return (
    <div className="max-w-7xl mx-auto py-8">
      <Link to="/" className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors mb-8 font-medium">
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Products
      </Link>

      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden lg:grid lg:grid-cols-2 lg:gap-x-8">

        {/* Product Image Gallery */}
        <div className="aspect-w-4 aspect-h-3 sm:aspect-w-3 sm:aspect-h-2 lg:aspect-w-1 lg:aspect-h-1 p-8 sm:p-12 lg:p-16 flex items-center justify-center bg-gray-50">
          <img
            src={product.image || '/localstore.svg'}
            alt={product.name}
            className="object-contain object-center w-full h-full max-h-[500px] hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Product Info */}
        <div className="p-8 sm:px-12 lg:py-16 lg:px-12 flex flex-col justify-center">
          <div className="mb-6">
            <span className="text-sm font-bold text-blue-600 tracking-wider uppercase mb-2 block">
              {product.category?.name || 'Category'}
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">{product.name}</h1>
            <p className="text-3xl font-black text-blue-600">₹{product.price.toFixed(2)}</p>
          </div>

          <div className="mb-8 border-t border-b border-gray-100 py-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Description</h3>
            <p className="text-base text-gray-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-700 font-semibold">Status:</span>
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>

            {product.stock > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-semibold">Quantity:</span>
                <select
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 font-semibold"
                >
                  {[...Array(product.stock).keys()].map((x) => (
                    <option key={x + 1} value={x + 1}>
                      {x + 1}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <button
            onClick={addToCartHandler}
            disabled={product.stock === 0}
            className={`w-full py-4 px-8 rounded-xl flex items-center justify-center font-bold text-lg transition-all shadow-lg ${
              product.stock === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-blue-500/30 active:scale-[0.98]'
            }`}
          >
            <ShoppingCart className="w-6 h-6 mr-3" />
            Add to Cart
          </button>

          {/* Trust Badges */}
          <div className="mt-10 grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
            <div className="flex items-center text-gray-600">
              <ShieldCheck className="w-6 h-6 mr-2 text-green-600" />
              <span className="text-sm font-medium">Secure Checkout</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Truck className="w-6 h-6 mr-2 text-blue-600" />
              <span className="text-sm font-medium">Fast Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
