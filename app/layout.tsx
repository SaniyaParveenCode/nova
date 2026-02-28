import type { Metadata, Viewport } from "next";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";
import "./globals.css";


export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  

  title: {
    default: "Nova Commerce",
    template: "%s | Nova Commerce",
  },

  description:
    "Nova Commerce is a modern ecommerce frontend built with Next.js featuring product search, pagination, cart persistence, and checkout simulation.",

  keywords: [
    "ecommerce",
    "nextjs",
    "react",
    "cart system",
    "frontend project",
    "typescript",
  ],

  authors: [{ name: "Your Name" }],
  creator: "Your Name",

  openGraph: {
    title: "Nova Commerce",
    description:
      "Modern ecommerce frontend built with Next.js.",
    url: "https://nova-commerce.vercel.app",
    siteName: "Nova Commerce",
    locale: "en_IN",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Nova Commerce",
    description:
      "Modern ecommerce frontend built with Next.js.",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="app-body">
        <CartProvider>
          <div className="app-shell">
            
            {/* Header */}
            <header className="app-header">
              <Navbar />
            </header>

            {/* Main Content */}
            <main className="app-main" role="main">
              {children}
            </main>

            {/* Footer */}
            <footer className="app-footer">
              <p>
                © {new Date().getFullYear()} Nova Commerce. All rights reserved.
              </p>
            </footer>

          </div>
        </CartProvider>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 2000,
            style: {
              fontSize: "14px",
            },
          }}
        />


      </body>
    </html>
  );
}
