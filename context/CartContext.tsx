"use client";


import {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";

import toast from "react-hot-toast";
/* =========================================
   CONFIG
========================================= */

const STORAGE_KEY = "nova-cart-v2";
const TAX_RATE = 0.18;
const MAX_QTY_PER_ITEM = 10;

/* =========================================
   TYPES
========================================= */

export type CartItem = {
  id: number;
  title: string;
  price: number;
  thumbnail: string;
  quantity: number;
};

type AddProductPayload = Omit<CartItem, "quantity">;

type CartContextType = {
  cart: CartItem[];
  addToCart: (product: AddProductPayload) => void;
  increaseQty: (id: number) => void;
  decreaseQty: (id: number) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;
  subtotal: number;
  tax: number;
  total: number;
  itemCount: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const safeParseCart = (value: string | null): CartItem[] => {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item) => {
      return (
        typeof item.id === "number" &&
        typeof item.title === "string" &&
        typeof item.thumbnail === "string" &&
        typeof item.price === "number" &&
        item.price >= 0 &&
        typeof item.quantity === "number" &&
        item.quantity > 0 &&
        item.quantity <= MAX_QTY_PER_ITEM
      );
    });
  } catch {
    return [];
  }
};

/* =========================================
   PROVIDER
========================================= */

export const CartProvider = ({ children }: { children: ReactNode }) => {

  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    return safeParseCart(localStorage.getItem(STORAGE_KEY));
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      console.warn("Cart persistence failed.");
    }
  }, [cart]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setCart(safeParseCart(e.newValue));
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  /* =========================================
     ACTIONS
  ========================================= */
const addToCart = useCallback((product: AddProductPayload) => {
  if (!product || typeof product.id !== "number") return;

  setCart((prev) => {
    const existing = prev.find((item) => item.id === product.id);

    if (existing) {
      if (existing.quantity >= MAX_QTY_PER_ITEM) return prev;

      toast.success("Quantity increased", {
        id: `cart-${product.id}`,
      });

      return prev.map((item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    }

    toast.success("Added to cart", {
      id: `cart-${product.id}`,
    });

    return [...prev, { ...product, quantity: 1 }];
  });
}, []);

  const increaseQty = useCallback((id: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id && item.quantity < MAX_QTY_PER_ITEM
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  }, []);

  const decreaseQty = useCallback((id: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, []);

 const removeItem = useCallback((id: number) => {
  setCart((prev) => {
    const updated = prev.filter((item) => item.id !== id);

    if (prev.length !== updated.length) {
      toast.success("Item removed");
    }

    return updated;
  });
}, []);

const clearCart = useCallback(() => {
  setCart([]);
  toast("Cart cleared");
}, []);

  const subtotal = useMemo(() => {
    const value = cart.reduce((sum, item) => {
      const safePrice = Number(item.price);
      const safeQty = Number(item.quantity);
      return sum + safePrice * safeQty;
    }, 0);

    return Number(value.toFixed(2));
  }, [cart]);

  const tax = useMemo(() => {
    return Number((subtotal * TAX_RATE).toFixed(2));
  }, [subtotal]);

  const total = useMemo(() => {
    return Number((subtotal + tax).toFixed(2));
  }, [subtotal, tax]);

  const itemCount = useMemo(() => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }, [cart]);

  const value = useMemo<CartContextType>(
    () => ({
      cart,
      addToCart,
      increaseQty,
      decreaseQty,
      removeItem,
      clearCart,
      subtotal,
      tax,
      total,
      itemCount,
    }),
    [
      cart,
      addToCart,
      increaseQty,
      decreaseQty,
      removeItem,
      clearCart,
      subtotal,
      tax,
      total,
      itemCount,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
};