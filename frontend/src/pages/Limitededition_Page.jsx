import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Clock,
  ShieldCheck,
  Sparkles,
  Bell,
  Menu,
  X,
  LayoutDashboard,
  Package,
  Scissors,
  Ruler,
  MapPin,
  Headphones,
  LogOut,
  ChevronRight,
  Settings
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://weftin-project.onrender.com";

export default function Limitededition_Page() {
  const navigate = useNavigate();

  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [toastMessage, setToastMessage] = useState("");

  const [sections, setSections] = useState([]);
  const [settings, setSettings] = useState({
    days: 0,
    hours: 0,
    minutes: 0
  });

  const [loading, setLoading] = useState(true);

  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

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
  // LOAD EVERYTHING
  // =========================================================

  useEffect(() => {

    loadLimitedEdition();
    loadCartCount();

    try {

      const savedUser =
        localStorage.getItem("weftin_user");

      if (savedUser) {

        const user =
          JSON.parse(savedUser);

        setCurrentUser(user);

        if (user.avatar) {
          setUserAvatar(user.avatar);
        }

        if (user.email) {

          loadUserData(user.email);

          loadUnreadNotifications(
            user.email
          );

        }

      }

    } catch (error) {

      console.error(
        "USER LOAD ERROR:",
        error
      );

    }

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
  // LOAD LIMITED EDITION
  // =========================================================

  const loadLimitedEdition = async () => {

    try {

      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/limited-edition`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load Limited Edition"
        );
      }

      const data =
        await response.json();

      setSections(
        data.sections || []
      );

      if (data.settings) {
        setSettings(data.settings);
      }

    } catch (error) {

      console.error(
        "LIMITED EDITION LOAD ERROR:",
        error
      );

      showToast(
        "Unable to load Limited Edition"
      );

    } finally {

      setLoading(false);

    }

  };

  // =========================================================
  // GET SECTION
  // =========================================================

  const getSection = (key) => {

    return sections.find(
      (section) =>
        section.section_key === key
    );

  };

  // =========================================================
  // USER DATA
  // =========================================================

  const loadUserData = async (email) => {
    const token = localStorage.getItem("weftin_token");

    try {

      const response = await fetch(
        `${API_BASE_URL}/api/user/${encodeURIComponent(
          email
        )}`,
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        }
      );

      if (!response.ok) return;

      const data =
        await response.json();

      if (data.avatar) {
        setUserAvatar(data.avatar);
      }

    } catch (error) {

      console.error(
        "USER DATA ERROR:",
        error
      );

    }

  };

  // =========================================================
  // NOTIFICATIONS
  // =========================================================

  const loadUnreadNotifications = async (
    email
  ) => {
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

      const data =
        await response.json();

      setUnreadCount(
        Number(data.count || 0)
      );

    } catch (error) {

      console.error(
        "NOTIFICATION COUNT ERROR:",
        error
      );

    }

  };

  // =========================================================
  // CART COUNT
  // =========================================================

  const loadCartCount = () => {

    try {

      const cart =
        JSON.parse(
          localStorage.getItem(
            "weftin_cart"
          )
        ) || [];

      const total =
        cart.reduce(
          (sum, item) =>
            sum +
            Number(item.qty || 1),
          0
        );

      setCartCount(total);

    } catch (error) {

      console.error(
        "CART COUNT ERROR:",
        error
      );

    }

  };

  // =========================================================
  // ADD ITEM TO CART
  // =========================================================

  const addToCart = (item) => {

    try {

      const cart =
        JSON.parse(
          localStorage.getItem(
            "weftin_cart"
          )
        ) || [];

      const existingIndex =
        cart.findIndex(
          (cartItem) =>
            String(
              cartItem.product_id
            ) ===
            String(
              item.product_id
            ) &&
            item.product_id
        );

      if (
        existingIndex !== -1
      ) {

        cart[
          existingIndex
        ].qty =
          Number(
            cart[
              existingIndex
            ].qty || 1
          ) + 1;

      } else {

        cart.push({
          id:
            item.product_id ||
            `limited-${item.id}`,

          product_id:
            item.product_id ||
            item.id,

          name:
            item.title,

          category:
            "Limited Edition",

          image:
            item.image_url,

          price:
            Number(
              String(
                item.price || ""
              ).replace(
                /[₹,]/g,
                ""
              )
            ) || 0,

          size: "",

          color: "",

          shade: "",

          qty: 1,

          tag: "Limited Edition"
        });

      }

      localStorage.setItem(
        "weftin_cart",
        JSON.stringify(cart)
      );

      loadCartCount();

      showToast(
        `${item.title} added to Bag!`
      );

    } catch (error) {

      console.error(
        "LIMITED CART ERROR:",
        error
      );

      showToast(
        "Unable to add item to Bag"
      );

    }

  };

  // =========================================================
  // USER
  // =========================================================

  const userName =
    currentUser?.name ||
    currentUser?.full_name ||
    currentUser?.username ||
    "WEFTIN Member";

  const userInitial =
    userName
      .charAt(0)
      .toUpperCase() || "W";

  const handleLogout = () => {
    localStorage.removeItem("weftin_user");
    localStorage.removeItem("weftin_token");
    setMobileMenuOpen(false);
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchText.trim();
    if (!query) {
      navigate("/shop");
      return;
    }
    navigate(`/shop?search=${encodeURIComponent(query)}`);
  };

  const NotificationBadge = () => {
    if (unreadCount <= 0) return null;
    return (
      <span className="absolute -top-1 -right-2 bg-rose-700 text-white text-[8px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center font-bold">
        {unreadCount > 9 ? "9+" : unreadCount}
      </span>
    );
  };

  const UserAvatar = ({ size = "w-8 h-8" }) => {
    if (userAvatar) {
      return <img src={userAvatar} alt={userName} className={`${size} rounded-full object-cover border border-amber-600 shadow-xs`} />;
    }
    return (
      <div className={`${size} rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-serif font-bold border border-amber-300 text-xs`}>
        {userInitial}
      </div>
    );
  };

  // =========================================================
  // ICON
  // =========================================================

  const GuaranteeIcon = ({
    iconName
  }) => {

    if (iconName === "Sparkles") {
      return (
        <Sparkles className="w-8 h-8 text-amber-400 mx-auto mb-4" />
      );
    }

    if (iconName === "Clock") {
      return (
        <Clock className="w-8 h-8 text-amber-400 mx-auto mb-4" />
      );
    }

    return (
      <ShieldCheck className="w-8 h-8 text-amber-400 mx-auto mb-4" />
    );

  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (
      <div className="min-h-screen bg-[#110E0D] text-white flex items-center justify-center">

        <div className="text-center">

          <div className="w-8 h-8 border-2 border-white/20 border-t-amber-400 rounded-full animate-spin mx-auto mb-4" />

          <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
            Opening Atelier Vault
          </p>

        </div>

      </div>
    );

  }

  const hero =
    getSection("hero");

  const quote =
    getSection("quote");

  const featured =
    getSection("featured");

  const secondaryVaults =
    getSection(
      "secondary_vaults"
    );

  const guarantees =
    getSection(
      "guarantees"
    );

  const featuredItem =
    featured?.items?.[0];

  // =========================================================
  // PAGE
  // =========================================================

  return (

    <div className="min-h-screen bg-[#110E0D] text-white font-sans relative">

      {/* =====================================================
          TOAST
      ====================================================== */}

      {toastMessage && (

        <div className="fixed bottom-6 right-6 z-[100] bg-gray-900 text-white px-6 py-3 rounded-lg shadow-2xl text-sm flex items-center gap-3 border border-amber-500/30">

          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />

          {toastMessage}

        </div>

      )}

      {/* =====================================================
          ANNOUNCEMENT
      ====================================================== */}

      <div className="bg-[#1C1816] text-[#E5D5BC] text-[9px] sm:text-xs py-2 px-3 text-center tracking-[0.15em] sm:tracking-[0.2em] uppercase font-medium border-b border-white/5">

        LIMITED DROP VAULT — EXCLUSIVE HANDLOOM MASTERPIECES

      </div>

      {/* =====================================================
          UNIFIED NAVIGATION HEADER
      ====================================================== */}

      <header className="sticky top-0 z-40 bg-[#110E0D]/90 backdrop-blur-md border-b border-white/10 px-6 lg:px-12 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <form onSubmit={handleSearch} className="hidden lg:flex items-center bg-white/5 rounded-full px-4 py-2 w-64 border border-white/10">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input 
              type="text" 
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search limited vault..." 
              className="bg-transparent text-xs text-white focus:outline-none w-full" 
            />
          </form>

          <div className="text-center">
            <Link to="/">
              <h1 className="font-serif text-2xl tracking-[0.25em] font-bold text-white">WEFTIN</h1>
            </Link>
            <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.3em] text-amber-400 block">
              Atelier Vault
            </span>
          </div>

          <div className="flex items-center gap-5 lg:gap-6">
            <span className="text-xs font-medium text-gray-300 cursor-pointer hidden sm:inline">INR &or;</span>
            
            <button
              onClick={() => {
                setWishlistCount((c) => c + 1);
                showToast("Added to Wishlist");
              }}
              className="text-gray-300 hover:text-white cursor-pointer"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
            </button>
            
            <Link to="/notifications" className="relative text-gray-300 hover:text-white">
              <Bell className="w-5 h-5" />
              <NotificationBadge />
            </Link>

            <Link to="/profile" className="flex items-center gap-2 text-gray-300 hover:text-white">
              <UserAvatar size="w-7 h-7" />
              <span className="text-xs font-semibold hidden sm:inline max-w-28 truncate">{userName}</span>
            </Link>

            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1 text-gray-300 hover:text-white cursor-pointer flex items-center gap-1.5 border-l pl-4 border-white/10"
              aria-label="Open navigation drawer"
            >
              <Menu className="w-5 h-5" />
              <span className="text-[10px] uppercase tracking-wider font-semibold hidden lg:inline">Menu</span>
            </button>

            <Link to="/cart" className="relative text-gray-300 hover:text-white">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-amber-700 text-white text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center font-bold">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Sub Nav Links */}
        <nav className="hidden md:flex justify-center items-center gap-6 lg:gap-8 mt-4 pt-3 border-t border-white/10 text-[10px] lg:text-xs tracking-[0.15em] uppercase text-gray-300 font-medium">
          <Link to="/" className="hover:text-amber-400 transition-colors">Home</Link>
          <Link to="/shop" className="hover:text-amber-400 transition-colors">Shop</Link>
          <Link to="/collections" className="hover:text-amber-400 transition-colors">Collections</Link>
          <Link to="/custom-designs" className="hover:text-amber-400 transition-colors">Custom Design</Link>
          <Link to="/lookbook" className="hover:text-amber-400 transition-colors">Lookbook</Link>
          <Link to="/limited" className="text-amber-400 font-semibold border-b border-amber-400 pb-0.5">Limited Edition</Link>
        </nav>
      </header>

      {/* =====================================================
          SLIDING NAVIGATION DRAWER
      ====================================================== */}

      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity" onClick={() => setMobileMenuOpen(false)} />
      )}

      <aside className={`fixed left-0 top-0 bottom-0 w-80 max-w-[90vw] bg-[#171311] text-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col justify-between ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div>
          <div className="p-5 border-b border-white/10 flex items-center justify-between bg-black/20">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3">
              <div className="bg-black text-[#E5D5BC] w-9 h-9 rounded-lg flex items-center justify-center font-serif font-bold text-base shadow-sm border border-white/10">W</div>
              <div>
                <h2 className="font-serif text-sm tracking-[0.2em] font-bold text-white">WEFTIN</h2>
                <span className="text-[9px] uppercase tracking-[0.2em] text-amber-400 block font-medium">ATELIER VAULT</span>
              </div>
            </Link>
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/5 transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div onClick={() => { setMobileMenuOpen(false); navigate("/profile"); }} className="px-6 py-4 border-b border-white/10 flex items-center gap-3 bg-amber-950/20 cursor-pointer hover:bg-amber-950/40 transition-colors">
            <UserAvatar size="w-10 h-10" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{userName}</p>
              <p className="text-[10px] text-gray-400 truncate">{currentUser?.email || "Member Account"}</p>
            </div>
          </div>

          <nav className="p-4 space-y-1 text-xs font-medium text-gray-300 overflow-y-auto max-h-[calc(100vh-250px)]">
            <div className="px-3 py-2 text-[10px] uppercase tracking-widest text-amber-400 font-bold">Main Pages</div>
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/5 hover:text-white transition-colors group">
              <span className="flex items-center gap-3"><LayoutDashboard className="w-4 h-4 text-amber-400" />Home</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/shop" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/5 hover:text-white transition-colors group">
              <span className="flex items-center gap-3"><ShoppingBag className="w-4 h-4 text-amber-400" />Shop Catalog</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/collections" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/5 hover:text-white transition-colors group">
              <span className="flex items-center gap-3"><Package className="w-4 h-4 text-amber-400" />Collections</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/custom-designs" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/5 hover:text-white transition-colors group">
              <span className="flex items-center gap-3"><Scissors className="w-4 h-4 text-amber-400" />Custom Designs & Workspace</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/lookbook" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/5 hover:text-white transition-colors group">
              <span className="flex items-center gap-3"><Heart className="w-4 h-4 text-amber-400" />Lookbook Journal</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/limited" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-amber-600 text-white font-semibold group">
              <span className="flex items-center gap-3"><span className="w-4 h-4 flex items-center justify-center text-sm">★</span>Limited Edition Drop</span>
              <ChevronRight className="w-3.5 h-3.5 text-white" />
            </Link>

            <div className="pt-3 pb-1 px-3 text-[10px] uppercase tracking-widest text-amber-400 font-bold border-t border-white/10 mt-2">Member Portal & Profile</div>
            <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/5 hover:text-white transition-colors group">
              <span className="flex items-center gap-3"><LayoutDashboard className="w-4 h-4 text-gray-400" />Dashboard Overview</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/orders" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/5 hover:text-white transition-colors group">
              <span className="flex items-center gap-3"><Package className="w-4 h-4 text-gray-400" />My Orders & History</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/measurements" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/5 hover:text-white transition-colors group">
              <span className="flex items-center gap-3"><Ruler className="w-4 h-4 text-gray-400" />Bespoke Fit Measurements</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/5 hover:text-white transition-colors group">
              <span className="flex items-center gap-3"><Heart className="w-4 h-4 text-gray-400" />Saved Wishlist</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/addresses" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/5 hover:text-white transition-colors group">
              <span className="flex items-center gap-3"><MapPin className="w-4 h-4 text-gray-400" />Delivery Addresses</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/5 hover:text-white transition-colors group">
              <span className="flex items-center gap-3"><User className="w-4 h-4 text-gray-400" />Member Profile</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/notifications" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/5 hover:text-white transition-colors group">
              <span className="flex items-center gap-3"><Bell className="w-4 h-4 text-gray-400" />Notifications</span>
              {unreadCount > 0 && <span className="bg-rose-700 text-white text-[9px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center font-bold">{unreadCount}</span>}
            </Link>
            <Link to="/support" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/5 hover:text-white transition-colors group">
              <span className="flex items-center gap-3"><Headphones className="w-4 h-4 text-gray-400" />Concierge Support</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <div className="pt-3 pb-1 px-3 text-[10px] uppercase tracking-widest text-amber-400 font-bold border-t border-white/10 mt-2">Administration</div>
            <Link to="/admin/home-cms" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-black text-white border border-white/10 transition-colors">
              <span className="flex items-center gap-3 font-semibold text-amber-300"><Settings className="w-4 h-4" />Admin Product CMS</span>
              <ChevronRight className="w-3.5 h-3.5 text-amber-300" />
            </Link>
          </nav>
        </div>

        <div className="p-4 border-t border-white/10 bg-black/20">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs text-rose-400 font-semibold hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer border border-rose-900/50 bg-black/40 shadow-2xs">
            <LogOut className="w-4 h-4" /> Log out of account
          </button>
        </div>
      </aside>

      {/* =====================================================
          HERO
      ====================================================== */}

      {hero && (

        <section className="relative py-16 sm:py-24 px-4 sm:px-6 text-center overflow-hidden bg-gradient-to-b from-[#1C1816] to-[#110E0D]">

          <div className="max-w-3xl mx-auto">

            {hero.eyebrow && (

              <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-amber-400 font-semibold mb-3 block">
                {hero.eyebrow}
              </span>

            )}

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-serif font-light mb-6 tracking-wide">
              {hero.title}
            </h1>

            {hero.description && (

              <p className="text-gray-300 text-xs lg:text-sm font-light mb-8 max-w-xl mx-auto leading-relaxed">
                {hero.description}
              </p>

            )}

            {/* COUNTDOWN */}

            <div className="inline-flex items-center gap-3 sm:gap-6 bg-[#24201D] border border-amber-500/30 px-5 sm:px-8 py-4 rounded-xl shadow-2xl">

              <CountdownValue
                value={settings.days}
                label="Days"
              />

              <span className="text-amber-400 text-xl font-bold">
                :
              </span>

              <CountdownValue
                value={settings.hours}
                label="Hours"
              />

              <span className="text-amber-400 text-xl font-bold">
                :
              </span>

              <CountdownValue
                value={settings.minutes}
                label="Mins"
              />

            </div>

          </div>

        </section>

      )}

      {/* =====================================================
          QUOTE
      ====================================================== */}

      {quote && (

        <section className="py-12 px-4 text-center border-t border-b border-white/5 bg-[#171311]">

          <p className="font-serif italic text-amber-200/80 text-sm tracking-wider">

            "{quote.title}"

          </p>

        </section>

      )}

      {/* =====================================================
          FEATURED PREMIER DROP
      ====================================================== */}

      {featured && featuredItem && (

        <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">

          <div className="bg-[#1C1816] rounded-2xl border border-white/10 p-5 sm:p-8 lg:p-12 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center shadow-2xl">

            <div>

              {featured.eyebrow && (

                <span className="text-[10px] uppercase tracking-[0.3em] text-amber-400 font-semibold mb-2 block">
                  {featured.eyebrow}
                </span>

              )}

              <h2 className="text-3xl lg:text-4xl font-serif font-light mb-4">
                {featuredItem.title}
              </h2>

              {featuredItem.description && (

                <p className="text-gray-300 text-xs leading-relaxed mb-6">
                  {featuredItem.description}
                </p>

              )}

              <div className="flex flex-wrap items-baseline gap-4 mb-8">

                <span className="text-3xl font-bold text-amber-300">
                  {featuredItem.price}
                </span>

                <span className="text-xs text-emerald-400 font-semibold tracking-wider">
                  Complimentary Insurance Included
                </span>

              </div>

              {featuredItem.button_text && (

                <button
                  onClick={() =>
                    addToCart(
                      featuredItem
                    )
                  }
                  className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white px-8 py-4 rounded text-xs uppercase tracking-[0.2em] font-semibold shadow-lg cursor-pointer transition-colors"
                >
                  {featuredItem.button_text}
                </button>

              )}

            </div>

            <div className="relative h-[320px] sm:h-[400px] rounded-xl overflow-hidden shadow-xl border border-white/10">

              {featuredItem.image_url && (

                <img
                  src={featuredItem.image_url}
                  alt={featuredItem.title}
                  className="w-full h-full object-cover"
                />

              )}

            </div>

          </div>

        </section>

      )}

      {/* =====================================================
          SECONDARY VAULTS
      ====================================================== */}

      {secondaryVaults && (

        <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">

          <div className="text-center max-w-xl mx-auto mb-10 sm:mb-16">

            {secondaryVaults.eyebrow && (

              <span className="text-xs uppercase tracking-[0.25em] text-amber-400 font-semibold block mb-2">
                {secondaryVaults.eyebrow}
              </span>

            )}

            <h2 className="text-3xl font-serif font-light">
              {secondaryVaults.title}
            </h2>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {(secondaryVaults.items || []).map(
              (item) => (

                <div
                  key={item.id}
                  className="bg-[#1C1816] rounded-xl overflow-hidden border border-white/10 flex flex-col group"
                >

                  <div className="relative h-72 sm:h-80 overflow-hidden bg-black">

                    {item.image_url && (

                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                      />

                    )}

                  </div>

                  <div className="p-6 flex flex-col flex-grow justify-between">

                    <div>

                      <h3 className="font-serif text-base mb-1">
                        {item.title}
                      </h3>

                      {item.price && (

                        <p className="text-sm font-bold text-amber-300">
                          {item.price}
                        </p>

                      )}

                    </div>

                    {item.button_text && (

                      <button
                        onClick={() =>
                          addToCart(item)
                        }
                        className="mt-6 w-full py-3 bg-white/10 hover:bg-white/20 text-white text-xs uppercase tracking-widest rounded border border-white/20 cursor-pointer transition-colors"
                      >
                        {item.button_text}
                      </button>

                    )}

                  </div>

                </div>

              )
            )}

          </div>

        </section>

      )}

      {/* =====================================================
          GUARANTEES
      ====================================================== */}

      {guarantees && (

        <section className="py-16 sm:py-20 bg-[#171311] px-4 sm:px-6 lg:px-12 border-t border-b border-white/5">

          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">

            {(guarantees.items || []).map(
              (item) => (

                <div
                  key={item.id}
                  className="p-6"
                >

                  <GuaranteeIcon
                    iconName={
                      item.icon_name
                    }
                  />

                  <h4 className="font-serif text-lg mb-2">
                    {item.title}
                  </h4>

                  {item.description && (

                    <p className="text-xs text-gray-400">
                      {item.description}
                    </p>

                  )}

                </div>

              )
            )}

          </div>

        </section>

      )}

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="bg-[#FAF8F5] text-gray-800 pt-16 pb-12 px-6 lg:px-12 border-t border-gray-300">

        <div className="max-w-7xl mx-auto text-center text-xs text-gray-500">

          <p>
            © 2026 WEFTIN Atelier. Limited Edition Vault Connected Successfully.
          </p>

        </div>

      </footer>

    </div>

  );

}


// =========================================================
// COUNTDOWN VALUE
// =========================================================

function CountdownValue({
  value,
  label
}) {

  return (

    <div className="text-center">

      <span className="block text-xl sm:text-2xl font-serif text-amber-300 font-bold">
        {String(value || 0).padStart(2, "0")}
      </span>

      <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-400">
        {label}
      </span>

    </div>

  );

}
