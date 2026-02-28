"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface OrderItem {
  id: number;
  title: string;
  price: number;
  quantity: number;
  thumbnail: string;
}

interface OrderData {
  id: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  date: string;
}

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ----------------------------------------
     Load Order From localStorage (Safe Parse)
  ---------------------------------------- */
  useEffect(() => {
    try {
      const stored = localStorage.getItem("latestOrder");

      if (!stored) {
        setError("No order found.");
        return;
      }

      const parsed: OrderData = JSON.parse(stored);

      if (parsed.id === String(params.id)) {
        setOrder(parsed);
      } else {
        setError("Order not found.");
      }
    } catch {
      setError("Failed to load order data.");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  /* ----------------------------------------
     Memoized Formatters
  ---------------------------------------- */
  const formattedDate = useMemo(() => {
    if (!order) return "";
    return new Date(order.date).toLocaleString();
  }, [order]);

  const formatCurrency = (amount: number) =>
    `₹ ${amount.toFixed(2)}`;

  /* ----------------------------------------
     STATES
  ---------------------------------------- */
  if (loading) {
    return (
      <div className="order-page">
        <div className="order-container state-box">
          <h3>Loading Order...</h3>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-page">
        <div className="order-container state-box">
          <h2>Order Not Found</h2>
          <p>{error}</p>
          <Link href="/" className="primary-btn">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  /* ----------------------------------------
     UI
  ---------------------------------------- */
  return (
    <div className="order-page">
      <div className="order-container">

        {/* HEADER */}
        <div className="order-header">
          <div>
            <h2>Order Details</h2>
            <p className="order-date">Placed on {formattedDate}</p>
          </div>
          <span className="order-id">#{order.id}</span>
        </div>

        {/* ITEMS */}
        <div className="order-items">
          {order.items.map((item) => (
            <div key={item.id} className="order-item">
                <div className="order-image-wrapper">
              <Image
                src={item.thumbnail}
                alt={item.title}
                width={100}
                height={100}
                className="order-image"
              />
              </div>

              <div className="order-item-info">
                <h4>{item.title}</h4>
                <p>
                  {formatCurrency(item.price)} × {item.quantity}
                </p>
              </div>

              <div className="order-item-total">
                {formatCurrency(item.price * item.quantity)}
              </div>
            </div>
          ))}
        </div>

        {/* SUMMARY */}
        <div className="order-summary">
          <div>
            <span>Subtotal</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          <div>
            <span>Tax</span>
            <span>{formatCurrency(order.tax)}</span>
          </div>
          <div className="order-total">
            <span>Total</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="order-actions">
          <Link href="/" className="primary-btn">
            Continue Shopping
          </Link>

          <button
            className="secondary-btn"
            onClick={() => router.push("/")}
          >
            Back to Home
          </button>
        </div>

      </div>
    </div>
  );
}