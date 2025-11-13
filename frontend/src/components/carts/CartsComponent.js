"use client";
import React, { useEffect, useMemo, useState } from 'react';

export default function CartsComponent({ items = [], onCheckout, onUpdateItem, onRemoveItem }) {
  const [cartItems, setCartItems] = useState(items);

  useEffect(() => {
    if (!items || items.length === 0) {
      const stored = typeof window !== 'undefined' ? window.localStorage.getItem('cart_items') : null;
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) setCartItems(parsed);
        } catch {}
      }
    } else {
      setCartItems(items);
    }
  }, [items]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('cart_items', JSON.stringify(cartItems));
    }
  }, [cartItems]);

  const total = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  }, [cartItems]);

  const updateQuantity = (id, quantity) => {
    setCartItems((prev) => {
      const next = prev.map((it) => (it.id === id ? { ...it, quantity: Math.max(1, quantity) } : it));
      if (onUpdateItem) onUpdateItem(next.find((it) => it.id === id));
      return next;
    });
  };

  const removeItem = (id) => {
    setCartItems((prev) => {
      const next = prev.filter((it) => it.id !== id);
      if (onRemoveItem) onRemoveItem(id);
      return next;
    });
  };

  const handleCheckout = () => {
    if (onCheckout) onCheckout(cartItems);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Your Cart</h1>
      {cartItems.length === 0 ? (
        <div className="text-gray-600">Your cart is empty.</div>
      ) : (
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between border rounded p-3">
              <div className="flex items-center gap-3">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title || 'Item'} className="w-16 h-16 object-cover rounded" />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded" />
                )}
                <div>
                  <div className="font-medium">{item.title || 'Item'}</div>
                  <div className="text-sm text-gray-600">${(item.price || 0).toFixed(2)}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="px-2 py-1 border rounded" onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}>-</button>
                <div className="w-8 text-center">{item.quantity || 1}</div>
                <button className="px-2 py-1 border rounded" onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}>+</button>
                <div className="w-24 text-right font-medium">${(((item.price || 0) * (item.quantity || 1)) || 0).toFixed(2)}</div>
                <button className="px-3 py-1 text-red-600" onClick={() => removeItem(item.id)}>Remove</button>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between border-t pt-4 mt-2">
            <div className="text-lg">Total</div>
            <div className="text-xl font-semibold">${total.toFixed(2)}</div>
          </div>
          <div className="flex justify-end">
            <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleCheckout}>Checkout</button>
          </div>
        </div>
      )}
    </div>
  );
}