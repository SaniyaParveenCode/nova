"use client";

export default function CategoryBar() {
  const categories = [
    "Beauty",
    "Electronics",
    "Fashion",
    "Home",
    "Appliances",
    "Grocery",
    "Sports",
    "Accessories",
  ];

  return (
    <div className="category-bar">
      {categories.map((cat) => (
        <button key={cat} className="category-item">
          {cat}
        </button>
      ))}
    </div>
  );
}