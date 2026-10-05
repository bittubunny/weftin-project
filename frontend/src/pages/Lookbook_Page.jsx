import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Bell,
  Menu,
  X
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://weftin-project.onrender.com";

export default function Lookbook_Page() {
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [toastMessage, setToastMessage] = useState("");

  const [lookbook, setLookbook] = useState([]);
  const [loading, setLoading] = useState(true);

  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState(null);
  const [userAvatar, setUserAvatar] = useState("");

  // =========================================================
  // TOAST
  // =========================================================

  const showToast = (msg) => {
    setToastMessage(msg);

    setTimeout(() => {
      setToastMessage("");
    }, 3000);
  };

  // =========================================================
  // GET SECTION
  // =========================================================

  const getSection = (key) => {
    return lookbook.find(
      (section) => section.section_key === key
    );
  };

  // =========================================================
  // LOAD USER + LOOKBOOK
  // =========================================================

  useEffect(() => {
    loadLookbook();

    try {
      const savedUser = localStorage.getItem("weftin_user");

      if (savedUser) {
        const user = JSON.parse(savedUser);

        setCurrentUser(user);

        if (user.avatar) {
          setUserAvatar(user.avatar);
        }

        if (user.email) {
          loadUserData(user.email);
          loadUnreadNotifications(user.email);
        }
      }
    } catch (error) {
      console.error("USER LOAD ERROR:", error);
    }

    loadCartCount();

    const handleStorageChange = (e) => {
      if (e.key === "weftin_cart") {
        loadCartCount();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // =========================================================
  // LOOKBOOK API
  // =========================================================

  const loadLookbook = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/lookbook`
      );

      if (!response.ok) {
        throw new Error("Failed to load Lookbook");
      }

      const data = await response.json();

      setLookbook(data.sections || []);

    } catch (error) {
      console.error("LOOKBOOK LOAD ERROR:", error);
      showToast("Unable to load Lookbook content");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // USER
  // =========================================================

  const loadUserData = async (email) => {
    const token = localStorage.getItem("weftin_token");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/user/${encodeURIComponent(email)}`,
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        }
      );

      if (!response.ok) return;

      const data = await response.json();

      if (data.avatar) {
        setUserAvatar(data.avatar);
      }
    } catch (error) {
      console.error("USER DATA ERROR:", error);
    }
  };

  // =========================================================
  // NOTIFICATIONS
  // =========================================================

  const loadUnreadNotifications = async (email) => {
    const token = localStorage.getItem("weftin_token");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/notifications/unread-count/${encodeURIComponent(
          email
        )}`,
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        }
      );

      if (!response.ok) return;

      const data = await response.json();

      setUnreadCount(Number(data.count || 0));
    } catch (error) {
      console.error(
        "UNREAD NOTIFICATION ERROR:",
        error
      );
    }
  };

  // =========================================================
  // CART
  // =========================================================

  const loadCartCount = () => {
    try {
      const cart =
        JSON.parse(
          localStorage.getItem("weftin_cart")
        ) || [];

      const total = cart.reduce(
        (sum, item) =>
          sum + Number(item.qty || 1),
        0
      );

      setCartCount(total);
    } catch (error) {
      console.error("CART COUNT ERROR:", error);
    }
  };

  // =========================================================
  // ADD LOOK TO CART
  // =========================================================

  const addLookToCart = (look) => {
    try {
      const existingCart =
        JSON.parse(
          localStorage.getItem("weftin_cart")
        ) || [];

      const existingIndex =
        existingCart.findIndex(
          (item) =>
            item.name === look.title
        );

      if (existingIndex !== -1) {
        existingCart[existingIndex].qty =
          Number(
            existingCart[existingIndex].qty || 1
          ) + 1;
      } else {
        existingCart.push({
          id: `lookbook-${look.id}`,
          product_id: look.id,
          name: look.title,
          category: "Lookbook",
          image: look.image_url,
          price: Number(
            String(look.price || "")
              .replace(/[₹,]/g, "")
          ) || 0,
          size: "",
          color: "",
          shade: "",
          qty: 1,
          tag: "Styled Look"
        });
      }

      localStorage.setItem(
        "weftin_cart",
        JSON.stringify(existingCart)
      );

      loadCartCount();

      showToast(
        `${look.title} added to Bag!`
      );
    } catch (error) {
      console.error(
        "LOOKBOOK CART ERROR:",
        error
      );

      showToast(
        "Unable to add item to Bag"
      );
    }
  };

  // =========================================================
  // USER DISPLAY
  // =========================================================

  const userName =
    currentUser?.name ||
    currentUser?.full_name ||
    currentUser?.username ||
    "Account";

  const userInitial =
    userName.charAt(0).toUpperCase();

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-amber-700 rounded-full animate-spin mx-auto mb-4"></div>

          <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
            Loading Lookbook
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // SECTIONS
  // =========================================================

  const hero = getSection("hero");
  const seasonal = getSection("seasonal_trends");
  const guides = getSection("styling_guides");
  const moodboard = getSection("moodboard");
  const styledLooks = getSection("styled_looks");

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-gray-900 font-sans relative">

      {/* =====================================================
          TOAST
      ====================================================== */}

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] bg-gray-900 text-white px-6 py-3 rounded-lg shadow-2xl text-sm animate-fade-in flex items-center gap-3 border border-amber-500/30">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          {toastMessage}
        </div>
      )}

      {/* =====================================================
          TOP ANNOUNCEMENT BAR
      ====================================================== */}

      <div className="bg-[#111111] text-[#E5D5BC] text-[9px] sm:text-xs py-2 px-3 text-center tracking-[0.15em] sm:tracking-[0.2em] uppercase font-medium">
        EXPLORE THE LOOKBOOK — CURATED EDITORIAL LOOKS FOR THE SEASON
      </div>

      {/* =====================================================
          DESKTOP / MAIN HEADER
      ====================================================== */}

      <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-gray-200 px-4 sm:px-6 lg:px-12 py-4">

        <div className="max-w-7xl mx-auto flex items-center justify-between">

          {/* SEARCH */}

          <div className="hidden lg:flex items-center bg-gray-100 rounded-full px-4 py-2 w-64 border border-gray-200">
            <Search className="w-4 h-4 text-gray-400 mr-2" />

            <input
              type="text"
              placeholder="Search lookbook..."
              className="bg-transparent text-xs text-gray-800 focus:outline-none w-full"
            />
          </div>

          {/* LOGO */}

          <div className="text-center">
            <Link to="/">
              <h1 className="font-serif text-xl sm:text-2xl tracking-[0.25em] font-bold text-gray-900">
                WEFTIN
              </h1>
            </Link>

            <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.3em] text-gray-500">
              Atelier
            </span>
          </div>

          {/* DESKTOP ICONS */}

          <div className="hidden md:flex items-center gap-5 lg:gap-6">

            <button
              onClick={() => {
                setWishlistCount((c) => c + 1);
                showToast("Added to Wishlist");
              }}
              className="relative text-gray-800 hover:text-black cursor-pointer"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />

              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-amber-700 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* NOTIFICATIONS */}

            <Link
              to="/notifications"
              className="relative text-gray-800 hover:text-black transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />

              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-amber-700 text-white text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
                  {unreadCount > 99
                    ? "99+"
                    : unreadCount}
                </span>
              )}
            </Link>

            {/* USER */}

            <Link
              to="/profile"
              className="flex items-center gap-2 text-gray-800 hover:text-black transition-colors"
              title="View Account Profile"
            >
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-7 h-7 rounded-full object-cover border border-gray-300"
                />
              ) : (
                <span className="w-7 h-7 rounded-full bg-amber-700 text-white text-[11px] flex items-center justify-center font-semibold">
                  {userInitial}
                </span>
              )}
            </Link>

            {/* CART */}

            <Link
              to="/cart"
              className="relative text-gray-800 hover:text-black transition-colors"
              title="Shopping Bag"
            >
              <ShoppingBag className="w-5 h-5" />

              {cartCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-amber-700 text-white text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

          </div>

          {/* MOBILE ICONS */}

          <div className="md:hidden flex items-center gap-3">

            <Link
              to="/notifications"
              className="relative text-gray-800"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />

              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-amber-700 text-white text-[9px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
                  {unreadCount > 99
                    ? "99+"
                    : unreadCount}
                </span>
              )}
            </Link>

            <Link
              to="/cart"
              className="relative text-gray-800"
              title="Shopping Bag"
            >
              <ShoppingBag className="w-5 h-5" />

              {cartCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-amber-700 text-white text-[9px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            <Link
              to="/profile"
              title="Profile"
            >
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-7 h-7 rounded-full object-cover border border-gray-300"
                />
              ) : (
                <span className="w-7 h-7 rounded-full bg-amber-700 text-white text-[11px] flex items-center justify-center font-semibold">
                  {userInitial}
                </span>
              )}
            </Link>

            <button
              onClick={() =>
                setMobileMenuOpen(true)
              }
              className="text-gray-800 cursor-pointer"
              title="Open Menu"
            >
              <Menu className="w-6 h-6" />
            </button>

          </div>

        </div>

        {/* ===================================================
            DESKTOP SUB NAV
        ==================================================== */}

        <nav className="hidden md:flex justify-center items-center gap-5 lg:gap-8 mt-4 pt-3 border-t border-gray-200/60 text-xs tracking-[0.15em] uppercase text-gray-700 font-medium">

          <Link
            to="/"
            className="hover:text-black transition-colors"
          >
            Home
          </Link>

          <Link
            to="/shop"
            className="hover:text-black transition-colors"
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
            className="text-black font-semibold border-b border-black pb-0.5"
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
          MOBILE MENU OVERLAY
      ====================================================== */}

      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() =>
            setMobileMenuOpen(false)
          }
        />
      )}

      {/* =====================================================
          MOBILE MENU
      ====================================================== */}

      <aside
        className={`md:hidden fixed left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-[#FAF8F5] z-50 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >

        <div className="flex items-center justify-between p-5 border-b border-gray-200">

          <div>
            <h2 className="font-serif text-lg tracking-[0.2em] font-bold">
              WEFTIN
            </h2>

            <span className="text-[8px] uppercase tracking-[0.25em] text-gray-500">
              Atelier
            </span>
          </div>

          <button
            onClick={() =>
              setMobileMenuOpen(false)
            }
          >
            <X className="w-6 h-6" />
          </button>

        </div>

        {/* USER */}

        <div className="p-5 border-b border-gray-200 flex items-center gap-3">

          {userAvatar ? (
            <img
              src={userAvatar}
              alt={userName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <span className="w-10 h-10 rounded-full bg-amber-700 text-white flex items-center justify-center font-semibold">
              {userInitial}
            </span>
          )}

          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">
              {userName}
            </p>

            <p className="text-[10px] text-gray-500 truncate">
              {currentUser?.email || "Atelier Member"}
            </p>
          </div>

        </div>

        <nav className="p-4 space-y-1">

          <Link
            to="/"
            onClick={() =>
              setMobileMenuOpen(false)
            }
            className="block px-4 py-3 text-xs uppercase tracking-widest hover:bg-gray-100"
          >
            Home
          </Link>

          <Link
            to="/shop"
            onClick={() =>
              setMobileMenuOpen(false)
            }
            className="block px-4 py-3 text-xs uppercase tracking-widest hover:bg-gray-100"
          >
            Shop
          </Link>

          <a
            href="#"
            onClick={() =>
              setMobileMenuOpen(false)
            }
            className="block px-4 py-3 text-xs uppercase tracking-widest hover:bg-gray-100"
          >
            Collections
          </a>

          <a
            href="/custom-designs"
            onClick={() =>
              setMobileMenuOpen(false)
            }
            className="block px-4 py-3 text-xs uppercase tracking-widest hover:bg-gray-100"
          >
            Custom Design
          </a>

          <Link
            to="/lookbook"
            onClick={() =>
              setMobileMenuOpen(false)
            }
            className="block px-4 py-3 bg-black text-white text-xs uppercase tracking-widest"
          >
            Lookbook
          </Link>

          <Link
            to="/limited"
            onClick={() =>
              setMobileMenuOpen(false)
            }
            className="block px-4 py-3 text-xs uppercase tracking-widest hover:bg-gray-100"
          >
            Limited Edition
          </Link>

          <div className="border-t border-gray-200 my-3" />

          <Link
            to="/notifications"
            onClick={() =>
              setMobileMenuOpen(false)
            }
            className="flex items-center justify-between px-4 py-3 text-xs uppercase tracking-widest hover:bg-gray-100"
          >
            <span>Notifications</span>

            {unreadCount > 0 && (
              <span className="bg-amber-700 text-white text-[9px] min-w-5 h-5 px-1 rounded-full flex items-center justify-center">
                {unreadCount > 99
                  ? "99+"
                  : unreadCount}
              </span>
            )}
          </Link>

          <Link
            to="/profile"
            onClick={() =>
              setMobileMenuOpen(false)
            }
            className="block px-4 py-3 text-xs uppercase tracking-widest hover:bg-gray-100"
          >
            Profile
          </Link>

          <Link
            to="/cart"
            onClick={() =>
              setMobileMenuOpen(false)
            }
            className="flex items-center justify-between px-4 py-3 text-xs uppercase tracking-widest hover:bg-gray-100"
          >
            <span>Shopping Bag</span>

            {cartCount > 0 && (
              <span className="bg-amber-700 text-white text-[9px] min-w-5 h-5 px-1 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

        </nav>

      </aside>

      {/* =====================================================
          HERO SECTION
      ====================================================== */}

      {hero && (
        <section className="relative h-[55vh] sm:h-[60vh] flex items-center justify-center px-4 sm:px-6 overflow-hidden bg-gray-900 text-white">

          <div className="absolute inset-0">

            {hero.image_url && (
              <img
                src={hero.image_url}
                alt={hero.title || "Lookbook Hero"}
                className="w-full h-full object-cover opacity-60"
              />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

          </div>

          <div className="relative z-10 text-center max-w-2xl mx-auto">

            {hero.eyebrow && (
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-amber-300 font-semibold mb-3 block">
                {hero.eyebrow}
              </span>
            )}

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-light mb-4">
              {hero.title}
            </h1>

            {hero.description && (
              <p className="text-gray-300 text-xs lg:text-sm font-light leading-relaxed">
                {hero.description}
              </p>
            )}

          </div>

        </section>
      )}

      {/* =====================================================
          SECTION 1
      ====================================================== */}

      {seasonal && (
        <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">

          <div className="text-center max-w-xl mx-auto mb-10 sm:mb-14">

            {seasonal.eyebrow && (
              <span className="text-xs uppercase tracking-[0.25em] text-amber-700 font-semibold block mb-2">
                {seasonal.eyebrow}
              </span>
            )}

            <h2 className="text-3xl font-serif font-light text-gray-900">
              {seasonal.title}
            </h2>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {(seasonal.items || []).map(
              (trend) => (
                <div
                  key={trend.id}
                  className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col group"
                >

                  <div className="relative h-72 sm:h-80 overflow-hidden bg-gray-100">

                    {trend.image_url && (
                      <img
                        src={trend.image_url}
                        alt={trend.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    )}

                  </div>

                  <div className="p-6 flex flex-col flex-grow justify-between">

                    <div>

                      <h3 className="font-serif text-lg font-medium text-gray-900 mb-2">
                        {trend.title}
                      </h3>

                      {trend.description && (
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {trend.description}
                        </p>
                      )}

                    </div>

                    <button
                      onClick={() =>
                        showToast(
                          trend.button_text
                            ? `Opening ${trend.title}`
                            : `Exploring ${trend.title}`
                        )
                      }
                      className="mt-6 text-xs uppercase tracking-widest font-semibold text-amber-700 hover:text-black flex items-center gap-1 cursor-pointer"
                    >
                      {trend.button_text || "Explore Trend"} →
                    </button>

                  </div>

                </div>
              )
            )}

          </div>

        </section>
      )}

      {/* =====================================================
          SECTION 2
      ====================================================== */}

      {guides && (
        <section className="py-16 sm:py-20 bg-[#F3EDE2]/40 px-4 sm:px-6 lg:px-12 border-t border-b border-gray-200">

          <div className="max-w-7xl mx-auto">

            <div className="text-center max-w-xl mx-auto mb-10 sm:mb-14">

              {guides.eyebrow && (
                <span className="text-xs uppercase tracking-[0.25em] text-amber-700 font-semibold block mb-2">
                  {guides.eyebrow}
                </span>
              )}

              <h2 className="text-3xl font-serif font-light text-gray-900">
                {guides.title}
              </h2>

            </div>

            <div className="space-y-12">

              {(guides.items || []).map(
                (guide) => (
                  <div
                    key={guide.id}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-white p-5 sm:p-8 rounded-2xl shadow-sm border border-gray-200"
                  >

                    <div className="relative h-64 sm:h-80 rounded-xl overflow-hidden">

                      {guide.image_url && (
                        <img
                          src={guide.image_url}
                          alt={guide.title}
                          className="w-full h-full object-cover"
                        />
                      )}

                    </div>

                    <div>

                      {guide.button_text && (
                        <span className="text-[10px] uppercase tracking-widest text-amber-700 font-semibold block mb-2">
                          EDITORIAL STYLING GUIDE
                        </span>
                      )}

                      <h3 className="font-serif text-2xl text-gray-900 mb-3">
                        {guide.title}
                      </h3>

                      {guide.description && (
                        <p className="text-xs text-gray-600 leading-relaxed mb-6">
                          {guide.description}
                        </p>
                      )}

                      {guide.button_text && (
                        <button
                          onClick={() =>
                            showToast(
                              "Opening styling guide..."
                            )
                          }
                          className="bg-black text-white px-6 py-3 text-xs uppercase tracking-widest rounded cursor-pointer"
                        >
                          {guide.button_text}
                        </button>
                      )}

                    </div>

                  </div>
                )
              )}

            </div>

          </div>

        </section>
      )}

      {/* =====================================================
          SECTION 3
      ====================================================== */}

      {moodboard && (
        <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">

          <div className="text-center max-w-xl mx-auto mb-10 sm:mb-14">

            {moodboard.eyebrow && (
              <span className="text-xs uppercase tracking-[0.25em] text-amber-700 font-semibold block mb-2">
                {moodboard.eyebrow}
              </span>
            )}

            <h2 className="text-3xl font-serif font-light text-gray-900">
              {moodboard.title}
            </h2>

          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">

            {(moodboard.items || []).map(
              (item) => (
                <div
                  key={item.id}
                  className="relative h-56 sm:h-72 rounded-xl overflow-hidden group cursor-pointer"
                  onClick={() =>
                    showToast(
                      item.button_text ||
                        "Viewing inspiration moodboard..."
                    )
                  }
                >

                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.title || "Inspiration"}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  )}

                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs uppercase tracking-widest font-semibold">
                    {item.button_text || "View Canvas"}
                  </div>

                </div>
              )
            )}

          </div>

        </section>
      )}

      {/* =====================================================
          SECTION 4
      ====================================================== */}

      {styledLooks && (
        <section className="py-16 sm:py-20 bg-[#1C1816] text-white px-4 sm:px-6 lg:px-12">

          <div className="max-w-7xl mx-auto">

            <div className="text-center max-w-xl mx-auto mb-10 sm:mb-14">

              {styledLooks.eyebrow && (
                <span className="text-xs uppercase tracking-[0.25em] text-amber-400 font-semibold block mb-2">
                  {styledLooks.eyebrow}
                </span>
              )}

              <h2 className="text-3xl font-serif font-light mb-3">
                {styledLooks.title}
              </h2>

              {styledLooks.description && (
                <p className="text-gray-400 text-xs">
                  {styledLooks.description}
                </p>
              )}

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

              {(styledLooks.items || []).map(
                (look) => (
                  <div
                    key={look.id}
                    className="bg-[#24201D] rounded-xl overflow-hidden border border-white/10 flex flex-col"
                  >

                    <div className="relative h-80 sm:h-96 overflow-hidden">

                      {look.image_url && (
                        <img
                          src={look.image_url}
                          alt={look.title}
                          className="w-full h-full object-cover"
                        />
                      )}

                    </div>

                    <div className="p-6 flex flex-col flex-grow justify-between">

                      <div>

                        <h3 className="font-serif text-xl mb-1">
                          {look.title}
                        </h3>

                        {look.price && (
                          <p className="text-sm font-bold text-amber-300">
                            {look.price}
                          </p>
                        )}

                      </div>

                      {look.button_text && (
                        <button
                          onClick={() =>
                            addLookToCart(look)
                          }
                          className="mt-6 w-full py-3 bg-amber-600 hover:bg-amber-500 text-white text-xs uppercase tracking-[0.2em] rounded font-semibold cursor-pointer transition-colors"
                        >
                          {look.button_text}
                        </button>
                      )}

                    </div>

                  </div>
                )
              )}

            </div>

          </div>

        </section>
      )}

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="bg-[#F3EDE2] text-gray-800 pt-16 pb-12 px-6 lg:px-12 border-t border-gray-300">

        <div className="max-w-7xl mx-auto text-center text-xs text-gray-500">

          <p>
            © 2026 WEFTIN Atelier. Lookbook Page Connected with Router.
          </p>

        </div>

      </footer>

    </div>
  );
}
