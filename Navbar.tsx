"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function Navbar() {
  const { itemCount } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState("");

  /* Sync input with URL */
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    setQuery(urlSearch);
  }, [searchParams]);

  /* Live search (debounced) */
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!query.trim()) {
        router.push("/");
      } else {
        router.push(`/?search=${encodeURIComponent(query.trim())}`);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <header className="navbar">
      <Link href="/" className="brand">
        Nova<span>Commerce</span>
      </Link>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search for Products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button>🔍</button>
      </div>

      <Link href="/cart" className="cart-link">
  <div className="cart-wrapper">
    <span className="cart-icon">🛒</span>
    {itemCount > 0 && (
      <span className="cart-badge">{itemCount}</span>
    )}
  </div>
  <span className="cart-text">Cart</span>
</Link>
    </header>
  );
}