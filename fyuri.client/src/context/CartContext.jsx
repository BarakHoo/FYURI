import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from './ToastContext';
import { useLanguage } from './LanguageContext';

const CartContext = createContext();
let inMemorySessionId = null;

const getOrCreateSessionId = () => {
  const randomPart = globalThis.crypto?.randomUUID?.()
    ?? `${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const createSessionId = () => `session_${randomPart}`;

  try {
    let sid = localStorage.getItem('sessionId');
    if (!sid) {
      sid = createSessionId();
      localStorage.setItem('sessionId', sid);
    }
    return sid;
  } catch {
    inMemorySessionId ??= createSessionId();
    return inMemorySessionId;
  }
};

// Context hooks intentionally live beside their provider for a single public API.
// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [cartError, setCartError] = useState(null);
  const [cartMutationError, setCartMutationError] = useState(null);
  const [sessionId] = useState(getOrCreateSessionId);
  const { showToast } = useToast();
  const { language, t } = useLanguage();

  const loadCart = useCallback(async (sid) => {
    setCartError(null);
    try {
      const response = await fetch(`/api/cart/${sid}`);
      if (!response.ok) throw new Error(`Cart request failed (${response.status})`);
      const data = await response.json();
      setCart(data);
      return true;
    } catch (error) {
      console.error('Failed to load cart:', error);
      setCartError(error instanceof Error ? error.message : 'Failed to load cart');
      return false;
    } finally {
      setCartLoading(false);
    }
  }, []);

  useEffect(() => {
    // Loading the external cart is the synchronization this effect owns.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCart(sessionId);
  }, [loadCart, sessionId]);

  const retryCart = async () => {
    setCartLoading(true);
    return loadCart(sessionId);
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
    setCartMutationError(null);
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

      setCartMutationError(t({
        he: 'לא ניתן היה לעדכן את הכמות. ייתכן שהמלאי השתנה.',
        en: 'The quantity could not be updated. Available stock may have changed.',
      }));
    } catch (error) {
      console.error('Failed to update cart:', error);
      setCartMutationError(t({
        he: 'לא ניתן היה לעדכן את הכמות. בדקו את החיבור ונסו שוב.',
        en: 'The quantity could not be updated. Check your connection and retry.',
      }));
    }
    return false;
  };

  const removeFromCart = async (itemId) => {
    setCartMutationError(null);
    try {
      const response = await fetch(`/api/cart/${sessionId}/items/${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadCart(sessionId);
        return true;
      }

      setCartMutationError(t({
        he: 'לא ניתן היה להסיר את הפריט. נסו שוב.',
        en: 'The item could not be removed. Please retry.',
      }));
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      setCartMutationError(t({
        he: 'לא ניתן היה להסיר את הפריט. בדקו את החיבור ונסו שוב.',
        en: 'The item could not be removed. Check your connection and retry.',
      }));
    }
    return false;
  };

  const clearCart = async () => {
    setCartMutationError(null);
    try {
      const response = await fetch(`/api/cart/${sessionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCart([]);
        return true;
      }

      setCartMutationError(t({
        he: 'ההזמנה נשמרה, אך לא הצלחנו לרענן את הסל.',
        en: 'The order was saved, but the cart could not be refreshed.',
      }));
    } catch (error) {
      console.error('Failed to clear cart:', error);
      setCartMutationError(t({
        he: 'ההזמנה נשמרה, אך לא הצלחנו לרענן את הסל.',
        en: 'The order was saved, but the cart could not be refreshed.',
      }));
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
        cartLoading,
        cartError,
        cartMutationError,
        clearCartMutationError: () => setCartMutationError(null),
        retryCart,
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
