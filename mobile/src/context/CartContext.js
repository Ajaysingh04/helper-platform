import React, { createContext, useState } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedPro, setSelectedPro] = useState(null);
  const [bookingAddress, setBookingAddress] = useState({
    street: 'Flat 402, Royal Palms, Vijay Nagar',
    city: 'Indore',
    pincode: '452010',
    type: 'Home',
  });

  const addToCart = (service, pro = null) => {
    setCartItems([service]);
    if (pro) setSelectedPro(pro);
  };

  const removeFromCart = (serviceId) => {
    setCartItems(prev => prev.filter(item => item.id !== serviceId));
  };

  const clearCart = () => {
    setCartItems([]);
    setSelectedPro(null);
  };

  const cartTotal = cartItems.reduce((acc, item) => acc + (item.price || 0), 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        selectedPro,
        bookingAddress,
        cartTotal,
        addToCart,
        removeFromCart,
        clearCart,
        setSelectedPro,
        setBookingAddress,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
