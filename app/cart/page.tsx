"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";
import Image from "next/image";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(value);

export default function CartPage() {
  const router = useRouter();

  const {
    cart,
    increaseQty,
    decreaseQty,
    removeItem,
    clearCart,
    subtotal,
    tax,
    total,
  } = useCart();

  const [isMounted, setIsMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const handleCheckout = () => {
  if (cart.length === 0 || isProcessing) return;

  try {
    setIsProcessing(true);

    const orderId =
      "NC-" + Math.floor(100000 + Math.random() * 900000);

    const orderData = {
      id: orderId,
      items: cart,
      subtotal,
      tax,
      total,
      date: new Date().toISOString(),
    };

    localStorage.setItem(
      "latestOrder",
      JSON.stringify(orderData)
    );

    router.push(`/order/${orderId}`);

    clearCart();

  } catch (error) {
    console.error("Checkout failed:", error);
    setIsProcessing(false);
  }
};


  if (cart.length === 0) {
    return (
      <div className="empty-page">
        <div className="empty-card">
          <div className="empty-icon">🛒</div>

          <h2>Your Cart is Empty</h2>
          <p>
            You haven’t added any products yet.
            Browse our collection and start shopping.
          </p>

          <Link href="/" className="empty-btn">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-header">
          <h2>Your Cart</h2>

          <button
            className="clear-btn"
            onClick={clearCart}
            disabled={cart.length === 0}
          >
            Clear Cart
          </button>
        </div>

        <div className="cart-layout">
          {/* ================= ITEMS ================= */}
          <div className="cart-items">
            {cart.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-left">
                    <div className="cart-image-wrapper">
                  <Image
                    src={item.thumbnail}
                    alt={item.title}
                    width={120}
                    height={120}
                    className="cart-image"
                    priority={false}
                  />
                  </div>

                  <div className="item-details">
                    <h4>{item.title}</h4>

                    <p className="item-price">
                      {formatCurrency(item.price)}
                    </p>

                    <div className="qty-control">
                      <button
                        aria-label="Decrease quantity"
                        onClick={() =>
                          decreaseQty(item.id)
                        }
                        disabled={item.quantity <= 1}
                      >
                        −
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        aria-label="Increase quantity"
                        onClick={() =>
                          increaseQty(item.id)
                        }
                      >
                        +
                      </button>
                    </div>

                    <button
                      className="remove-btn"
                      onClick={() =>
                        removeItem(item.id)
                      }
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="item-total">
                  {formatCurrency(
                    item.price * item.quantity
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* ================= SUMMARY ================= */}
          <div className="cart-summary">
            <h3>Order Summary</h3>

            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>

            <div className="summary-row">
              <span>Tax (18%)</span>
              <span>{formatCurrency(tax)}</span>
            </div>

            <div className="summary-row total">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>

            <button
              className="checkout-btn"
              onClick={() => setShowConfirm(true)}
              disabled={isProcessing}
            >
              {isProcessing
                ? "Processing..."
                : "Secure Checkout"}
            </button>
          </div>
        </div>
        {showConfirm && (
  <div className="checkout-overlay">
    <div className="checkout-modal">
      <h3>Confirm Your Order</h3>

      <div className="modal-summary">
        <p>Subtotal: {formatCurrency(subtotal)}</p>
        <p>Tax: {formatCurrency(tax)}</p>
        <h4>Total: {formatCurrency(total)}</h4>
      </div>

      <div className="modal-actions">
        <button
          className="modal-cancel"
          onClick={() => setShowConfirm(false)}
        >
          Cancel
        </button>

        <button
          className="modal-confirm"
          onClick={() => {
            setShowConfirm(false);
            handleCheckout();
          }}
        >
          Confirm Order
        </button>
      </div>
    </div>
  </div>
  )}
  </div>
</div>
);
}