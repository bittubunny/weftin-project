import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
  X
} from "lucide-react";

const API_BASE_URL = "http://127.0.0.1:8000";

export default function Limitededition_Page() {

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

    try {

      const response = await fetch(
        `${API_BASE_URL}/api/user/${encodeURIComponent(
          email
        )}`
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

    try {

      const response = await fetch(
        `${API_BASE_URL}/api/notifications/unread-count/${encodeURIComponent(
          email
        )}`
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
    "Account";

  const userInitial =
    userName
      .charAt(0)
      .toUpperCase();

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
          HEADER
      ====================================================== */}

      <header className="sticky top-0 z-40 bg-[#110E0D]/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 lg:px-12 py-4">

        <div className="max-w-7xl mx-auto flex items-center justify-between">

          {/* SEARCH */}

          <div className="hidden lg:flex items-center bg-white/5 rounded-full px-4 py-2 w-64 border border-white/10">

            <Search className="w-4 h-4 text-gray-400 mr-2" />

            <input
              type="text"
              placeholder="Search limited vault..."
              className="bg-transparent text-xs text-white focus:outline-none w-full"
            />

          </div>

          {/* LOGO */}

          <div className="text-center">

            <h1 className="font-serif text-xl sm:text-2xl tracking-[0.25em] font-bold text-white">
              AURA
            </h1>

            <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.3em] text-amber-400">
              Atelier Vault
            </span>

          </div>

          {/* DESKTOP ICONS */}

          <div className="hidden md:flex items-center gap-5 lg:gap-6">

            {/* WISHLIST */}

            <button
              onClick={() => {
                setWishlistCount(
                  (c) => c + 1
                );

                showToast(
                  "Added to Wishlist"
                );
              }}
              className="relative text-gray-300 hover:text-white"
              title="Wishlist"
            >

              <Heart className="w-5 h-5" />

              {wishlistCount > 0 && (

                <span className="absolute -top-1 -right-2 bg-amber-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">

                  {wishlistCount}

                </span>

              )}

            </button>

            {/* NOTIFICATIONS */}

            <Link
              to="/notifications"
              className="relative text-gray-300 hover:text-white"
              title="Notifications"
            >

              <Bell className="w-5 h-5" />

              {unreadCount > 0 && (

                <span className="absolute -top-1 -right-2 bg-amber-600 text-white text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center">

                  {unreadCount > 99
                    ? "99+"
                    : unreadCount}

                </span>

              )}

            </Link>

            {/* PROFILE */}

            <Link
              to="/profile"
              title="View Account Profile"
              className="text-gray-300 hover:text-white"
            >

              {userAvatar ? (

                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-7 h-7 rounded-full object-cover border border-white/20"
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
              className="relative text-gray-300 hover:text-white"
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

          {/* MOBILE */}

          <div className="md:hidden flex items-center gap-3">

            <Link
              to="/notifications"
              className="relative text-gray-300"
            >

              <Bell className="w-5 h-5" />

              {unreadCount > 0 && (

                <span className="absolute -top-1 -right-2 bg-amber-600 text-white text-[9px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center">

                  {unreadCount > 99
                    ? "99+"
                    : unreadCount}

                </span>

              )}

            </Link>

            <Link
              to="/cart"
              className="relative text-gray-300"
            >

              <ShoppingBag className="w-5 h-5" />

              {cartCount > 0 && (

                <span className="absolute -top-1 -right-2 bg-amber-700 text-white text-[9px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center">

                  {cartCount}

                </span>

              )}

            </Link>

            <Link to="/profile">

              {userAvatar ? (

                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-7 h-7 rounded-full object-cover"
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
              className="text-gray-300"
            >

              <Menu className="w-6 h-6" />

            </button>

          </div>

        </div>

        {/* DESKTOP NAV */}

        <nav className="hidden md:flex justify-center items-center gap-5 lg:gap-8 mt-4 pt-3 border-t border-white/10 text-xs tracking-[0.15em] uppercase text-gray-300 font-medium">

          <Link
            to="/"
            className="hover:text-amber-400"
          >
            Home
          </Link>

          <Link
            to="/shop"
            className="hover:text-amber-400"
          >
            Shop
          </Link>

          <a
            href="#"
            className="hover:text-amber-400"
          >
            Collections
          </a>

          <a
            href="#"
            className="hover:text-amber-400"
          >
            Custom Design
          </a>

          <Link
            to="/lookbook"
            className="hover:text-amber-400"
          >
            Lookbook
          </Link>

          <Link
            to="/limited"
            className="text-amber-400 font-semibold border-b border-amber-400 pb-0.5"
          >
            Limited Edition
          </Link>

        </nav>

      </header>

      {/* =====================================================
          MOBILE OVERLAY
      ====================================================== */}

      {mobileMenuOpen && (

        <div
          className="md:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() =>
            setMobileMenuOpen(false)
          }
        />

      )}

      {/* =====================================================
          MOBILE MENU
      ====================================================== */}

      <aside
        className={`md:hidden fixed left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-[#171311] z-50 shadow-2xl transform transition-transform duration-300 ${
          mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >

        <div className="flex items-center justify-between p-5 border-b border-white/10">

          <div>

            <h2 className="font-serif text-lg tracking-[0.2em] font-bold">
              AURA
            </h2>

            <span className="text-[8px] uppercase tracking-[0.25em] text-amber-400">
              Atelier Vault
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

        <div className="p-5 border-b border-white/10 flex items-center gap-3">

          {userAvatar ? (

            <img
              src={userAvatar}
              alt={userName}
              className="w-10 h-10 rounded-full object-cover"
            />

          ) : (

            <span className="w-10 h-10 rounded-full bg-amber-700 flex items-center justify-center font-semibold">
              {userInitial}
            </span>

          )}

          <div className="min-w-0">

            <p className="text-sm font-semibold truncate">
              {userName}
            </p>

            <p className="text-[10px] text-gray-400 truncate">
              {currentUser?.email ||
                "Atelier Member"}
            </p>

          </div>

        </div>

        <nav className="p-4 space-y-1">

          <MobileLink
            to="/"
            label="Home"
            close={() =>
              setMobileMenuOpen(false)
            }
          />

          <MobileLink
            to="/shop"
            label="Shop"
            close={() =>
              setMobileMenuOpen(false)
            }
          />

          <a
            href="#"
            onClick={() =>
              setMobileMenuOpen(false)
            }
            className="block px-4 py-3 text-xs uppercase tracking-widest hover:bg-white/5"
          >
            Collections
          </a>

          <a
            href="#"
            onClick={() =>
              setMobileMenuOpen(false)
            }
            className="block px-4 py-3 text-xs uppercase tracking-widest hover:bg-white/5"
          >
            Custom Design
          </a>

          <MobileLink
            to="/lookbook"
            label="Lookbook"
            close={() =>
              setMobileMenuOpen(false)
            }
          />

          <Link
            to="/limited"
            onClick={() =>
              setMobileMenuOpen(false)
            }
            className="block px-4 py-3 bg-amber-700 text-white text-xs uppercase tracking-widest"
          >
            Limited Edition
          </Link>

          <div className="border-t border-white/10 my-3" />

          <Link
            to="/notifications"
            onClick={() =>
              setMobileMenuOpen(false)
            }
            className="flex items-center justify-between px-4 py-3 text-xs uppercase tracking-widest hover:bg-white/5"
          >

            <span>
              Notifications
            </span>

            {unreadCount > 0 && (

              <span className="bg-amber-700 text-white text-[9px] min-w-5 h-5 px-1 rounded-full flex items-center justify-center">

                {unreadCount > 99
                  ? "99+"
                  : unreadCount}

              </span>

            )}

          </Link>

          <MobileLink
            to="/profile"
            label="Profile"
            close={() =>
              setMobileMenuOpen(false)
            }
          />

          <Link
            to="/cart"
            onClick={() =>
              setMobileMenuOpen(false)
            }
            className="flex items-center justify-between px-4 py-3 text-xs uppercase tracking-widest hover:bg-white/5"
          >

            <span>
              Shopping Bag
            </span>

            {cartCount > 0 && (

              <span className="bg-amber-700 text-white text-[9px] min-w-5 h-5 px-1 rounded-full flex items-center justify-center">

                {cartCount}

              </span>

            )}

          </Link>

        </nav>

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
                  className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white px-8 py-4 rounded text-xs uppercase tracking-[0.2em] font-semibold shadow-lg"
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
                        className="mt-6 w-full py-3 bg-white/10 hover:bg-white/20 text-white text-xs uppercase tracking-widest rounded border border-white/20"
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
            © 2026 Aura Atelier. Limited Edition Vault Connected Successfully.
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


// =========================================================
// MOBILE LINK
// =========================================================

function MobileLink({
  to,
  label,
  close
}) {

  return (

    <Link
      to={to}
      onClick={close}
      className="block px-4 py-3 text-xs uppercase tracking-widest hover:bg-white/5"
    >
      {label}
    </Link>

  );

}