"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useCart } from "@/context/CartContext";
import { useSearchParams } from "next/navigation";

type Product = {
  id: number;
  title: string;
  price: number;
  thumbnail: string;
  stock: number;
};

const LIMIT = 12;
const TOTAL_VISIBLE_PAGES = 5;

export default function Home() {
  const { addToCart } = useCart();
  const searchParams = useSearchParams();

  /* ----------------------------------------
     STATE
  ---------------------------------------- */
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0); // ✅ NEW
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    setSearch(urlSearch);
    setPage(1);
  }, [searchParams]);

  /* ----------------------------------------
     Debounced Search
  ---------------------------------------- */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  /* ----------------------------------------
     Fetch Products
  ---------------------------------------- */
  const fetchProducts = useCallback(async () => {
    const controller = new AbortController();
    const { signal } = controller;

    try {
      setLoading(true);
      setError(null);

      const skip = (page - 1) * LIMIT;

      const url = debouncedSearch
        ? `https://dummyjson.com/products/search?q=${encodeURIComponent(
            debouncedSearch
          )}&limit=${LIMIT}&skip=${skip}`
        : `https://dummyjson.com/products?limit=${LIMIT}&skip=${skip}`;

      const response = await fetch(url, { signal });

      if (!response.ok) {
        throw new Error("Failed to fetch products.");
      }

      const data = await response.json();

      setProducts(data.products ?? []);
      setTotal(data.total ?? 0); // ✅ USE API TOTAL
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }

    return () => controller.abort();
  }, [debouncedSearch, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  /* ----------------------------------------
     PRODUCTION-LEVEL PAGINATION
  ---------------------------------------- */

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(total / LIMIT));
  }, [total]);

  const visiblePages = useMemo(() => {
    const pages: number[] = [];

    if (totalPages <= TOTAL_VISIBLE_PAGES) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    let start = Math.max(1, page - 2);
    let end = start + TOTAL_VISIBLE_PAGES - 1;

    if (end > totalPages) {
      end = totalPages;
      start = end - TOTAL_VISIBLE_PAGES + 1;
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }, [page, totalPages]);

  // Prevent overflow page
  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  /* ----------------------------------------
     UI
  ---------------------------------------- */
  return (
    <div className="premium-page">

      <section className="hero">
        <div className="hero-left">
          <h1>
            Discover <span>Premium Picks</span>
          </h1>

          <p>
            Smart shopping trusted by thousands.
            Trending collections curated just for you.
          </p>

          <button
            className="hero-btn"
            onClick={() =>
              document
                .getElementById("products-section")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Shop Now
          </button>
        </div>

        <div className="hero-right">
          <img
            src="/images/hero-model.jpg"
            alt="Fashion Models"
          />
        </div>
      </section>

      <div className="trust-strip">
        <div>🚚 Fast Delivery</div>
        <div>🔄 Easy Returns</div>
        <div>💳 Secure Payments</div>
        <div>⭐ Top Rated Products</div>
      </div>

      {loading && (
        <section id="products-section" className="grid-wrapper">
          <div className="premium-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton-card" />
            ))}
          </div>
        </section>
      )}

      {!loading && error && (
        <div className="state-box error-box">
          <h3>Oops!</h3>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="state-box">
          <h3>No products found</h3>
          <p>Try adjusting your search keyword.</p>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <>
          <section id="products-section" className="grid-wrapper">
            <div className="premium-grid">
              {products.map((product) => (
                <article key={product.id} className="premium-card">
                  <div className="img-wrapper">
                    <img
                      src={product.thumbnail}
                      alt={product.title}
                      loading="lazy"
                    />
                  </div>

                  <div className="card-content">
                    <h3>{product.title}</h3>

                    <div className="price-row">
                      <span className="price">
                        ₹ {product.price.toFixed(2)}
                      </span>

                      {product.stock > 0 ? (
                        <span className="badge">In Stock</span>
                      ) : (
                        <span className="badge out">Sold Out</span>
                      )}
                    </div>

                    <button
                      aria-label={`Add ${product.title} to cart`}
                      className="btn-primary"
                      disabled={product.stock === 0}
                      onClick={() =>
                        addToCart({
                          id: product.id,
                          title: product.title,
                          price: product.price,
                          thumbnail: product.thumbnail,
                        })
                      }
                    >
                      Add to Cart
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <nav className="premium-pagination">
            <button
              className="page-btn"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page <= 1}
            >
              ←
            </button>

            {visiblePages.map((pageNumber) => (
              <button
                key={pageNumber}
                className={`page-number ${
                  page === pageNumber ? "active" : ""
                }`}
                onClick={() => setPage(pageNumber)}
              >
                {pageNumber}
              </button>
            ))}

            <button
              className="page-btn"
              onClick={() =>
                setPage((prev) =>
                  prev < totalPages ? prev + 1 : prev
                )
              }
              disabled={page >= totalPages}
            >
              →
            </button>
          </nav>
        </>
      )}
    </div>
  );
}