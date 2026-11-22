import { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartLoaded, setCartLoaded] = useState(false);

  useEffect(() => {
    const localCart = localStorage.getItem('cartItems');
    if (localCart) {
      try {
        const parsed = JSON.parse(localCart);
        if (Array.isArray(parsed)) setCartItems(parsed);
        else localStorage.removeItem('cartItems');
      } catch {
        localStorage.removeItem('cartItems');
      }
    }
    setCartLoaded(true);
  }, []);

  const addToCart = (product, qty) => {
    const productId = product.product || product._id;
    const existItem = cartItems.find((x) => x.product === productId);

    if (existItem) {
      const updatedCart = cartItems.map((x) =>
        x.product === productId ? { ...product, product: productId, qty } : x
      );
      setCartItems(updatedCart);
      localStorage.setItem('cartItems', JSON.stringify(updatedCart));
    } else {
      const updatedCart = [...cartItems, { ...product, product: productId, qty }];
      setCartItems(updatedCart);
      localStorage.setItem('cartItems', JSON.stringify(updatedCart));
    }
  };

  const removeFromCart = (id) => {
    const updatedCart = cartItems.filter((x) => x.product !== id);
    setCartItems(updatedCart);
    localStorage.setItem('cartItems', JSON.stringify(updatedCart));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cartItems');
  };

  return (
    <CartContext.Provider value={{ cartItems, cartLoaded, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
