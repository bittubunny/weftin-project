import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Bell,
  Settings,
  Menu,
  X,
  LayoutDashboard,
  Package,
  Scissors,
  Ruler,
  MapPin,
  Headphones,
  LogOut,
  ChevronRight
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://weftin-project.onrender.com";

export default function Home_Page() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("Sarees");
  const [cartCount, setCartCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);

  const [userAvatar, setUserAvatar] = useState("");

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [trendingNow, setTrendingNow] = useState([]);

  const [selectedSize, setSelectedSize] = useState("M (Blouse 38)");
  const [selectedColor, setSelectedColor] = useState("royal crimson");

  const [toastMessage, setToastMessage] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [searchText, setSearchText] = useState("");

  const [quickViewProduct, setQuickViewProduct] = useState(null);

  /*
  ============================================================
  USER
  ============================================================
  */

  const userName =
    currentUser?.name ||
    currentUser?.full_name ||
    currentUser?.username ||
    "WEFTIN Member";

  const userEmail = currentUser?.email || "";

  const userInitial =
    userName.charAt(0).toUpperCase() || "W";

  /*
  ============================================================
  TOAST
  ============================================================
  */

  const showToast = useCallback((msg) => {
    setToastMessage(msg);

    window.setTimeout(() => {
      setToastMessage("");
    }, 3000);
  }, []);

  /*
  ============================================================
  LOGOUT HANDLER
  ============================================================
  */

  const handleLogout = () => {
    localStorage.removeItem("weftin_user");
    localStorage.removeItem("weftin_token");
    setMobileMenuOpen(false);
    navigate("/login");
  };

  /*
  ============================================================
  CART
  ============================================================
  */

  const getCart = () => {
    try {
      const storedCart = localStorage.getItem("weftin_cart");

      if (!storedCart) {
        return [];
      }

      const parsedCart = JSON.parse(storedCart);

      return Array.isArray(parsedCart) ? parsedCart : [];
    } catch (error) {
      console.error("Unable to read cart:", error);
      return [];
    }
  };

  const updateCartCount = useCallback(() => {
    const cart = getCart();

    const totalQuantity = cart.reduce(
      (total, item) => total + (Number(item.qty) || 0),
      0
    );

    setCartCount(totalQuantity);
  }, []);

  const addProductToCart = useCallback(
    (product, extraOptions = {}) => {
      try {
        const productId =
          product?.product_id ??
          product?.productId ??
          product?.id;

        if (!productId) {
          showToast("This product cannot be added to your bag.");
          return;
        }

        const numericProductId = Number(productId);

        let cart = getCart();

        const size = extraOptions.size ?? product?.size ?? "";
        const color =
          extraOptions.color ??
          product?.color ??
          product?.shade ??
          "";

        const quantity =
          Number(extraOptions.quantity ?? 1) || 1;

        const existingIndex = cart.findIndex((item) => {
          const itemProductId = Number(
            item?.product_id ??
            item?.productId ??
            item?.id
          );

          const itemSize = item?.size || "";

          const itemColor =
            item?.color ||
            item?.shade ||
            "";

          return (
            itemProductId === numericProductId &&
            itemSize === size &&
            itemColor === color
          );
        });

        if (existingIndex !== -1) {
          const updatedCart = [...cart];

          updatedCart[existingIndex] = {
            ...updatedCart[existingIndex],
            qty:
              Number(updatedCart[existingIndex].qty || 0) +
              quantity
          };

          cart = updatedCart;
        } else {
          const price =
            product?.price ??
            product?.unit_price ??
            "₹0";

          cart.push({
            id: numericProductId,
            product_id: numericProductId,
            name: product?.name || "WEFTIN Product",
            category: product?.category || "",
            image: product?.image || "",
            price: price,
            size: size,
            color: color,
            shade: color,
            qty: quantity,
            tag: product?.tag || "ATELIER"
          });
        }

        localStorage.setItem(
          "weftin_cart",
          JSON.stringify(cart)
        );

        updateCartCount();

        showToast(
          `${product?.name || "Item"} added to Bag`
        );
      } catch (error) {
        console.error("Add to cart error:", error);
        showToast("Unable to add this item to your bag.");
      }
    },
    [showToast, updateCartCount]
  );

  /*
  ============================================================
  FETCH HOME PRODUCTS
  ============================================================
  */

  const fetchData = useCallback(() => {
    // Featured Collection
    fetch(
      `${API_BASE_URL}/api/home-products?section=Featured`
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            "Failed to fetch Featured products"
          );
        }

        return res.json();
      })
      .then((data) => {
        setFeaturedProducts(
          Array.isArray(data) ? data : []
        );
      })
      .catch((err) => {
        console.error(
          "Featured fetch error:",
          err
        );

        setFeaturedProducts([]);
      });

    // Best Sellers
    fetch(
      `${API_BASE_URL}/api/home-products?section=Best+Seller`
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            "Failed to fetch Best Sellers"
          );
        }

        return res.json();
      })
      .then((data) => {
        setBestSellers(
          Array.isArray(data) ? data : []
        );
      })
      .catch((err) => {
        console.error(
          "Best seller fetch error:",
          err
        );

        setBestSellers([]);
      });

    // Trending
    fetch(
      `${API_BASE_URL}/api/home-products?section=Trending`
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            "Failed to fetch Trending products"
          );
        }

        return res.json();
      })
      .then((data) => {
        setTrendingNow(
          Array.isArray(data) ? data : []
        );
      })
      .catch((err) => {
        console.error(
          "Trending fetch error:",
          err
        );

        setTrendingNow([]);
      });
  }, []);

  /*
  ============================================================
  UNREAD NOTIFICATION COUNT
  ============================================================
  */

  const loadUnreadCount = useCallback(async () => {
    if (!userEmail) {
      setUnreadCount(0);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/notifications/unread-count/${encodeURIComponent(
          userEmail
        )}`
      );

      const data = await response.json();

      if (!response.ok) {
        return;
      }

      setUnreadCount(
        Number(data?.count || 0)
      );
    } catch (error) {
      console.error(
        "Unread notification count error:",
        error
      );
    }
  }, [userEmail]);

  /*
  ============================================================
  INITIAL LOAD
  ============================================================
  */

  useEffect(() => {
    try {
      const storedUser =
        localStorage.getItem("weftin_user");

      if (!storedUser) {
        navigate("/login");
        return;
      }

      const savedUser = JSON.parse(storedUser);

      if (!savedUser?.email) {
        navigate("/login");
        return;
      }

      setCurrentUser(savedUser);

      if (savedUser?.avatar) {
        setUserAvatar(savedUser.avatar);
      }

      fetch(
        `${API_BASE_URL}/api/user/${encodeURIComponent(
          savedUser.email
        )}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data?.avatar) {
            setUserAvatar(data.avatar);
          }
        })
        .catch((err) =>
          console.error(
            "User avatar fetch error:",
            err
          )
        );

      fetchData();
    } catch (error) {
      console.error(
        "Unable to load user:",
        error
      );

      navigate("/login");
    }

    updateCartCount();
  }, [
    navigate,
    fetchData,
    updateCartCount
  ]);

  useEffect(() => {
    if (!userEmail) {
      return;
    }

    loadUnreadCount();

    const interval = window.setInterval(() => {
      loadUnreadCount();
    }, 30000);

    return () => {
      window.clearInterval(interval);
    };
  }, [
    userEmail,
    loadUnreadCount
  ]);

  /*
  ============================================================
  CATEGORIES
  ============================================================
  */

  const categories = [
    "Sarees",
    "Lehengas",
    "Dresses",
    "Kurtis",
    "Co-Ord Sets",
    "Kids Wear",
    "Festival Specs"
  ];

  const filteredFeatured =
    activeTab === "Sarees"
      ? featuredProducts
      : featuredProducts.filter(
          (product) =>
            String(product?.category || "")
              .toLowerCase()
              .trim() ===
            activeTab.toLowerCase().trim()
        );

  /*
  ============================================================
  SEARCH
  ============================================================
  */

  const handleSearch = (event) => {
    event.preventDefault();

    const query = searchText.trim();

    if (!query) {
      navigate("/shop");
      return;
    }

    navigate(
      `/shop?search=${encodeURIComponent(query)}`
    );
  };

  /*
  ============================================================
  INSTAGRAM
  ============================================================
  */

  const instagramPosts = [
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=500",
    "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=500",
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=500",
    "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=500",
    "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=500",
    "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=500"
  ];

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  /*
  ============================================================
  RENDER
  ============================================================
  */

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-gray-900 font-sans relative">

      {/* ======================================================
          TOAST
      ====================================================== */}

      {toastMessage && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-[100] bg-gray-900 text-white px-6 py-3 rounded-lg shadow-2xl text-sm flex items-center gap-3 border border-amber-500/30 max-w-sm">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0"></span>

          <span className="flex-1">
            {toastMessage}
          </span>

          <button
            onClick={() => setToastMessage("")}
            className="text-gray-400 hover:text-white"
            aria-label="Close notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ======================================================
          ADMIN CMS SHORTCUT
      ====================================================== */}

      <div className="fixed bottom-6 left-4 sm:left-6 z-50">
        <button
          onClick={() =>
            navigate("/admin/home-cms")
          }
          className="bg-black text-[#D4AF37] px-4 py-3 rounded-full shadow-2xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 border border-amber-500/40 hover:bg-gray-900 cursor-pointer"
        >
          <Settings className="w-4 h-4" />

          <span className="hidden sm:inline">
            Open Admin Product CMS
          </span>

          <span className="sm:hidden">
            CMS
          </span>
        </button>
      </div>

      {/* ======================================================
          TOP ANNOUNCEMENT BAR
      ====================================================== */}

      <div className="bg-[#1C1816] text-[#E5D5BC] text-[10px] sm:text-xs py-2 px-4 text-center tracking-[0.15em] sm:tracking-[0.2em] uppercase font-medium">
        LIMITED FESTIVE EDIT — 20% OFF SELECTED COUTURE PIECES
      </div>

      {/* ======================================================
          DESKTOP NAVIGATION
      ====================================================== */}

      <header className="hidden md:block sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-gray-200 px-6 lg:px-12 py-4">

        <div className="max-w-7xl mx-auto flex items-center justify-between">

          {/* SEARCH */}

          <form
            onSubmit={handleSearch}
            className="hidden lg:flex items-center bg-gray-100 rounded-full px-4 py-2 w-64 border border-gray-200"
          >
            <Search className="w-4 h-4 text-gray-400 mr-2" />

            <input
              type="text"
              value={searchText}
              onChange={(e) =>
                setSearchText(e.target.value)
              }
              placeholder="Search anything..."
              className="bg-transparent text-xs text-gray-800 focus:outline-none w-full"
            />
          </form>

          {/* LOGO */}

          <Link
            to="/"
            className="text-center"
          >
            <h1 className="font-serif text-2xl tracking-[0.25em] font-bold text-gray-900">
              WEFTIN
            </h1>
          </Link>

          {/* RIGHT ACTIONS */}

          <div className="flex items-center gap-5 lg:gap-6">

            <span className="text-xs font-medium text-gray-700 cursor-pointer">
              INR &or;
            </span>

            <Link
              to="/wishlist"
              className="text-gray-800 hover:text-black"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
            </Link>

            {/* NOTIFICATIONS */}

            <Link
              to="/notifications"
              className="relative text-gray-800 hover:text-black"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />

              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-rose-700 text-white text-[8px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center font-bold">
                  {unreadCount > 9
                    ? "9+"
                    : unreadCount}
                </span>
              )}
            </Link>

            {/* USER */}

            <Link
              to="/profile"
              className="flex items-center gap-2 text-gray-800 hover:text-black"
            >
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-7 h-7 rounded-full object-cover border border-amber-600 shadow-xs"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-serif font-bold border border-amber-300">
                  {userInitial}
                </div>
              )}

              <span className="text-xs font-semibold hidden sm:inline max-w-28 truncate">
                {userName}
              </span>
            </Link>

            {/* SLIDING MENU TOGGLE BUTTON (DESKTOP) */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1 text-gray-800 hover:text-black cursor-pointer flex items-center gap-1.5 border-l pl-4 border-gray-200"
              aria-label="Open Navigation Drawer"
            >
              <Menu className="w-5 h-5" />
              <span className="text-[10px] uppercase tracking-wider font-semibold hidden lg:inline">Menu</span>
            </button>

            {/* CART */}

            <Link
              to="/cart"
              className="relative text-gray-800 hover:text-black"
              aria-label="Shopping bag"
            >
              <ShoppingBag className="w-5 h-5" />

              {cartCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-amber-700 text-white text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
                  {cartCount > 99
                    ? "99+"
                    : cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* DESKTOP NAV */}

        <nav className="hidden md:flex justify-center items-center gap-6 lg:gap-8 mt-4 pt-3 border-t border-gray-200/60 text-[10px] lg:text-xs tracking-[0.15em] uppercase text-gray-700 font-medium">

          <Link
            to="/"
            className="text-black font-semibold border-b border-black pb-0.5"
          >
            Home
          </Link>

          <Link
            to="/shop"
            className="hover:text-black transition-colors"
          >
            Shop
          </Link>

          <Link
            to="/collections"
            className="hover:text-black transition-colors"
          >
            Collections
          </Link>

          <Link
            to="/custom-designs"
            className="hover:text-black transition-colors"
          >
            Custom Design
          </Link>

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

      {/* ======================================================
          MOBILE HEADER
      ====================================================== */}

      <header className="md:hidden sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-gray-200 px-4 py-4">

        <div className="flex items-center justify-between gap-3">

          <Link
            to="/"
            className="flex items-center gap-2 min-w-0"
          >
            <div className="bg-black text-[#E5D5BC] w-8 h-8 rounded flex items-center justify-center font-serif font-bold shrink-0">
              W
            </div>

            <div className="min-w-0">
              <h1 className="font-serif text-base tracking-[0.2em] font-bold text-gray-900">
                WEFTIN
              </h1>

              <span className="text-[8px] uppercase tracking-[0.15em] text-gray-400 block">
                ATELIER TAILORS
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3 shrink-0">

            {/* WISHLIST */}

            <Link
              to="/wishlist"
              className="text-gray-700 hover:text-black"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
            </Link>

            {/* CART */}

            <Link
              to="/cart"
              className="relative text-gray-700 hover:text-black"
              aria-label="Shopping bag"
            >
              <ShoppingBag className="w-5 h-5" />

              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-700 text-white text-[8px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center font-bold">
                  {cartCount > 9
                    ? "9+"
                    : cartCount}
                </span>
              )}
            </Link>

            {/* NOTIFICATIONS */}

            <Link
              to="/notifications"
              className="relative text-gray-700 hover:text-black"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />

              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-rose-700 text-white text-[8px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center font-bold">
                  {unreadCount > 9
                    ? "9+"
                    : unreadCount}
                </span>
              )}
            </Link>

            {/* USER */}

            <Link
              to="/profile"
              aria-label="Profile"
            >
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-7 h-7 rounded-full object-cover border border-amber-600"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-serif font-bold border border-amber-300 text-xs">
                  {userInitial}
                </div>
              )}
            </Link>

            {/* MENU */}

            <button
              onClick={() =>
                setMobileMenuOpen(true)
              }
              className="p-1 text-gray-700 hover:text-black cursor-pointer"
              aria-label="Open navigation"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* ======================================================
          SLIDING NAVIGATION DRAWER (ALL PAGES & SECTIONS)
      ====================================================== */}

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
          onClick={closeMobileMenu}
        />
      )}

      <aside
        className={`fixed left-0 top-0 bottom-0 w-80 max-w-[90vw] bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col justify-between ${
          mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        <div>
          {/* DRAWER HEADER */}
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <Link
              to="/"
              onClick={closeMobileMenu}
              className="flex items-center gap-3"
            >
              <div className="bg-black text-[#E5D5BC] w-9 h-9 rounded-lg flex items-center justify-center font-serif font-bold text-base shadow-sm">
                W
              </div>

              <div>
                <h2 className="font-serif text-sm tracking-[0.2em] font-bold text-gray-900">
                  WEFTIN
                </h2>

                <span className="text-[9px] uppercase tracking-[0.2em] text-gray-400 block font-medium">
                  ATELIER NAVIGATION
                </span>
              </div>
            </Link>

            <button
              onClick={closeMobileMenu}
              className="p-2 text-gray-500 hover:text-black rounded-full hover:bg-gray-200/50 transition-colors cursor-pointer"
              aria-label="Close navigation drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* USER PROFILE SNIPPET */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-amber-50/30">
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={userName}
                className="w-10 h-10 rounded-full object-cover border border-amber-600 shadow-xs"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-serif font-bold border border-amber-300">
                {userInitial}
              </div>
            )}

            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-900 truncate">
                {userName}
              </p>

              <p className="text-[10px] text-gray-500 truncate">
                {userEmail || "Member Account"}
              </p>
            </div>
          </div>

          {/* COMPLETE NAVIGATION LINKS */}
          <nav className="p-4 space-y-1 text-xs font-medium text-gray-700 overflow-y-auto max-h-[calc(100vh-250px)]">
            <div className="px-3 py-2 text-[10px] uppercase tracking-widest text-gray-400 font-bold">
              Main Pages
            </div>

            <Link
              to="/"
              onClick={closeMobileMenu}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-amber-50 hover:text-amber-900 transition-colors group"
            >
              <span className="flex items-center gap-3">
                <LayoutDashboard className="w-4 h-4 text-amber-700" />
                Home
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              to="/shop"
              onClick={closeMobileMenu}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-amber-50 hover:text-amber-900 transition-colors group"
            >
              <span className="flex items-center gap-3">
                <ShoppingBag className="w-4 h-4 text-amber-700" />
                Shop Catalog
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              to="/collections"
              onClick={closeMobileMenu}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-amber-50 hover:text-amber-900 transition-colors group"
            >
              <span className="flex items-center gap-3">
                <Package className="w-4 h-4 text-amber-700" />
                Collections
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              to="/custom-designs"
              onClick={closeMobileMenu}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-amber-50 hover:text-amber-900 transition-colors group"
            >
              <span className="flex items-center gap-3">
                <Scissors className="w-4 h-4 text-amber-700" />
                Custom Designs & Workspace
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              to="/lookbook"
              onClick={closeMobileMenu}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-amber-50 hover:text-amber-900 transition-colors group"
            >
              <span className="flex items-center gap-3">
                <Heart className="w-4 h-4 text-amber-700" />
                Lookbook Journal
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              to="/limited"
              onClick={closeMobileMenu}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-amber-50 hover:text-amber-900 transition-colors group"
            >
              <span className="flex items-center gap-3">
                <StarIcon />
                Limited Edition Drop
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <div className="pt-3 pb-1 px-3 text-[10px] uppercase tracking-widest text-gray-400 font-bold border-t border-gray-100 mt-2">
              Member Portal & Profile
            </div>

            <Link
              to="/dashboard"
              onClick={closeMobileMenu}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-amber-50 hover:text-amber-900 transition-colors group"
            >
              <span className="flex items-center gap-3">
                <LayoutDashboard className="w-4 h-4 text-gray-700" />
                Dashboard Overview
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              to="/orders"
              onClick={closeMobileMenu}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-amber-50 hover:text-amber-900 transition-colors group"
            >
              <span className="flex items-center gap-3">
                <Package className="w-4 h-4 text-gray-700" />
                My Orders & History
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              to="/measurements"
              onClick={closeMobileMenu}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-amber-50 hover:text-amber-900 transition-colors group"
            >
              <span className="flex items-center gap-3">
                <Ruler className="w-4 h-4 text-gray-700" />
                Bespoke Fit Measurements
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              to="/wishlist"
              onClick={closeMobileMenu}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-amber-50 hover:text-amber-900 transition-colors group"
            >
              <span className="flex items-center gap-3">
                <Heart className="w-4 h-4 text-gray-700" />
                Saved Wishlist
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              to="/addresses"
              onClick={closeMobileMenu}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-amber-50 hover:text-amber-900 transition-colors group"
            >
              <span className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-gray-700" />
                Delivery Addresses
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              to="/profile"
              onClick={closeMobileMenu}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-amber-50 hover:text-amber-900 transition-colors group"
            >
              <span className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-700" />
                Member Profile
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              to="/notifications"
              onClick={closeMobileMenu}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-amber-50 hover:text-amber-900 transition-colors group"
            >
              <span className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-gray-700" />
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="bg-rose-700 text-white text-[9px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </Link>

            <Link
              to="/support"
              onClick={closeMobileMenu}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-amber-50 hover:text-amber-900 transition-colors group"
            >
              <span className="flex items-center gap-3">
                <Headphones className="w-4 h-4 text-gray-700" />
                Concierge Support
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <div className="pt-3 pb-1 px-3 text-[10px] uppercase tracking-widest text-amber-800 font-bold border-t border-gray-100 mt-2">
              Administration
            </div>

            <Link
              to="/admin/home-cms"
              onClick={closeMobileMenu}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-black text-[#D4AFX7] hover:bg-gray-900 text-white transition-colors"
            >
              <span className="flex items-center gap-3 font-semibold text-amber-300">
                <Settings className="w-4 h-4" />
                Admin Product CMS
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-amber-300" />
            </Link>
          </nav>
        </div>

        {/* DRAWER FOOTER / LOGOUT */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs text-rose-700 font-semibold hover:bg-rose-50 rounded-lg transition-colors cursor-pointer border border-rose-200/60 bg-white shadow-2xs"
          >
            <LogOut className="w-4 h-4" />
            Log out of account
          </button>
        </div>
      </aside>

      {/* ======================================================
          SECTION 1: HERO EDITORIAL
      ====================================================== */}

      <section className="relative h-[75vh] sm:h-[85vh] flex items-center px-6 lg:px-20 overflow-hidden bg-gray-900">

        <div className="absolute inset-0">

          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1800"
            alt="Hero"
            className="w-full h-full object-cover opacity-70"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-2xl text-white">

          <span className="text-xs uppercase tracking-[0.3em] text-amber-300 font-semibold mb-3 block">
            HIGH FASHION ATELIER
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-serif font-light leading-tight mb-6">
            Define Your Signature
          </h1>

          <p className="text-gray-300 text-sm lg:text-base font-light mb-8 leading-relaxed max-w-lg">
            Modern couture, crafted for every moment.
            Stitched with unparalleled dedication to
            structural flow and heritage looms.
          </p>

          <div className="flex flex-wrap gap-4">

            <button
              onClick={() => navigate("/shop")}
              className="bg-white text-black px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] hover:bg-amber-100 transition-colors cursor-pointer"
            >
              Shop New Arrivals
            </button>

            <button
              onClick={() =>
                navigate("/custom-designs")
              }
              className="border border-white/80 text-white px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] hover:bg-white/10 transition-colors cursor-pointer"
            >
              Start Custom Design
            </button>

          </div>
        </div>
      </section>

      {/* ======================================================
          SECTION 2: FEATURED COLLECTIONS
      ====================================================== */}

      <section
        id="collections"
        className="py-16 sm:py-24 px-6 lg:px-12 max-w-7xl mx-auto"
      >

        <div className="text-center max-w-xl mx-auto mb-12">

          <span className="text-xs uppercase tracking-[0.25em] text-amber-700 font-semibold block mb-2">
            HERITAGE SILHOUETTES
          </span>

          <h2 className="text-3xl lg:text-4xl font-serif font-light text-gray-900 mb-2">
            Featured Collections
          </h2>

          <p className="text-gray-600 text-xs">
            Meticulously cataloged styles for every
            bespoke occasion.
          </p>
        </div>

        {/* CATEGORY TABS */}

        <div className="flex flex-wrap justify-center gap-3 mb-16">

          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() =>
                setActiveTab(cat)
              }
              className={`px-5 py-2 text-xs uppercase tracking-wider transition-all duration-300 rounded-full border cursor-pointer ${
                activeTab === cat
                  ? "bg-[#5C1D24] text-white border-[#5C1D24] shadow-md"
                  : "bg-white text-gray-700 border-gray-300 hover:border-gray-900"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* PRODUCTS */}

        {filteredFeatured.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

            {filteredFeatured.map((prod) => (
              <div
                key={prod.id}
                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 flex flex-col"
              >

                <div className="relative h-96 overflow-hidden bg-gray-100">

                  <span className="absolute top-3 left-3 z-10 bg-black/80 text-white text-[9px] tracking-widest px-3 py-1 uppercase">
                    {prod.tag || "FEATURED"}
                  </span>

                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>

                <div className="p-5 flex flex-col flex-grow justify-between">

                  <div>
                    <h3 className="font-serif text-base text-gray-900 mb-1">
                      {prod.name}
                    </h3>

                    <p className="text-sm font-bold text-gray-900">
                      {prod.price}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-100">

                    <button
                      onClick={() =>
                        setQuickViewProduct(prod)
                      }
                      className="text-[11px] uppercase tracking-wider py-2 border border-gray-300 text-gray-800 hover:bg-gray-50 cursor-pointer"
                    >
                      Quick View
                    </button>

                    <button
                      onClick={() =>
                        addProductToCart(prod)
                      }
                      className="text-[11px] uppercase tracking-wider py-2 bg-gray-900 text-white hover:bg-black cursor-pointer"
                    >
                      Add to Bag
                    </button>

                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl py-16 text-center">
            <p className="font-serif text-xl text-gray-900">
              No {activeTab} available
            </p>

            <p className="text-xs text-gray-500 mt-2">
              Please check another collection.
            </p>
          </div>
        )}
      </section>

      {/* ======================================================
          SECTION 3: CUSTOMIZABLE ATELIER DROP
      ====================================================== */}

      <section
        id="custom"
        className="py-16 sm:py-24 bg-[#110E0D] text-[#FAF8F5] px-6 lg:px-12"
      >

        <div className="max-w-7xl mx-auto">

          <div className="text-center max-w-xl mx-auto mb-16">

            <span className="text-xs uppercase tracking-[0.25em] text-amber-400 font-semibold block mb-2">
              INTERACTIVE SIGNATURE SHOWCASE
            </span>

            <h2 className="text-3xl lg:text-4xl font-serif font-light mb-3">
              Customizable Atelier Drop
            </h2>

            <p className="text-gray-400 text-xs tracking-wide">
              Create and personalize your signature look by
              selecting your preferred drape options below.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-[#1C1816] p-6 sm:p-8 lg:p-12 rounded-2xl border border-white/10 shadow-2xl">

            <div className="relative h-[420px] sm:h-[480px] rounded-xl overflow-hidden group">

              <span className="absolute top-4 left-4 z-10 bg-emerald-600 text-white text-[9px] tracking-widest px-3 py-1 uppercase font-semibold">
                IN STOCK & HAND-FINISHED
              </span>

              <img
                src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800"
                alt="Heritage Golden Brocade Drape"
                className="w-full h-full object-cover"
              />
            </div>

            <div>

              <span className="text-xs uppercase tracking-[0.2em] text-amber-400 block mb-2">
                ATELIER SPECIAL DROP
              </span>

              <h3 className="text-2xl lg:text-3xl font-serif mb-3">
                Heritage Golden Brocade Drape
              </h3>

              <div className="flex items-baseline gap-4 mb-6">

                <span className="text-3xl font-bold text-amber-300">
                  ₹15,499
                </span>

                <span className="text-sm text-gray-500 line-through">
                  ₹21,500
                </span>
              </div>

              <p className="text-gray-300 text-xs leading-relaxed mb-6">
                Experience Weftin's signature bespoke
                draping. Select your customized sizing length
                and color shade below.
              </p>

              {/* SIZE */}

              <div className="mb-6">

                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">
                  1. Tailoring Sizing:

                  <strong className="text-amber-300 ml-1">
                    {selectedSize}
                  </strong>
                </label>

                <div className="flex flex-wrap gap-2">

                  {[
                    "S (Blouse 34)",
                    "M (Blouse 38)",
                    "L (Blouse 42)",
                    "Standard Length"
                  ].map((sz) => (
                    <button
                      key={sz}
                      onClick={() =>
                        setSelectedSize(sz)
                      }
                      className={`px-3 py-2 text-[11px] font-semibold uppercase tracking-wider rounded border cursor-pointer ${
                        selectedSize === sz
                          ? "bg-amber-600 text-white border-amber-600"
                          : "border-white/20 text-gray-300"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* COLOR */}

              <div className="mb-8">

                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">
                  2. Silk Saree Shade:

                  <strong className="text-amber-300 uppercase ml-1">
                    {selectedColor}
                  </strong>
                </label>

                <div className="flex gap-3">

                  {[
                    {
                      name: "royal crimson",
                      bg: "bg-rose-950"
                    },
                    {
                      name: "emerald lagoon",
                      bg: "bg-emerald-900"
                    },
                    {
                      name: "Varanasi gold",
                      bg: "bg-amber-500"
                    }
                  ].map((color) => (
                    <button
                      key={color.name}
                      onClick={() =>
                        setSelectedColor(color.name)
                      }
                      aria-label={color.name}
                      className={`w-8 h-8 rounded-full ${color.bg} cursor-pointer ${
                        selectedColor === color.name
                          ? "ring-4 ring-amber-400 scale-110"
                          : "opacity-70"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* CUSTOMIZED ADD TO BAG */}

              <button
                onClick={() =>
                  addProductToCart(
                    {
                      id: 999,
                      product_id: 999,
                      name: "Heritage Golden Brocade Drape",
                      category: "Sarees",
                      price: "₹15,499",
                      image:
                        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800",
                      tag: "ATELIER SPECIAL DROP"
                    },
                    {
                      size: selectedSize,
                      color: selectedColor,
                      quantity: 1
                    }
                  )
                }
                className="w-full bg-[#D4AF37] hover:bg-[#c29e2f] text-black py-4 rounded font-bold uppercase text-xs tracking-[0.2em] shadow-lg cursor-pointer"
              >
                Add Customized Drop to Bag
              </button>

            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          SECTION 4: BEST SELLERS
      ====================================================== */}

      <section className="py-16 sm:py-24 px-6 lg:px-12 max-w-7xl mx-auto bg-[#FAF2EC] rounded-2xl my-16 sm:my-24 border border-amber-900/10">

        <div className="text-center max-w-xl mx-auto mb-12">

          <span className="text-xs uppercase tracking-[0.25em] text-amber-800 font-semibold block mb-2">
            THE ATELIER FAVORITES
          </span>

          <h2 className="text-3xl font-serif font-light text-gray-900 mb-1">
            Best Sellers
          </h2>

          <p className="text-xs text-gray-600">
            The highly popular garments adored by our circle.
          </p>
        </div>

        {bestSellers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

            {bestSellers.map((item) => (
              <div
                key={item.id}
                className="group bg-white rounded-xl overflow-hidden shadow-sm border flex flex-col"
              >

                <div className="relative h-80 bg-gray-100 overflow-hidden">

                  <span className="absolute top-3 left-3 z-10 bg-[#D4AF37] text-black text-[9px] uppercase px-2.5 py-1 font-bold">
                    {item.tag || "BEST SELLER"}
                  </span>

                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>

                <div className="p-4 flex flex-col flex-grow justify-between">

                  <div>
                    <h3 className="font-serif text-sm font-medium mb-1">
                      {item.name}
                    </h3>

                    <p className="text-xs font-bold text-gray-900">
                      {item.price}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4">

                    <button
                      onClick={() =>
                        setQuickViewProduct(item)
                      }
                      className="py-2 border border-gray-300 text-gray-800 text-[11px] uppercase tracking-wider hover:bg-gray-50 cursor-pointer"
                    >
                      Quick View
                    </button>

                    <button
                      onClick={() =>
                        addProductToCart(item)
                      }
                      className="py-2 bg-black text-white text-[11px] uppercase tracking-wider hover:bg-gray-900 cursor-pointer"
                    >
                      Add to Bag
                    </button>

                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-sm text-gray-500">
            No best sellers available right now.
          </div>
        )}
      </section>

      {/* ======================================================
          SECTION 5: TRENDING NOW
      ====================================================== */}

      <section className="py-16 sm:py-24 px-6 lg:px-12 max-w-7xl mx-auto">

        <div className="text-center max-w-xl mx-auto mb-12">

          <span className="text-xs uppercase tracking-[0.25em] text-rose-800 font-semibold block mb-2">
            STYLE COORDINATES
          </span>

          <h2 className="text-3xl font-serif font-light text-gray-900 mb-1">
            Trending Now
          </h2>

          <p className="text-xs text-gray-600">
            The hot coordinates catching everyone's eyes.
          </p>
        </div>

        {trendingNow.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {trendingNow.map((item) => (
              <div
                key={item.id}
                className="group bg-white rounded-xl overflow-hidden shadow-sm border flex flex-col"
              >

                <div className="relative h-80 bg-gray-100 overflow-hidden">

                  <span className="absolute top-3 left-3 z-10 bg-black text-white text-[9px] uppercase px-2.5 py-1">
                    {item.tag || "TRENDING"}
                  </span>

                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>

                <div className="p-4 flex flex-col flex-grow">

                  <div>
                    <h4 className="font-serif text-sm font-medium mb-1">
                      {item.name}
                    </h4>

                    <p className="text-xs font-bold text-gray-900">
                      {item.price}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      addProductToCart(item)
                    }
                    className="mt-4 w-full py-2 bg-black text-white text-[11px] uppercase tracking-wider hover:bg-gray-900 cursor-pointer"
                  >
                    Add to Bag
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-sm text-gray-500">
            No trending products available right now.
          </div>
        )}
      </section>

      {/* ======================================================
          SECTION 6: INSTAGRAM JOURNAL
      ====================================================== */}

      <section className="py-16 sm:py-24 px-6 lg:px-12 max-w-7xl mx-auto">

        <div className="text-center max-w-xl mx-auto mb-16">

          <span className="text-xs uppercase tracking-[0.25em] text-amber-700 font-semibold block mb-2">
            VISUAL JOURNAL
          </span>

          <h2 className="text-3xl font-serif font-light text-gray-900 mb-1">
            Follow Us on Instagram
          </h2>

          <span className="text-xs text-gray-500">
            @weftin_atelier • #WeftinAtelier
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">

          {instagramPosts.map(
            (imgUrl, index) => (
              <div
                key={index}
                className="relative h-64 rounded-xl overflow-hidden group cursor-pointer"
                onClick={() =>
                  showToast(
                    "Opening Instagram gallery..."
                  )
                }
              >
                <img
                  src={imgUrl}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
            )
          )}
        </div>
      </section>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <footer className="bg-[#F3EDE2] text-gray-800 pt-16 pb-12 px-6 lg:px-12 border-t border-gray-300">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-gray-300/60">
          
          <div className="md:col-span-2">
            <h3 className="font-serif text-xl tracking-[0.2em] font-bold mb-4">
              WEFTIN
            </h3>

            <p className="text-xs text-gray-600 leading-relaxed mb-4">
              A digital high-fashion atelier marrying heritage luxury craftsmanship
              with modern silhouettes. Stitched with unparalleled dedication to
              structural flow.
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
                <Link to="/shop" className="hover:text-black">Sarees</Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-black">Lehengas</Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-black">Dresses</Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-black">Kurtis</Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-black">Co-Ord Sets</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-900 mb-4">
              Concierge Care
            </h4>

            <ul className="space-y-2 text-xs text-gray-600">
              <li>
                <Link to="/support" className="hover:text-black">Help Center</Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-black">Order Tracking</Link>
              </li>
              <li>
                <Link to="/support" className="hover:text-black">Returns & Adjustments</Link>
              </li>
              <li>
                <Link to="/support" className="hover:text-black">Shipping Policy</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-900 mb-4">
              Account
            </h4>

            <ul className="space-y-2 text-xs text-gray-600">
              <li>
                <Link to="/profile" className="hover:text-black">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-black">
                  Register Membership
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-black">
                  Order History
                </Link>
              </li>
              <li>
                <Link to="/measurements" className="hover:text-black">
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
            <a href="#" className="hover:text-black">
              Privacy Policy
            </a>

            <a href="#" className="hover:text-black">
              Terms of Service
            </a>
          </div>
        </div>
      </footer>

      {/* ======================================================
          QUICK VIEW MODAL
      ====================================================== */}

      {quickViewProduct && (
        <div
          className="fixed inset-0 z-[90] bg-black/60 flex items-center justify-center p-4"
          onClick={() =>
            setQuickViewProduct(null)
          }
        >

          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="grid grid-cols-1 sm:grid-cols-2">

              {/* IMAGE */}

              <div className="h-80 sm:h-[420px] bg-gray-100">

                <img
                  src={quickViewProduct.image}
                  alt={quickViewProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* DETAILS */}

              <div className="p-6 sm:p-8 relative flex flex-col justify-center">

                <button
                  onClick={() =>
                    setQuickViewProduct(null)
                  }
                  className="absolute top-4 right-4 p-2 text-gray-500 hover:text-black cursor-pointer"
                  aria-label="Close quick view"
                >
                  <X className="w-5 h-5" />
                </button>

                <span className="text-[10px] uppercase tracking-[0.2em] text-amber-700 font-semibold mb-3">
                  {quickViewProduct.tag ||
                    "ATELIER"}
                </span>

                <h3 className="font-serif text-2xl text-gray-900 mb-3">
                  {quickViewProduct.name}
                </h3>

                <p className="text-lg font-bold text-gray-900 mb-5">
                  {quickViewProduct.price}
                </p>

                {quickViewProduct.category && (
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-6">
                    {quickViewProduct.category}
                  </p>
                )}

                <button
                  onClick={() => {
                    addProductToCart(
                      quickViewProduct
                    );

                    setQuickViewProduct(null);
                  }}
                  className="w-full bg-black text-white py-3 text-xs uppercase tracking-[0.2em] font-semibold hover:bg-gray-900 cursor-pointer"
                >
                  Add to Bag
                </button>

                <button
                  onClick={() => {
                    setQuickViewProduct(null);
                    navigate("/shop");
                  }}
                  className="w-full mt-3 border border-gray-300 text-gray-800 py-3 text-xs uppercase tracking-[0.2em] font-semibold hover:bg-gray-50 cursor-pointer"
                >
                  View Shop
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/*
============================================================
SMALL ICON COMPONENT
============================================================
*/

function StarIcon() {
  return (
    <span className="w-4 h-4 flex items-center justify-center text-sm">
      ★
    </span>
  );
}
