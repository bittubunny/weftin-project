import React, {
  useCallback,
  useEffect,
  useState
} from "react";

import {
  Link,
  useNavigate
} from "react-router-dom";

import {
  LayoutDashboard,
  Package,
  Scissors,
  Ruler,
  Heart,
  MapPin,
  User,
  Bell,
  Headphones,
  LogOut,
  ShoppingBag,
  Trash2,
  Sparkles,
  X,
  Menu
} from "lucide-react";

const API_BASE_URL = "http://127.0.0.1:8000";

export default function Wishlist_Page() {
  const navigate = useNavigate();

  // ==================================================
  // USER
  // ==================================================

  const [currentUser, setCurrentUser] =
    useState(null);

  // ==================================================
  // WISHLIST
  // ==================================================

  const [wishlist, setWishlist] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  // ==================================================
  // NOTIFICATIONS
  // ==================================================

  const [unreadCount, setUnreadCount] =
    useState(0);

  // ==================================================
  // MOBILE MENU
  // ==================================================

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // ==================================================
  // TOAST
  // ==================================================

  const [toastMessage, setToastMessage] =
    useState("");

  const showToast = useCallback((msg) => {
    setToastMessage(msg);

    window.setTimeout(() => {
      setToastMessage("");
    }, 3000);
  }, []);

  // ==================================================
  // LOAD USER
  // ==================================================

  useEffect(() => {
    try {
      const storedUser =
        localStorage.getItem("weftin_user");

      if (!storedUser) {
        navigate("/login");
        return;
      }

      const savedUser =
        JSON.parse(storedUser);

      if (!savedUser?.email) {
        navigate("/login");
        return;
      }

      setCurrentUser(savedUser);
    } catch (error) {
      console.error(
        "Unable to read user:",
        error
      );

      navigate("/login");
    }
  }, [navigate]);

  // ==================================================
  // USER EMAIL
  // ==================================================

  const userEmail =
    currentUser?.email || "";

  // ==================================================
  // FETCH WISHLIST
  // ==================================================

  const fetchWishlist =
    useCallback(async (email) => {
      if (!email) {
        return;
      }

      try {
        setLoading(true);

        const response =
          await fetch(
            `${API_BASE_URL}/api/wishlist/${encodeURIComponent(
              email
            )}`
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.detail ||
              "Failed to load wishlist."
          );
        }

        setWishlist(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.error(
          "Error fetching wishlist:",
          error
        );

        setWishlist([]);

        showToast(
          error?.message ||
            "Unable to load wishlist."
        );
      } finally {
        setLoading(false);
      }
    }, [showToast]);

  // ==================================================
  // LOAD UNREAD NOTIFICATION COUNT
  // ==================================================

  const loadUnreadCount =
    useCallback(async () => {
      if (!userEmail) {
        setUnreadCount(0);
        return;
      }

      try {
        const response =
          await fetch(
            `${API_BASE_URL}/api/notifications/unread-count/${encodeURIComponent(
              userEmail
            )}`
          );

        if (!response.ok) {
          return;
        }

        const data =
          await response.json();

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

  // ==================================================
  // INITIAL LOAD
  // ==================================================

  useEffect(() => {
    if (!userEmail) {
      return;
    }

    fetchWishlist(userEmail);
    loadUnreadCount();
  }, [
    userEmail,
    fetchWishlist,
    loadUnreadCount
  ]);

  // ==================================================
  // REMOVE WISHLIST ITEM
  // ==================================================

  const removeItem = async (
    wishlistId
  ) => {
    try {
      const response =
        await fetch(
          `${API_BASE_URL}/api/wishlist/${wishlistId}?user_email=${encodeURIComponent(
            userEmail
          )}`,
          {
            method: "DELETE"
          }
        );

      if (!response.ok) {
        let errorMessage =
          "Failed to remove item.";

        try {
          const data =
            await response.json();

          errorMessage =
            data?.detail ||
            errorMessage;
        } catch {
          // Ignore JSON parsing error
        }

        throw new Error(
          errorMessage
        );
      }

      setWishlist((previousWishlist) =>
        previousWishlist.filter(
          (item) =>
            item.id !== wishlistId
        )
      );

      showToast(
        "Removed item from wishlist."
      );
    } catch (error) {
      console.error(
        "Remove wishlist error:",
        error
      );

      showToast(
        error?.message ||
          "Backend connection error."
      );
    }
  };

  // ==================================================
  // MOVE TO CART
  // ==================================================

  const moveToCart = (item) => {
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
            Number(
              cartItem.product_id ||
                cartItem.productId ||
                cartItem.id
            ) ===
            Number(item.product_id)
        );

      if (existingIndex !== -1) {
        cart[existingIndex] = {
          ...cart[existingIndex],
          qty:
            Number(
              cart[existingIndex].qty || 1
            ) + 1
        };
      } else {
        cart.push({
          id: item.product_id,
          product_id: item.product_id,
          name: item.name,
          price: item.price,
          qty: 1,
          image: item.image,
          category:
            item.category || "",
          tag:
            item.tag || "ATELIER"
        });
      }

      localStorage.setItem(
        "weftin_cart",
        JSON.stringify(cart)
      );

      removeItem(item.id);

      showToast(
        `${item.name} moved to Shopping Cart.`
      );
    } catch (error) {
      console.error(
        "Move to cart error:",
        error
      );

      showToast(
        "Unable to move item to cart."
      );
    }
  };

  // ==================================================
  // LOGOUT
  // ==================================================

  const handleLogout = () => {
    localStorage.removeItem(
      "weftin_user"
    );

    navigate("/login");
  };

  // ==================================================
  // USER DISPLAY HELPERS
  // ==================================================

  const userName =
    currentUser?.name ||
    currentUser?.full_name ||
    currentUser?.username ||
    "WEFTIN Member";

  const userInitial =
    userName
      .charAt(0)
      .toUpperCase();

  // ==================================================
  // MAIN
  // ==================================================

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-gray-900 font-sans flex">

      {/* ==================================================
          TOAST
      ================================================== */}

      {toastMessage && (
        <div className="fixed bottom-6 right-6 left-6 sm:left-auto z-50 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-2xl text-sm flex items-center gap-3 border border-amber-500/30 max-w-sm">

          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0"></span>

          <span className="flex-1">
            {toastMessage}
          </span>

          <button
            onClick={() =>
              setToastMessage("")
            }
            className="text-gray-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>

        </div>
      )}

      {/* ==================================================
          DESKTOP SIDEBAR
      ================================================== */}

      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between hidden md:flex sticky top-0 h-screen shrink-0">

        <div>

          {/* BRAND */}

          <div className="p-6 border-b border-gray-100 flex items-center gap-3">

            <div className="bg-black text-[#E5D5BC] w-8 h-8 rounded flex items-center justify-center font-serif font-bold">
              W
            </div>

            <div>

              <h1 className="font-serif text-sm tracking-[0.2em] font-bold text-gray-900">
                WEFTIN
              </h1>

              <span className="text-[9px] uppercase tracking-[0.2em] text-gray-400 block">
                ATELIER TAILORS
              </span>

            </div>

          </div>

          {/* NAVIGATION */}

          <nav className="p-4 space-y-1 text-xs font-medium text-gray-600">

            <Link
              to="/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>

            <Link
              to="/orders"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700"
            >
              <Package className="w-4 h-4" />
              My Orders
            </Link>

            <Link
              to="/custom-designs"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700"
            >
              <Scissors className="w-4 h-4" />
              Custom Designs
            </Link>

            <Link
              to="/measurements"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700"
            >
              <Ruler className="w-4 h-4" />
              Measurements
            </Link>

            {/* ACTIVE WISHLIST */}

            <Link
              to="/wishlist"
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-100/60 text-amber-900 font-semibold border-l-4 border-amber-700"
            >
              <Heart className="w-4 h-4" />
              Wishlist
            </Link>

            <Link
              to="/addresses"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700"
            >
              <MapPin className="w-4 h-4" />
              Addresses
            </Link>

            <Link
              to="/profile"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700"
            >
              <User className="w-4 h-4" />
              Profile
            </Link>

            {/* NOTIFICATIONS */}

            <Link
              to="/notifications"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700 justify-between"
            >

              <span className="flex items-center gap-3 min-w-0">
                <Bell className="w-4 h-4 shrink-0" />
                <span>Notifications</span>
              </span>

              {unreadCount > 0 && (
                <span className="bg-rose-700 text-white text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center font-bold shrink-0">
                  {unreadCount > 99
                    ? "99+"
                    : unreadCount}
                </span>
              )}

            </Link>

            {/* SUPPORT */}

            <Link
              to="/support"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700"
            >
              <Headphones className="w-4 h-4" />
              Support
            </Link>

          </nav>

        </div>

        {/* LOGOUT */}

        <div className="p-4 border-t border-gray-100">

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-xs text-rose-700 font-semibold hover:bg-rose-50 rounded-lg cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>

        </div>

      </aside>

      {/* ==================================================
          MOBILE OVERLAY
      ================================================== */}

      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* ==================================================
          MOBILE SLIDE-IN NAVIGATION
      ================================================== */}

      <aside
        className={`md:hidden fixed left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >

        <div className="h-full flex flex-col">

          {/* MOBILE MENU HEADER */}

          <div className="p-5 border-b border-gray-100 flex items-center justify-between">

            <Link
              to="/dashboard"
              onClick={closeMobileMenu}
              className="flex items-center gap-3"
            >

              <div className="bg-black text-[#E5D5BC] w-8 h-8 rounded flex items-center justify-center font-serif font-bold">
                W
              </div>

              <div>

                <h1 className="font-serif text-sm tracking-[0.2em] font-bold text-gray-900">
                  WEFTIN
                </h1>

                <span className="text-[8px] uppercase tracking-[0.2em] text-gray-400 block">
                  ATELIER TAILORS
                </span>

              </div>

            </Link>

            <button
              onClick={closeMobileMenu}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>

          </div>

          {/* MOBILE USER */}

          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">

            {currentUser?.avatar ? (

              <img
                src={currentUser.avatar}
                alt={userName}
                className="w-10 h-10 rounded-full object-cover border border-amber-500 shrink-0"
              />

            ) : (

              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-serif font-bold border border-amber-200 shrink-0">
                {userInitial}
              </div>

            )}

            <div className="min-w-0">

              <p className="text-xs font-semibold text-gray-900 truncate">
                {userName}
              </p>

              <p className="text-[10px] text-gray-500 truncate">
                {currentUser?.email || "WEFTIN Member"}
              </p>

            </div>

          </div>

          {/* MOBILE NAVIGATION */}

          <nav className="flex-1 overflow-y-auto p-4 space-y-1 text-xs font-medium text-gray-600">

            <Link
              to="/dashboard"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>

            <Link
              to="/orders"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700"
            >
              <Package className="w-4 h-4" />
              My Orders
            </Link>

            <Link
              to="/custom-designs"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700"
            >
              <Scissors className="w-4 h-4" />
              Custom Designs
            </Link>

            <Link
              to="/measurements"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700"
            >
              <Ruler className="w-4 h-4" />
              Measurements
            </Link>

            {/* ACTIVE WISHLIST */}

            <Link
              to="/wishlist"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-100/60 text-amber-900 font-semibold border-l-4 border-amber-700"
            >
              <Heart className="w-4 h-4" />
              Wishlist
            </Link>

            <Link
              to="/addresses"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700"
            >
              <MapPin className="w-4 h-4" />
              Addresses
            </Link>

            <Link
              to="/profile"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700"
            >
              <User className="w-4 h-4" />
              Profile
            </Link>

            {/* MOBILE NOTIFICATIONS */}

            <Link
              to="/notifications"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700 justify-between"
            >

              <span className="flex items-center gap-3 min-w-0">
                <Bell className="w-4 h-4 shrink-0" />
                <span>Notifications</span>
              </span>

              {unreadCount > 0 && (
                <span className="bg-rose-700 text-white text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center font-bold shrink-0">
                  {unreadCount > 99
                    ? "99+"
                    : unreadCount}
                </span>
              )}

            </Link>

            <Link
              to="/support"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700"
            >
              <Headphones className="w-4 h-4" />
              Support
            </Link>

          </nav>

          {/* MOBILE LOGOUT */}

          <div className="p-4 border-t border-gray-100">

            <button
              onClick={() => {
                closeMobileMenu();
                handleLogout();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-xs text-rose-700 font-semibold hover:bg-rose-50 rounded-lg"
            >
              <LogOut className="w-4 h-4" />
              Log out
            </button>

          </div>

        </div>

      </aside>

      {/* ==================================================
          MAIN
      ================================================== */}

      <div className="flex-1 flex flex-col min-w-0">

        {/* ==================================================
            DESKTOP HEADER
        ================================================== */}

        <header className="hidden md:flex bg-white border-b border-gray-200 px-8 py-4 justify-between items-center">

          <div className="text-xs text-gray-400">

            Portfolio

            <span className="mx-2">
              &gt;
            </span>

            <span className="text-gray-900 font-semibold uppercase tracking-wider">
              WISHLIST
            </span>

          </div>

          <div className="flex items-center gap-4">

            {/* CART */}

            <Link
              to="/cart"
              className="relative text-gray-600 hover:text-black transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
            </Link>

            {/* NOTIFICATION */}

            <Link
              to="/notifications"
              className="relative"
            >

              <Bell className="w-5 h-5 text-gray-600 hover:text-black" />

              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-rose-700 text-white text-[8px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center font-bold">
                  {unreadCount > 99
                    ? "99+"
                    : unreadCount}
                </span>
              )}

            </Link>

            {/* USER */}

            <div className="flex items-center gap-2 border-l pl-4 border-gray-200">

              {currentUser?.avatar ? (

                <img
                  src={currentUser.avatar}
                  alt={userName}
                  className="w-8 h-8 rounded-full object-cover border border-amber-500"
                />

              ) : (

                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-serif font-bold border border-amber-200">
                  {userInitial}
                </div>

              )}

              <span className="text-xs font-semibold text-gray-800 max-w-[150px] truncate">
                {userName}
              </span>

            </div>

          </div>

        </header>

        {/* ==================================================
            MOBILE HEADER
        ================================================== */}

        <header className="md:hidden bg-white border-b border-gray-200 px-4 py-4">

          <div className="flex items-center justify-between gap-3">

            {/* LOGO */}

            <Link
              to="/dashboard"
              className="flex items-center gap-3 min-w-0"
            >

              <div className="bg-black text-[#E5D5BC] w-8 h-8 rounded flex items-center justify-center font-serif font-bold shrink-0">
                W
              </div>

              <div className="min-w-0">

                <h1 className="font-serif text-sm tracking-[0.2em] font-bold text-gray-900 truncate">
                  WEFTIN
                </h1>

                <span className="text-[8px] uppercase tracking-[0.2em] text-gray-400 block truncate">
                  ATELIER TAILORS
                </span>

              </div>

            </Link>

            {/* MOBILE ACTIONS */}

            <div className="flex items-center gap-3 shrink-0">

              {/* CART */}

              <Link
                to="/cart"
                className="relative text-gray-600 hover:text-black transition-colors"
              >
                <ShoppingBag className="w-5 h-5" />
              </Link>

              {/* NOTIFICATIONS */}

              <Link
                to="/notifications"
                className="relative text-gray-600 hover:text-black transition-colors"
              >

                <Bell className="w-5 h-5" />

                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-rose-700 text-white text-[8px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center font-bold">
                    {unreadCount > 99
                      ? "99+"
                      : unreadCount}
                  </span>
                )}

              </Link>

              {/* USER-SPECIFIC ICON */}

              {currentUser?.avatar ? (

                <img
                  src={currentUser.avatar}
                  alt={userName}
                  className="w-8 h-8 rounded-full object-cover border border-amber-500"
                />

              ) : (

                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-serif font-bold border border-amber-200">
                  {userInitial}
                </div>

              )}

              {/* MENU */}

              <button
                onClick={() =>
                  setMobileMenuOpen(true)
                }
                className="text-gray-600 hover:text-black transition-colors"
                aria-label="Open navigation"
              >
                <Menu className="w-6 h-6" />
              </button>

            </div>

          </div>

        </header>

        {/* ==================================================
            CONTENT
        ================================================== */}

        <main className="p-4 sm:p-6 lg:p-8 xl:p-12 max-w-7xl w-full">

          {/* TITLE */}

          <div className="mb-8">

            <div className="flex items-center gap-2 text-amber-700 mb-1">

              <Heart className="w-5 h-5 fill-amber-700" />

              <h2 className="text-2xl sm:text-3xl font-serif text-gray-900">
                My Luxury Wishlist
              </h2>

            </div>

            <p className="text-xs text-gray-500">
              View saved products and securely
              transfer items to your shopping cart.
            </p>

          </div>

          {/* ==================================================
              LOADING
          ================================================== */}

          {loading ? (

            <div className="text-center py-20 text-gray-400 text-xs uppercase tracking-widest animate-pulse">
              Loading your saved luxury items...
            </div>

          ) : wishlist.length === 0 ? (

            /* ==================================================
                EMPTY WISHLIST
            ================================================== */

            <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-16 text-center shadow-sm">

              <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />

              <h3 className="font-serif text-lg font-bold text-gray-800 mb-2">
                Your Wishlist is Empty
              </h3>

              <p className="text-xs text-gray-500 mb-6">
                Explore our atelier collections and
                tap the heart icon on any product to
                save it here.
              </p>

              <Link
                to="/shop"
                className="inline-block bg-black text-white px-6 py-3 rounded uppercase text-xs font-bold tracking-widest hover:bg-gray-800"
              >
                Explore Shop Catalog
              </Link>

            </div>

          ) : (

            /* ==================================================
                WISHLIST GRID
            ================================================== */

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

              {wishlist.map((item) => (

                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm flex flex-col justify-between group"
                >

                  <div>

                    {/* IMAGE */}

                    <div className="relative h-72 bg-gray-100 overflow-hidden">

                      <span className="absolute top-3 left-3 z-10 text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded bg-amber-100 text-amber-900">
                        {item.tag ||
                          "ATELIER"}
                      </span>

                      <button
                        onClick={() =>
                          removeItem(
                            item.id
                          )
                        }
                        className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white text-rose-700 shadow cursor-pointer z-10"
                        title="Remove from wishlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {item.image ? (

                        <img
                          src={item.image}
                          alt={
                            item.name ||
                            "Wishlist item"
                          }
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />

                      ) : (

                        <div className="w-full h-full flex items-center justify-center">
                          <Heart className="w-10 h-10 text-gray-300" />
                        </div>

                      )}

                    </div>

                    {/* PRODUCT DETAILS */}

                    <div className="p-4">

                      <span className="text-[10px] text-amber-800 font-semibold block mb-1">
                        ★ 4.9 Expert Atelier Approved
                      </span>

                      <h3 className="font-serif text-sm font-medium text-gray-900 mb-2">
                        {item.name}
                      </h3>

                      <p className="text-xs font-bold text-gray-950">
                        {item.price}
                      </p>

                    </div>

                  </div>

                  {/* MOVE TO CART */}

                  <div className="p-4 pt-0">

                    <button
                      onClick={() =>
                        moveToCart(item)
                      }
                      className="w-full py-2.5 bg-[#1C1816] hover:bg-black text-white text-[10px] uppercase tracking-wider rounded font-semibold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                    >

                      <ShoppingBag className="w-3.5 h-3.5" />

                      Move to Shopping Cart

                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

          {/* ==================================================
              CONSULTATION BANNER
          ================================================== */}

          <div className="bg-white p-5 sm:p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs mt-8">

            <Sparkles className="w-8 h-8 text-amber-700 flex-shrink-0" />

            <div>

              <strong className="text-gray-900 font-serif block mb-1">
                TAILORS WISHLIST CONSULTATION OPTION
              </strong>

              <p className="text-gray-500">
                Curious about physical draping volume
                or how a particular saree matches your
                measurements profile? Open live support
                and select "Consult Wishlist Items".
              </p>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}