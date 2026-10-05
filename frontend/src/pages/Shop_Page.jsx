import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Bell,
  Menu,
  X,
} from "lucide-react";

const API_BASE_URL = "http://127.0.0.1:8000";

export default function Shop_Page() {
  const navigate = useNavigate();

  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toastMessage, setToastMessage] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState(null);
  const [userAvatar, setUserAvatar] = useState("");

  // Sidebar filter states
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColor, setSelectedColor] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [customStitching, setCustomStitching] = useState(false);
  const [sortBy, setSortBy] = useState("Featured Highlights");

  const [appliedFilters, setAppliedFilters] = useState({
    category: "All",
    sizes: [],
    color: "",
    priceRange: "",
    inStockOnly: false,
    customStitching: false,
  });

  // Dynamic products from NeonDB via FastAPI backend
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const showToast = (msg) => {
    setToastMessage(msg);

    setTimeout(() => {
      setToastMessage("");
    }, 3000);
  };

  const categoriesList = [
    "Sarees",
    "Lehengas",
    "Dresses & Gowns",
    "Kurtis",
    "Co-Ord Sets",
    "Kids Wear",
  ];

  const sizesList = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];

  const colorsList = [
    "bg-rose-950",
    "bg-emerald-900",
    "bg-indigo-950",
    "bg-amber-400",
    "bg-pink-400",
    "bg-white border",
  ];

  // =========================================================
  // LOAD USER + CART + NOTIFICATIONS
  // =========================================================
  useEffect(() => {
    const savedUser = JSON.parse(
      localStorage.getItem("weftin_user") || "null"
    );

    if (savedUser && savedUser.email) {
      setCurrentUser(savedUser);

      if (savedUser.avatar) {
        setUserAvatar(savedUser.avatar);
      }

      fetchUserAvatar(savedUser.email);
      fetchUnreadCount(savedUser.email);
    }

    updateCartCount();

    // Refresh unread notifications periodically
    let notificationInterval;

    if (savedUser && savedUser.email) {
      notificationInterval = setInterval(() => {
        fetchUnreadCount(savedUser.email);
      }, 30000);
    }

    return () => {
      if (notificationInterval) {
        clearInterval(notificationInterval);
      }
    };
  }, []);

  // =========================================================
  // FETCH USER AVATAR
  // =========================================================
  const fetchUserAvatar = async (email) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/user/${encodeURIComponent(email)}`
      );

      if (!response.ok) return;

      const data = await response.json();

      if (data && data.avatar) {
        setUserAvatar(data.avatar);
      }
    } catch (error) {
      console.error("Failed to fetch user avatar:", error);
    }
  };

  // =========================================================
  // FETCH UNREAD NOTIFICATIONS
  // =========================================================
  const fetchUnreadCount = async (email) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/notifications/unread-count/${encodeURIComponent(
          email
        )}`
      );

      if (!response.ok) return;

      const data = await response.json();

      setUnreadCount(Number(data.count) || 0);
    } catch (error) {
      console.error("Failed to fetch unread notification count:", error);
    }
  };

  // =========================================================
  // CART COUNT
  // =========================================================
  const updateCartCount = () => {
    try {
      const savedCart =
        JSON.parse(localStorage.getItem("weftin_cart")) || [];

      const total = savedCart.reduce(
        (acc, item) => acc + (Number(item.qty) || 0),
        0
      );

      setCartCount(total);
    } catch (error) {
      console.error("Failed to read cart:", error);
      setCartCount(0);
    }
  };

  // =========================================================
  // FETCH PRODUCTS
  // =========================================================
  useEffect(() => {
    setLoading(true);

    fetch(
      `${API_BASE_URL}/api/products?category=${encodeURIComponent(
        selectedCategory
      )}`
    )
      .then((res) => res.json())
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(
          "Failed to fetch products from backend:",
          err
        );

        // Fallback mock items if backend is offline
        setProducts([
          {
            id: 1,
            name: "Royal Amber Kanjeevaram Saree",
            category: "Sarees",
            price: "₹12,999",
            old_price: "₹15,500",
            image:
              "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=500",
            tag: "ATELIER EXCLUSIVE",
          },
          {
            id: 2,
            name: "Forest Sage Organza Lehenga",
            category: "Lehengas",
            price: "₹14,499",
            old_price: "₹18,500",
            image:
              "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=500",
            tag: "NEW ARRIVAL",
          },
        ]);

        setLoading(false);
      });

    updateCartCount();
  }, [selectedCategory]);

  // =========================================================
  // WISHLIST
  // =========================================================
  const handleAddToWishlist = async (p) => {
    const savedUser = JSON.parse(
      localStorage.getItem("weftin_user") || "null"
    );

    if (!savedUser || !savedUser.email) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/wishlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_email: savedUser.email,
          product_id: p.id,
          name: p.name,
          price: p.price,
          image: p.image,
          tag: p.tag || "ATELIER EXCLUSIVE",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast(
          data.message || `Saved ${p.name} to Wishlist!`
        );
      } else {
        showToast(data.detail || "Failed to save.");
      }
    } catch (err) {
      console.error("Wishlist fetch error:", err);
      showToast("Backend connection error.");
    }
  };

  // =========================================================
  // ADD TO CART
  // =========================================================
  const handleAddToCart = (p) => {
    try {
      const existingCart =
        JSON.parse(localStorage.getItem("weftin_cart")) || [];

      const existingIndex = existingCart.findIndex(
        (item) => item.id === p.id
      );

      if (existingIndex > -1) {
        existingCart[existingIndex].qty =
          (Number(existingCart[existingIndex].qty) || 0) + 1;
      } else {
        existingCart.push({
          id: p.id,
          product_id: p.id,
          name: p.name,
          category: p.category,
          price: p.price,
          size: "Standard Length",
          shade: "Gold",
          color: p.color || "",
          qty: 1,
          image: p.image,
          tag: p.tag || "ATELIER",
        });
      }

      localStorage.setItem(
        "weftin_cart",
        JSON.stringify(existingCart)
      );

      const total = existingCart.reduce(
        (acc, item) => acc + (Number(item.qty) || 0),
        0
      );

      setCartCount(total);

      showToast(`Added ${p.name} to Bag`);
    } catch (error) {
      console.error("Add to cart error:", error);
      showToast("Unable to add item to bag.");
    }
  };

  // =========================================================
  // FILTERING
  // =========================================================
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // CATEGORY
    if (appliedFilters.category !== "All") {
      result = result.filter(
        (p) =>
          p.category &&
          p.category.toLowerCase() ===
            appliedFilters.category.toLowerCase()
      );
    }

    // SIZE
    if (appliedFilters.sizes.length > 0) {
      result = result.filter((product) => {
        if (!product.sizes) return false;

        let productSizes = [];

        if (Array.isArray(product.sizes)) {
          productSizes = product.sizes;
        } else {
          productSizes = String(product.sizes)
            .split(",")
            .map((size) => size.trim());
        }

        return appliedFilters.sizes.some((size) =>
          productSizes.some(
            (productSize) =>
              String(productSize).toLowerCase() ===
              String(size).toLowerCase()
          )
        );
      });
    }

    // COLOR
    if (appliedFilters.color) {
      result = result.filter((product) => {
        if (!product.color) return false;

        return (
          String(product.color).toLowerCase() ===
          appliedFilters.color.toLowerCase()
        );
      });
    }

    // PRICE
    if (appliedFilters.priceRange) {
      result = result.filter((product) => {
        const numericPrice = parseFloat(
          String(product.price || "")
            .replace(/₹/g, "")
            .replace(/,/g, "")
            .trim()
        );

        if (Number.isNaN(numericPrice)) return false;

        switch (appliedFilters.priceRange) {
          case "Under ₹5,000":
            return numericPrice < 5000;

          case "₹5,000 - ₹10,000":
            return numericPrice >= 5000 && numericPrice <= 10000;

          case "₹10,000 - ₹20,000":
            return numericPrice > 10000 && numericPrice <= 20000;

          case "Over ₹20,000":
            return numericPrice > 20000;

          default:
            return true;
        }
      });
    }

    // IN STOCK
    if (appliedFilters.inStockOnly) {
      result = result.filter(
        (product) => product.in_stock === true
      );
    }

    // CUSTOM STITCHING
    if (appliedFilters.customStitching) {
      result = result.filter(
        (product) => product.custom_stitching === true
      );
    }

    // SORTING
    switch (sortBy) {
      case "Price: Low to High":
        result.sort((a, b) => {
          const priceA = parseFloat(
            String(a.price || "").replace(/[₹,]/g, "")
          );

          const priceB = parseFloat(
            String(b.price || "").replace(/[₹,]/g, "")
          );

          return priceA - priceB;
        });
        break;

      case "Price: High to Low":
        result.sort((a, b) => {
          const priceA = parseFloat(
            String(a.price || "").replace(/[₹,]/g, "")
          );

          const priceB = parseFloat(
            String(b.price || "").replace(/[₹,]/g, "")
          );

          return priceB - priceA;
        });
        break;

      case "Newest Arrivals":
        result.sort(
          (a, b) => Number(b.id) - Number(a.id)
        );
        break;

      default:
        break;
    }

    return result;
  }, [products, appliedFilters, sortBy]);

  // =========================================================
  // USER DISPLAY
  // =========================================================
  const userName =
    currentUser?.name ||
    currentUser?.full_name ||
    currentUser?.username ||
    "Account";

  const userInitial =
    userName?.charAt(0)?.toUpperCase() || "U";

  // =========================================================
  // MOBILE NAV LINK HELPER
  // =========================================================
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-gray-900 font-sans relative">

      {/* =====================================================
          TOAST
      ====================================================== */}
      {toastMessage && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-[100] bg-gray-900 text-white px-5 sm:px-6 py-3 rounded-lg shadow-2xl text-sm animate-fade-in flex items-center gap-3 border border-amber-500/30">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =====================================================
          TOP ANNOUNCEMENT BAR
      ====================================================== */}
      <div className="bg-[#1C1816] text-[#E5D5BC] text-[9px] sm:text-xs py-2 px-3 text-center tracking-[0.12em] sm:tracking-[0.2em] uppercase font-medium">
        LIMITED FESTIVE EDIT — 20% OFF SELECTED COUTURE PIECES
      </div>

      {/* =====================================================
          DESKTOP / TABLET NAVIGATION
      ====================================================== */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-gray-200 px-4 sm:px-6 lg:px-12 py-3 sm:py-4">

        <div className="max-w-7xl mx-auto flex items-center justify-between">

          {/* Search */}
          <div className="hidden lg:flex items-center bg-gray-100 rounded-full px-4 py-2 w-64 border border-gray-200">
            <Search className="w-4 h-4 text-gray-400 mr-2" />

            <input
              type="text"
              placeholder="Search anything..."
              className="bg-transparent text-xs text-gray-800 focus:outline-none w-full"
            />
          </div>

          {/* Logo */}
          <div className="text-center">
            <h1 className="font-serif text-xl sm:text-2xl tracking-[0.2em] sm:tracking-[0.25em] font-bold text-gray-900">
              WEFTIN
            </h1>
          </div>

          {/* Desktop Icons */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6">

            <span className="text-xs font-medium text-gray-700 cursor-pointer">
              INR &or;
            </span>

            <Link
              to="/wishlist"
              className="text-gray-800 hover:text-black relative"
            >
              <Heart className="w-5 h-5" />

              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-rose-600 text-white text-[9px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Notification */}
            <Link
              to="/notifications"
              className="relative text-gray-800 hover:text-black"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />

              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-rose-600 text-white text-[9px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>

            {/* User */}
            <Link
              to="/profile"
              className="text-gray-800 hover:text-black"
              title={userName}
            >
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-6 h-6 rounded-full object-cover border border-gray-300"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-amber-700 text-white flex items-center justify-center text-[10px] font-semibold">
                  {userInitial}
                </div>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative text-gray-800 hover:text-black"
            >
              <ShoppingBag className="w-5 h-5" />

              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-700 text-white text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Header Icons */}
          <div className="flex md:hidden items-center gap-3">

            {/* Cart */}
            <Link
              to="/cart"
              className="relative text-gray-800"
            >
              <ShoppingBag className="w-5 h-5" />

              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-700 text-white text-[9px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            {/* Notifications */}
            <Link
              to="/notifications"
              className="relative text-gray-800"
            >
              <Bell className="w-5 h-5" />

              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-rose-600 text-white text-[9px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>

            {/* User Avatar */}
            <Link to="/profile">
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-6 h-6 rounded-full object-cover border border-gray-300"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-amber-700 text-white flex items-center justify-center text-[10px] font-semibold">
                  {userInitial}
                </div>
              )}
            </Link>

            {/* Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="text-gray-800"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Desktop Sub Nav */}
        <nav className="hidden md:flex justify-center items-center gap-5 lg:gap-8 mt-4 pt-3 border-t border-gray-200/60 text-[10px] lg:text-xs tracking-[0.12em] lg:tracking-[0.15em] uppercase text-gray-700 font-medium">
          <Link
            to="/"
            className="hover:text-black transition-colors"
          >
            Home
          </Link>

          <Link
            to="/shop"
            className="text-black font-semibold border-b border-black pb-0.5"
          >
            Shop
          </Link>

          <a
            href="#"
            className="hover:text-black transition-colors"
          >
            Collections
          </a>

          <a
            href="/custom-designs"
            className="hover:text-black transition-colors"
          >
            Custom Design
          </a>

          <Link
            to="/lookbook"
            className="hover:text-black transition-colors"
          >
            Lookbook
          </Link>

          <Link
            to="/limited"
            className="hover:text-black transition-colors"
          >
            Limited Edition
          </Link>
        </nav>
      </header>

      {/* =====================================================
          MOBILE SLIDE-IN NAVIGATION
      ====================================================== */}

      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-40"
          onClick={closeMobileMenu}
        />
      )}

      <aside
        className={`md:hidden fixed left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">

          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between px-5 py-5 border-b border-gray-200">
            <h2 className="font-serif text-lg tracking-[0.2em] font-bold">
              WEFTIN
            </h2>

            <button
              type="button"
              onClick={closeMobileMenu}
              className="text-gray-700 hover:text-black"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile User */}
          <div className="px-5 py-5 border-b border-gray-100 flex items-center gap-3">

            {userAvatar ? (
              <img
                src={userAvatar}
                alt={userName}
                className="w-10 h-10 rounded-full object-cover border border-gray-300"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-amber-700 text-white flex items-center justify-center text-sm font-semibold">
                {userInitial}
              </div>
            )}

            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">
                {userName}
              </p>

              <Link
                to="/profile"
                onClick={closeMobileMenu}
                className="text-[10px] text-gray-500 uppercase tracking-wider"
              >
                View Profile
              </Link>
            </div>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex-1 overflow-y-auto px-5 py-5">

            <div className="space-y-1">

              <Link
                to="/"
                onClick={closeMobileMenu}
                className="flex items-center justify-between px-3 py-3 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                Home
              </Link>

              <Link
                to="/shop"
                onClick={closeMobileMenu}
                className="flex items-center justify-between px-3 py-3 rounded-lg bg-amber-50 text-amber-900 font-semibold text-sm"
              >
                Shop
              </Link>

              <a
                href="#"
                onClick={closeMobileMenu}
                className="flex items-center justify-between px-3 py-3 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                Collections
              </a>

              <a
                href="/custom-designs"
                onClick={closeMobileMenu}
                className="flex items-center justify-between px-3 py-3 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                Custom Design
              </a>


              <Link
                to="/lookbook"
                onClick={closeMobileMenu}
                className="flex items-center justify-between px-3 py-3 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                Lookbook
              </Link>

              <Link
                to="/limited"
                onClick={closeMobileMenu}
                className="flex items-center justify-between px-3 py-3 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                Limited Edition
              </Link>

            </div>

            {/* Mobile Account Links */}
            <div className="mt-6 pt-5 border-t border-gray-200">

              <p className="px-3 mb-2 text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400">
                Account
              </p>

              <Link
                to="/wishlist"
                onClick={closeMobileMenu}
                className="flex items-center justify-between px-3 py-3 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                <span className="flex items-center gap-3">
                  <Heart className="w-4 h-4" />
                  Wishlist
                </span>

                {wishlistCount > 0 && (
                  <span className="bg-rose-600 text-white text-[9px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link
                to="/notifications"
                onClick={closeMobileMenu}
                className="flex items-center justify-between px-3 py-3 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                <span className="flex items-center gap-3">
                  <Bell className="w-4 h-4" />
                  Notifications
                </span>

                {unreadCount > 0 && (
                  <span className="bg-rose-600 text-white text-[9px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>

              <Link
                to="/cart"
                onClick={closeMobileMenu}
                className="flex items-center justify-between px-3 py-3 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                <span className="flex items-center gap-3">
                  <ShoppingBag className="w-4 h-4" />
                  Shopping Bag
                </span>

                {cartCount > 0 && (
                  <span className="bg-amber-700 text-white text-[9px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>

              <Link
                to="/profile"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                <User className="w-4 h-4" />
                Profile
              </Link>

            </div>
          </nav>
        </div>
      </aside>

      {/* =====================================================
          SHOP PAGE HEADER
      ====================================================== */}
      <div className="text-center py-8 sm:py-12 px-5 max-w-xl mx-auto">

        <span className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] font-semibold block mb-1">
          EXCLUSIVE CURATION
        </span>

        <h2 className="text-3xl sm:text-4xl font-serif font-light text-gray-900 mb-2">
          Shop
        </h2>

        <p className="text-xs text-gray-600 leading-relaxed">
          Explore pristine heritage ethnic attire, custom-tailoring fabrics,
          and modern silhouettes.
        </p>

        <div className="mt-4">
          <Link
            to="/admin/home-cms"
            className="inline-block bg-black text-white px-4 py-2 rounded text-[10px] uppercase tracking-widest font-semibold hover:bg-gray-800"
          >
            ⚙ Manage Home Sections (Admin CMS)
          </Link>
        </div>
      </div>

      {/* =====================================================
          MAIN LAYOUT
      ====================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pb-16 sm:pb-24 grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-10 items-start">

        {/* ===================================================
            SIDEBAR FILTER PANEL
        ==================================================== */}
        <aside className="bg-white p-5 sm:p-6 rounded-xl border border-gray-200 shadow-sm space-y-7 lg:space-y-8">

          {/* Categories */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
              Categories
            </h4>

            <div className="space-y-2 text-xs">
              <button
                onClick={() => setSelectedCategory("All")}
                className={`block w-full text-left py-2 px-2 rounded ${
                  selectedCategory === "All"
                    ? "bg-amber-50 text-amber-900 font-semibold"
                    : "text-gray-600 hover:text-black"
                }`}
              >
                All Categories
              </button>

              {categoriesList.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`block w-full text-left py-2 px-2 rounded ${
                    selectedCategory === cat
                      ? "bg-amber-50 text-amber-900 font-semibold"
                      : "text-gray-600 hover:text-black"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
              Sizes
            </h4>

            <div className="grid grid-cols-3 gap-2">
              {sizesList.map((sz) => (
                <button
                  key={sz}
                  onClick={() => {
                    if (selectedSizes.includes(sz)) {
                      setSelectedSizes(
                        selectedSizes.filter(
                          (s) => s !== sz
                        )
                      );
                    } else {
                      setSelectedSizes([
                        ...selectedSizes,
                        sz,
                      ]);
                    }
                  }}
                  className={`py-2 text-[10px] font-semibold uppercase tracking-wider rounded border ${
                    selectedSizes.includes(sz)
                      ? "bg-black text-white border-black"
                      : "border-gray-200 text-gray-700 hover:border-black"
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
              Colors
            </h4>

            <div className="flex flex-wrap gap-3 items-center">
              {colorsList.map((colClass, idx) => (
                <button
                  key={idx}
                  onClick={() =>
                    setSelectedColor(colClass)
                  }
                  className={`w-6 h-6 rounded-full ${colClass} ${
                    selectedColor === colClass
                      ? "ring-2 ring-black scale-110"
                      : "opacity-80 hover:opacity-100"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
              Price Range
            </h4>

            <div className="space-y-2 text-xs text-gray-700">
              {[
                "Under ₹5,000",
                "₹5,000 - ₹10,000",
                "₹10,000 - ₹20,000",
                "Over ₹20,000",
              ].map((range) => (
                <label
                  key={range}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="price"
                    checked={priceRange === range}
                    onChange={() =>
                      setPriceRange(range)
                    }
                    className="accent-black"
                  />

                  {range}
                </label>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
              Availability
            </h4>

            <div className="space-y-2 text-xs text-gray-700">

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={() =>
                    setInStockOnly(!inStockOnly)
                  }
                  className="accent-black"
                />
                In Stock
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={customStitching}
                  onChange={() =>
                    setCustomStitching(!customStitching)
                  }
                  className="accent-black"
                />
                Custom Stitching Available
              </label>

            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">

            <button
              onClick={() => {
                setSelectedCategory("All");
                setSelectedSizes([]);
                setSelectedColor("");
                setPriceRange("");
                setInStockOnly(false);
                setCustomStitching(false);

                setAppliedFilters({
                  category: "All",
                  sizes: [],
                  color: "",
                  priceRange: "",
                  inStockOnly: false,
                  customStitching: false,
                });

                showToast("Filters cleared");
              }}
              className="w-full border border-gray-300 py-2.5 text-[10px] uppercase tracking-wider rounded font-semibold text-gray-700 hover:bg-gray-50"
            >
              Clear All
            </button>

            <button
              onClick={() => {
                setAppliedFilters({
                  category: selectedCategory,
                  sizes: [...selectedSizes],
                  color: selectedColor,
                  priceRange: priceRange,
                  inStockOnly: inStockOnly,
                  customStitching: customStitching,
                });

                showToast("Filters applied!");
              }}
              className="w-full bg-black text-white py-2.5 text-[10px] uppercase tracking-wider rounded font-semibold hover:bg-gray-800"
            >
              Apply Now
            </button>

          </div>
        </aside>

        {/* ===================================================
            PRODUCT CATALOGUE
        ==================================================== */}
        <div className="lg:col-span-3 space-y-6">

          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm gap-4">

            <span className="text-xs text-gray-500">
              Showing{" "}
              <strong>{filteredProducts.length}</strong>{" "}
              items from NeonDB for "
              <strong>{appliedFilters.category}</strong>"
            </span>

            <div className="flex items-center gap-2 text-xs w-full sm:w-auto">
              <span className="text-gray-400 whitespace-nowrap">
                Sort By:
              </span>

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value)
                }
                className="bg-gray-50 border border-gray-200 px-3 py-2 rounded text-gray-800 font-semibold focus:outline-none w-full sm:w-auto"
              >
                <option>Featured Highlights</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest Arrivals</option>
              </select>
            </div>
          </div>

          {/* Products */}
          {loading ? (
            <div className="text-center py-20 text-xs uppercase tracking-widest text-gray-500 animate-pulse">
              Loading database items from NeonDB...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 py-20 px-6 text-center">
              <p className="font-serif text-lg text-gray-800 mb-2">
                No products found
              </p>

              <p className="text-xs text-gray-500">
                Try changing your filters or selecting another category.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">

              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 flex flex-col"
                >

                  {/* Product Image */}
                  <div className="relative h-72 sm:h-80 bg-gray-100 overflow-hidden">

                    <span className="absolute top-3 left-3 z-10 bg-black/80 text-white text-[9px] uppercase px-2.5 py-1 tracking-widest">
                      {p.tag || p.category}
                    </span>

                    {/* Wishlist */}
                    <button
                      onClick={() =>
                        handleAddToWishlist(p)
                      }
                      className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white text-rose-700 shadow cursor-pointer transition-transform active:scale-95 z-10"
                      title="Save to Wishlist"
                    >
                      <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                    </button>

                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="p-4 flex flex-col flex-grow justify-between">

                    <div>
                      <h3 className="font-serif text-sm font-medium mb-1">
                        {p.name}
                      </h3>

                      <p className="text-xs font-bold text-gray-900">
                        {p.price}

                        {p.old_price && (
                          <span className="text-gray-400 line-through font-normal ml-2">
                            {p.old_price}
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-gray-100">

                      {/* Quick View */}
                      <Link
                        to={`/product/${p.id}`}
                        className="text-[10px] uppercase tracking-wider py-2 border border-gray-300 text-gray-800 hover:bg-gray-50 text-center rounded"
                      >
                        Quick View
                      </Link>

                      {/* Add To Bag */}
                      <button
                        onClick={() =>
                          handleAddToCart(p)
                        }
                        className="text-[10px] uppercase tracking-wider py-2 bg-black text-white hover:bg-gray-800 flex items-center justify-center gap-1 rounded"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        Add to Bag
                      </button>

                    </div>
                  </div>
                </div>
              ))}

            </div>
          )}

          {/* Pagination */}
          <div className="flex justify-center items-center gap-2 pt-8">

            <button
              onClick={() => showToast("Page 1")}
              className="w-9 h-9 rounded-lg border border-gray-200 bg-white text-xs flex items-center justify-center font-semibold hover:border-black"
            >
              1
            </button>

            <button
              onClick={() => showToast("Page 2")}
              className="w-9 h-9 rounded-lg border border-gray-200 bg-white text-xs flex items-center justify-center font-semibold hover:border-black"
            >
              2
            </button>

            <button
              onClick={() => showToast("Next Page")}
              className="w-9 h-9 rounded-lg border border-gray-200 bg-white text-xs flex items-center justify-center font-semibold hover:border-black"
            >
              ›
            </button>

          </div>
        </div>
      </div>

      {/* =====================================================
          FOOTER — PRESERVED FROM YOUR SHOP PAGE
      ====================================================== */}
      <footer className="bg-[#F3EDE2] text-gray-800 pt-16 pb-12 px-6 lg:px-12 border-t border-gray-300">

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-gray-300/60">

          <div className="md:col-span-2">
            <h3 className="font-serif text-xl tracking-[0.2em] font-bold mb-4">
              WEFTIN
            </h3>

            <p className="text-xs text-gray-600 leading-relaxed mb-4">
              A digital high-fashion atelier marrying heritage luxury craftsmanship with modern silhouettes. Stitched with unparalleled dedication to structural flow.
            </p>

            <p className="text-[11px] text-gray-600">
              <strong>Concierge:</strong> concierge@weftin.com
            </p>

            <p className="text-[11px] text-gray-600">
              <strong>Direct Line:</strong> 1-800-WEFT-LUXE
            </p>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-900 mb-4">
              Collections
            </h4>

            <ul className="space-y-2 text-xs text-gray-600">
              <li>
                <a href="#" className="hover:text-black">
                  Sarees
                </a>
              </li>

              <li>
                <a href="#" className="hover:text-black">
                  Lehengas
                </a>
              </li>

              <li>
                <a href="#" className="hover:text-black">
                  Dresses
                </a>
              </li>

              <li>
                <a href="#" className="hover:text-black">
                  Kurtis
                </a>
              </li>

              <li>
                <a href="#" className="hover:text-black">
                  Co-Ord Sets
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-900 mb-4">
              Concierge Care
            </h4>

            <ul className="space-y-2 text-xs text-gray-600">
              <li>
                <a href="#" className="hover:text-black">
                  Help Center
                </a>
              </li>

              <li>
                <a href="#" className="hover:text-black">
                  Order Tracking
                </a>
              </li>

              <li>
                <a href="#" className="hover:text-black">
                  Returns & Adjustments
                </a>
              </li>

              <li>
                <a href="#" className="hover:text-black">
                  Shipping Policy
                </a>
              </li>

              <li>
                <a href="#" className="hover:text-black">
                  Fabric Quality Guide
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-900 mb-4">
              Account
            </h4>

            <ul className="space-y-2 text-xs text-gray-600">
              <li>
                <Link
                  to="/profile"
                  className="hover:text-black"
                >
                  Sign In
                </Link>
              </li>

              <li>
                <Link
                  to="/profile"
                  className="hover:text-black"
                >
                  Register Membership
                </Link>
              </li>

              <li>
                <Link
                  to="/dashboard"
                  className="hover:text-black"
                >
                  Order History
                </Link>
              </li>

              <li>
                <Link
                  to="/profile"
                  className="hover:text-black"
                >
                  My Bespoke Fit
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center pt-8 text-[11px] text-gray-500">

          <p>
            © 2026 WEFTIN Atelier. All Rights Reserved. Crafted with pristine elegance.
          </p>

          <div className="flex gap-6 mt-4 md:mt-0">

            <a
              href="#"
              className="hover:text-black"
            >
              Privacy Policy
            </a>

            <a
              href="#"
              className="hover:text-black"
            >
              Terms of Service
            </a>

          </div>
        </div>
      </footer>

    </div>
  );
}