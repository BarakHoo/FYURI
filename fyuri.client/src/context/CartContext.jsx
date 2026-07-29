import { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';
import { useLanguage } from './LanguageContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [sessionId, setSessionId] = useState('');
  const { showToast } = useToast();
  const { language, t } = useLanguage();

  useEffect(() => {
    // Get or create session ID
    let sid = localStorage.getItem('sessionId');
    if (!sid) {
      sid = 'session_' + crypto.randomUUID();
      localStorage.setItem('sessionId', sid);
    }
    setSessionId(sid);
    loadCart(sid);
  }, []);

  const loadCart = async (sid) => {
    try {
      const response = await fetch(`/api/cart/${sid}`);
      if (response.ok) {
        const data = await response.json();
        setCart(data);
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    try {
      const response = await fetch(`/api/cart/${sessionId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          quantity,
        }),
      });

      if (response.ok) {
        await loadCart(sessionId);
        const productName = language === 'he' ? product.nameHebrew : product.name;
        showToast(
          t({
            he: `${productName} נוסף לסל בהצלחה`,
            en: `${productName} added to cart successfully`
          }),
          'success'
        );
        return true;
      } else {
        showToast(
          t({
            he: 'שגיאה בהוספה לסל',
            en: 'Failed to add to cart'
          }),
          'error'
        );
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
      showToast(
        t({
          he: 'שגיאה בהוספה לסל',
          en: 'Failed to add to cart'
        }),
        'error'
      );
    }
    return false;
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const response = await fetch(`/api/cart/${sessionId}/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });

      if (response.ok) {
        await loadCart(sessionId);
        return true;
      }
    } catch (error) {
      console.error('Failed to update cart:', error);
    }
    return false;
  };

  const removeFromCart = async (itemId) => {
    try {
      const response = await fetch(`/api/cart/${sessionId}/items/${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadCart(sessionId);
        return true;
      }
    } catch (error) {
      console.error('Failed to remove from cart:', error);
    }
    return false;
  };

  const clearCart = async () => {
    try {
      const response = await fetch(`/api/cart/${sessionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCart([]);
        return true;
      }
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
    return false;
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.priceAtAddTime * item.quantity, 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
