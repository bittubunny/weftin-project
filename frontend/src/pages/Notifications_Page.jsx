import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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
  Check,
  Trash2,
  Truck,
  Tag,
  Sparkles,
  ShoppingCart,
  CreditCard,
  UserRound,
  MapPinned,
  RefreshCw,
  AlertCircle,
  X,
  Menu
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://weftin-project.onrender.com";

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250";

export default function Notifications_Page() {
  const navigate = useNavigate();

  // ==================================================
  // USER
  // ==================================================

  const [savedUser, setSavedUser] = useState(null);

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    avatar: DEFAULT_AVATAR
  });

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("weftin_user");

      if (!storedUser) {
        setSavedUser(null);
        navigate("/login");
        return;
      }

      const user = JSON.parse(storedUser);

      if (!user?.email) {
        setSavedUser(null);
        navigate("/login");
        return;
      }

      setSavedUser(user);

      // Initial information from local session
      setProfileData((previous) => ({
        ...previous,
        name:
          user.name ||
          user.full_name ||
          user.username ||
          "",
        email: user.email || "",
        avatar: user.avatar || DEFAULT_AVATAR
      }));
    } catch (error) {
      console.error("Unable to read user:", error);
      setSavedUser(null);
      navigate("/login");
    }
  }, [navigate]);

  const userEmail = savedUser?.email || "";

  const userName =
    profileData.name ||
    savedUser?.name ||
    savedUser?.full_name ||
    savedUser?.username ||
    "WEFTIN Member";

  // ==================================================
  // LOAD DATABASE PROFILE
  // ==================================================

  useEffect(() => {
    if (!userEmail) {
      return;
    }

    const loadUserProfile = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/user/${encodeURIComponent(
            userEmail
          )}`
        );

        if (!response.ok) {
          throw new Error(
            `Profile request failed: ${response.status}`
          );
        }

        const data = await response.json();

        if (data && data.email) {
          setProfileData((previous) => ({
            ...previous,
            name:
              data.name ||
              savedUser?.name ||
              "WEFTIN Member",
            email: data.email || userEmail,
            avatar:
              data.avatar ||
              savedUser?.avatar ||
              DEFAULT_AVATAR
          }));
        }
      } catch (error) {
        console.error(
          "Failed to load user profile:",
          error
        );
      }
    };

    loadUserProfile();
  }, [userEmail, savedUser]);

  // ==================================================
  // STATE
  // ==================================================

  const [notifications, setNotifications] = useState([]);

  const [loading, setLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");

  const [toastMessage, setToastMessage] = useState("");

  // ==================================================
  // MOBILE MENU
  // ==================================================

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // ==================================================
  // TOAST
  // ==================================================

  const showToast = useCallback((message) => {
    setToastMessage(message);

    window.setTimeout(() => {
      setToastMessage("");
    }, 3000);
  }, []);

  // ==================================================
  // FETCH NOTIFICATIONS
  // ==================================================

  const loadNotifications = useCallback(async () => {
    if (!userEmail) {
      setNotifications([]);
      setLoading(false);
      setErrorMessage(
        "Please sign in to view your notifications."
      );
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const response = await fetch(
        `${API_BASE_URL}/api/notifications/${encodeURIComponent(
          userEmail
        )}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Failed to load notifications."
        );
      }

      if (!Array.isArray(data)) {
        throw new Error(
          "Invalid notification data received from server."
        );
      }

      setNotifications(data);
    } catch (error) {
      console.error(
        "Notification loading error:",
        error
      );

      setErrorMessage(
        error?.message ||
          "Unable to load notifications."
      );
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  useEffect(() => {
    if (userEmail) {
      loadNotifications();
    } else {
      setLoading(false);
    }
  }, [userEmail, loadNotifications]);

  // ==================================================
  // ICON
  // ==================================================

  const getNotificationIcon = (type) => {
    const notificationType = String(
      type || ""
    ).toUpperCase();

    switch (notificationType) {
      case "ORDER":
        return (
          <Package className="w-5 h-5 text-amber-700" />
        );

      case "SHIPPING":
        return (
          <Truck className="w-5 h-5 text-amber-700" />
        );

      case "CUSTOM_DESIGN":
      case "CUSTOM-DESIGN":
      case "CUSTOM DESIGN":
        return (
          <Scissors className="w-5 h-5 text-amber-700" />
        );

      case "MEASUREMENT":
      case "MEASUREMENTS":
        return (
          <Ruler className="w-5 h-5 text-amber-700" />
        );

      case "WISHLIST":
        return (
          <Heart className="w-5 h-5 text-rose-600" />
        );

      case "CART":
        return (
          <ShoppingCart className="w-5 h-5 text-amber-700" />
        );

      case "PROFILE":
        return (
          <UserRound className="w-5 h-5 text-amber-700" />
        );

      case "ADDRESS":
        return (
          <MapPinned className="w-5 h-5 text-amber-700" />
        );

      case "PAYMENT":
        return (
          <CreditCard className="w-5 h-5 text-emerald-700" />
        );

      case "LOGIN":
        return (
          <User className="w-5 h-5 text-amber-700" />
        );

      case "PRICE_DROP":
      case "PRICE-DROP":
        return (
          <Tag className="w-5 h-5 text-rose-600" />
        );

      case "SYSTEM":
      default:
        return (
          <Sparkles className="w-5 h-5 text-amber-700" />
        );
    }
  };

  // ==================================================
  // DATE FORMAT
  // ==================================================

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "Just now";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return String(dateValue);
    }

    return date.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // ==================================================
  // MARK ONE AS READ
  // ==================================================

  const markAsRead = async (notification) => {
    if (!userEmail || notification.is_read) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/notifications/${
          notification.id
        }/read?user_email=${encodeURIComponent(
          userEmail
        )}`,
        {
          method: "PUT"
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Failed to mark notification as read."
        );
      }

      setNotifications((previous) =>
        previous.map((item) =>
          item.id === notification.id
            ? {
                ...item,
                is_read: true
              }
            : item
        )
      );
    } catch (error) {
      console.error(
        "Mark read error:",
        error
      );

      showToast(
        "Unable to update notification."
      );
    }
  };

  // ==================================================
  // MARK ALL AS READ
  // ==================================================

  const markAllRead = async () => {
    if (!userEmail || unreadCount === 0) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/notifications/read-all/${encodeURIComponent(
          userEmail
        )}`,
        {
          method: "PUT"
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Failed to mark notifications as read."
        );
      }

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          is_read: true
        }))
      );

      showToast(
        "All notifications marked as read."
      );
    } catch (error) {
      console.error(
        "Mark all read error:",
        error
      );

      showToast(
        "Unable to update notifications."
      );
    }
  };

  // ==================================================
  // CLEAR ALL
  // ==================================================

  const clearAlarms = async () => {
    if (!userEmail || notifications.length === 0) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to clear all notifications?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/notifications/${encodeURIComponent(
          userEmail
        )}`,
        {
          method: "DELETE"
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Failed to clear notifications."
        );
      }

      setNotifications([]);

      showToast(
        "All notifications cleared."
      );
    } catch (error) {
      console.error(
        "Clear notifications error:",
        error
      );

      showToast(
        "Unable to clear notifications."
      );
    }
  };

  // ==================================================
  // LOGOUT
  // ==================================================

  const handleLogout = () => {
    localStorage.removeItem("weftin_user");
    setMobileMenuOpen(false);
    navigate("/login");
  };

  // ==================================================
  // UNREAD COUNT
  // ==================================================

  const unreadCount = notifications.filter(
    (notification) =>
      notification.is_read !== true
  ).length;

  // ==================================================
  // NOTIFICATION BADGE
  // ==================================================

  const NotificationBadge = ({
    mobile = false
  }) => {
    if (unreadCount <= 0) {
      return null;
    }

    return (
      <span
        className={
          mobile
            ? "inline-flex bg-rose-600 text-white min-w-4 h-4 px-1 rounded-full items-center justify-center text-[8px] font-bold"
            : "absolute -top-1 -right-2 bg-rose-600 text-white text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center font-bold"
        }
      >
        {unreadCount > 99 ? "99+" : unreadCount}
      </span>
    );
  };

  // ==================================================
  // LOADING SCREEN
  // ==================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-5 rounded-full border-2 border-gray-200 border-t-amber-700 animate-spin"></div>

          <p className="font-serif text-lg text-gray-900">
            Loading Notifications
          </p>

          <p className="text-xs text-gray-500 mt-2">
            Retrieving your atelier activity...
          </p>
        </div>
      </div>
    );
  }

  // ==================================================
  // MAIN
  // ==================================================

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-gray-900 font-sans flex flex-col md:flex-row">

      {/* ==================================================
          TOAST
      ================================================== */}

      {toastMessage && (
        <div className="fixed bottom-4 right-4 left-4 sm:left-auto z-50 bg-gray-900 text-white px-5 sm:px-6 py-3 rounded-lg shadow-2xl text-xs sm:text-sm flex items-center justify-center sm:justify-start gap-3 border border-amber-500/30 max-w-md sm:max-w-none mx-auto sm:mx-0">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0"></span>

          <span>{toastMessage}</span>

          <button
            onClick={() => setToastMessage("")}
            className="ml-2 text-gray-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ==================================================
          MOBILE SLIDE-IN MENU
      ================================================== */}

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
        {/* MOBILE MENU BRAND */}

        <div className="p-5 border-b border-gray-100 flex items-center justify-between">

          <Link
            to="/dashboard"
            onClick={closeMobileMenu}
            className="flex items-center gap-3"
          >
            <div className="bg-black text-[#E5D5BC] w-8 h-8 rounded flex items-center justify-center font-serif font-bold shrink-0">
              W
            </div>

            <div>
              <h1 className="font-serif text-sm tracking-[0.2em] font-bold text-gray-900">
                WEFTIN
              </h1>

              <span className="text-[8px] uppercase tracking-[0.2em] text-gray-400">
                ATELIER TAILORS
              </span>
            </div>
          </Link>

          <button
            onClick={closeMobileMenu}
            className="text-gray-500 hover:text-black transition-colors"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>

        </div>

        {/* MOBILE NAVIGATION */}

        <nav className="p-3 space-y-1 text-xs font-medium text-gray-600 overflow-y-auto h-[calc(100%-80px)]">

          <Link
            to="/dashboard"
            onClick={closeMobileMenu}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/orders"
            onClick={closeMobileMenu}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
          >
            <Package className="w-4 h-4 shrink-0" />
            <span>My Orders</span>
          </Link>

          <Link
            to="/custom-designs"
            onClick={closeMobileMenu}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
          >
            <Scissors className="w-4 h-4 shrink-0" />
            <span>Custom Designs</span>
          </Link>

          <Link
            to="/measurements"
            onClick={closeMobileMenu}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
          >
            <Ruler className="w-4 h-4 shrink-0" />
            <span>Measurements</span>
          </Link>

          <Link
            to="/wishlist"
            onClick={closeMobileMenu}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
          >
            <Heart className="w-4 h-4 shrink-0" />
            <span>Wishlist</span>
          </Link>

          <Link
            to="/addresses"
            onClick={closeMobileMenu}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
          >
            <MapPin className="w-4 h-4 shrink-0" />
            <span>Addresses</span>
          </Link>

          <Link
            to="/profile"
            onClick={closeMobileMenu}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
          >
            <User className="w-4 h-4 shrink-0" />
            <span>Profile</span>
          </Link>

          {/* ACTIVE NOTIFICATIONS */}

          <Link
            to="/notifications"
            onClick={closeMobileMenu}
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-100/60 text-amber-900 font-semibold border-l-4 border-amber-700"
          >
            <Bell className="w-4 h-4 shrink-0" />

            <span className="truncate">
              Notifications
            </span>
          </Link>

          <Link
            to="/support"
            onClick={closeMobileMenu}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
          >
            <Headphones className="w-4 h-4 shrink-0" />
            <span>Support</span>
          </Link>

          {/* LOGOUT */}

          <div className="border-t border-gray-100 mt-4 pt-4">

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 text-xs text-rose-700 font-semibold hover:bg-rose-50 rounded-lg w-full transition-colors"
            >
              <LogOut className="w-4 h-4 shrink-0" />

              <span>Log out</span>
            </button>

          </div>

        </nav>
      </aside>

      {/* ==================================================
          DESKTOP SIDEBAR
      ================================================== */}

      <aside className="hidden md:flex md:w-56 lg:w-64 bg-white border-r border-gray-200 flex-col justify-between sticky top-0 h-screen shrink-0">

        <div>

          {/* BRAND */}

          <div className="p-5 lg:p-6 border-b border-gray-100 flex items-center gap-3">

            <div className="bg-black text-[#E5D5BC] w-8 h-8 rounded flex items-center justify-center font-serif font-bold shrink-0">
              W
            </div>

            <div className="min-w-0">
              <h1 className="font-serif text-sm tracking-[0.2em] font-bold text-gray-900">
                WEFTIN
              </h1>

              <span className="text-[8px] lg:text-[9px] uppercase tracking-[0.2em] text-gray-400 block truncate">
                ATELIER TAILORS
              </span>
            </div>

          </div>

          {/* NAVIGATION */}

          <nav className="p-3 lg:p-4 space-y-1 text-xs font-medium text-gray-600">

            <Link
              to="/dashboard"
              className="flex items-center gap-3 px-3 lg:px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/orders"
              className="flex items-center gap-3 px-3 lg:px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
            >
              <Package className="w-4 h-4 shrink-0" />
              <span>My Orders</span>
            </Link>

            <Link
              to="/custom-designs"
              className="flex items-center gap-3 px-3 lg:px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
            >
              <Scissors className="w-4 h-4 shrink-0" />
              <span>Custom Designs</span>
            </Link>

            <Link
              to="/measurements"
              className="flex items-center gap-3 px-3 lg:px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
            >
              <Ruler className="w-4 h-4 shrink-0" />
              <span>Measurements</span>
            </Link>

            <Link
              to="/wishlist"
              className="flex items-center gap-3 px-3 lg:px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
            >
              <Heart className="w-4 h-4 shrink-0" />
              <span>Wishlist</span>
            </Link>

            <Link
              to="/addresses"
              className="flex items-center gap-3 px-3 lg:px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
            >
              <MapPin className="w-4 h-4 shrink-0" />
              <span>Addresses</span>
            </Link>

            <Link
              to="/profile"
              className="flex items-center gap-3 px-3 lg:px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
            >
              <User className="w-4 h-4 shrink-0" />
              <span>Profile</span>
            </Link>

            {/* ACTIVE NOTIFICATIONS */}

            <Link
              to="/notifications"
              className="flex items-center gap-3 px-3 lg:px-4 py-3 rounded-lg bg-amber-100/60 text-amber-900 font-semibold border-l-4 border-amber-700 justify-between"
            >
              <span className="flex items-center gap-3 min-w-0">
                <Bell className="w-4 h-4 shrink-0" />

                <span className="truncate">
                  Notifications
                </span>
              </span>

            </Link>

            <Link
              to="/support"
              className="flex items-center gap-3 px-3 lg:px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
            >
              <Headphones className="w-4 h-4 shrink-0" />
              <span>Support</span>
            </Link>

          </nav>
        </div>

        {/* LOGOUT */}

        <div className="p-3 lg:p-4 border-t border-gray-100">

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 lg:px-4 py-2 text-xs text-rose-700 font-semibold hover:bg-rose-50 rounded-lg w-full transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />

            <span>Log out</span>
          </button>

        </div>

      </aside>

      {/* ==================================================
          MAIN CONTENT
      ================================================== */}

      <main className="flex-1 flex flex-col min-w-0">

        {/* ==================================================
            MOBILE HEADER
        ================================================== */}

        <div className="md:hidden bg-white border-b border-gray-200">

          {/* TOP MOBILE BAR */}

          <div className="px-4 py-4 flex items-center justify-between">

            {/* BRAND + MENU */}

            <div className="flex items-center gap-3">

              <button
                onClick={() => setMobileMenuOpen(true)}
                className="text-gray-600 hover:text-black transition-colors"
                aria-label="Open navigation"
              >
                <Menu className="w-5 h-5" />
              </button>

              <Link
                to="/dashboard"
                className="flex items-center gap-3"
              >
                <div className="bg-black text-[#E5D5BC] w-8 h-8 rounded flex items-center justify-center font-serif font-bold">
                  W
                </div>

                <div>
                  <h1 className="font-serif text-sm tracking-[0.2em] font-bold text-gray-900">
                    WEFTIN
                  </h1>

                  <span className="text-[8px] uppercase tracking-[0.2em] text-gray-400">
                    ATELIER TAILORS
                  </span>
                </div>
              </Link>

            </div>

            {/* MOBILE ACTIONS */}

            <div className="flex items-center gap-4">

              {/* CART */}

              <Link
                to="/cart"
                className="relative text-gray-600 hover:text-black"
              >
                <ShoppingCart className="w-5 h-5" />
              </Link>

              {/* NOTIFICATIONS */}

              <Link
                to="/notifications"
                className="relative text-gray-600 hover:text-black"
              >
                <Bell className="w-5 h-5" />

                <NotificationBadge />
              </Link>

              {/* PROFILE */}

              <Link
                to="/profile"
                className="shrink-0"
              >
                <img
                  src={
                    profileData.avatar ||
                    DEFAULT_AVATAR
                  }
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover border border-amber-500"
                  onError={(event) => {
                    event.currentTarget.src =
                      DEFAULT_AVATAR;
                  }}
                />
              </Link>

            </div>

          </div>

        </div>

        {/* ==================================================
            DESKTOP HEADER
        ================================================== */}

        <header className="hidden md:flex bg-white border-b border-gray-200 px-5 lg:px-8 py-4 justify-between items-center">

          <div className="text-[10px] lg:text-xs text-gray-400">
            Portfolio

            <span className="mx-2">
              &gt;
            </span>

            <span className="text-gray-900 font-semibold uppercase tracking-wider">
              NOTIFICATIONS
            </span>
          </div>

          <div className="flex items-center gap-4 lg:gap-6">

            {/* CART */}

            <Link
              to="/cart"
              className="relative text-gray-600 hover:text-black transition-colors"
              title="Cart"
            >
              <ShoppingCart className="w-5 h-5" />
            </Link>

            {/* NOTIFICATION */}

            <Link
              to="/notifications"
              className="relative text-gray-600 hover:text-black transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />

              <NotificationBadge />
            </Link>

            {/* USER */}

            <Link
              to="/profile"
              className="flex items-center gap-3 pl-4 border-l border-gray-200 hover:opacity-80 transition-opacity"
            >

              <img
                src={
                  profileData.avatar ||
                  DEFAULT_AVATAR
                }
                alt="Profile"
                className="w-9 h-9 rounded-full object-cover border border-amber-500"
                onError={(event) => {
                  event.currentTarget.src =
                    DEFAULT_AVATAR;
                }}
              />

              <span className="text-xs font-semibold text-gray-800 max-w-[150px] truncate">
                {userName}
              </span>

            </Link>

          </div>

        </header>

        {/* ==================================================
            PAGE CONTENT
        ================================================== */}

        <div className="p-4 sm:p-6 lg:p-8 xl:p-12 max-w-7xl w-full">

          {/* ==================================================
              TITLE + ACTIONS
          ================================================== */}

          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-5">

            <div className="min-w-0">

              <div className="flex flex-wrap items-center gap-2 text-amber-700 mb-1">

                <Bell className="w-5 h-5 shrink-0" />

                <h2 className="text-2xl sm:text-3xl font-serif text-gray-900">
                  My Notification Feeds
                </h2>

                {unreadCount > 0 && (
                  <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-1 rounded-full">
                    {unreadCount} unread
                  </span>
                )}

              </div>

              <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed max-w-3xl">
                Track your WEFTIN account activity, orders,
                custom designs, measurements and atelier updates.
              </p>

            </div>

            {/* ==================================================
                ACTION BUTTONS
            ================================================== */}

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full xl:w-auto">

              {/* REFRESH */}

              <button
                onClick={loadNotifications}
                disabled={loading}
                className="bg-white border border-gray-300 hover:border-black disabled:opacity-50 text-gray-800 px-3 py-2.5 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw
                  className={`w-4 h-4 ${
                    loading
                      ? "animate-spin"
                      : ""
                  }`}
                />
              </button>

              {/* MARK ALL READ */}

              <button
                onClick={markAllRead}
                disabled={unreadCount === 0}
                className="flex-1 sm:flex-none bg-white border border-gray-300 hover:border-black disabled:opacity-40 disabled:cursor-not-allowed text-gray-800 px-3 sm:px-4 py-2.5 rounded-lg text-[10px] sm:text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
              >
                <Check className="w-3.5 h-3.5 text-amber-700" />

                Mark all read
              </button>

              {/* CLEAR */}

              <button
                onClick={clearAlarms}
                disabled={notifications.length === 0}
                className="flex-1 sm:flex-none bg-white border border-gray-300 hover:border-rose-600 disabled:opacity-40 disabled:cursor-not-allowed text-rose-700 px-3 sm:px-4 py-2.5 rounded-lg text-[10px] sm:text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />

                Clear Alarms
              </button>

            </div>

          </div>

          {/* ==================================================
              ERROR
          ================================================== */}

          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 sm:p-5 rounded-xl mb-6 flex items-start gap-3">

              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />

              <div className="flex-1 min-w-0">

                <p className="text-sm font-semibold">
                  Unable to load notifications
                </p>

                <p className="text-xs mt-1 break-words">
                  {errorMessage}
                </p>

                <button
                  onClick={loadNotifications}
                  className="mt-3 text-xs font-semibold underline hover:no-underline"
                >
                  Try again
                </button>

              </div>

            </div>
          )}

          {/* ==================================================
              EMPTY
          ================================================== */}

          {notifications.length === 0 &&
          !errorMessage ? (

            <div className="bg-white p-8 sm:p-12 lg:p-16 rounded-xl border border-gray-200 text-center shadow-sm">

              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />

              <h3 className="font-serif text-xl text-gray-800 mb-2">
                No notifications yet.
              </h3>

              <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                Your WEFTIN account activity and atelier alerts
                will appear here.
              </p>

            </div>

          ) : (

            /* ==================================================
               NOTIFICATION LIST
            ================================================== */

            <div className="space-y-4">

              {notifications.map((notification) => (

                <div
                  key={notification.id}
                  onClick={() =>
                    markAsRead(notification)
                  }
                  className={`bg-white rounded-xl border p-4 sm:p-5 lg:p-6 shadow-sm flex items-start gap-3 sm:gap-4 transition-all cursor-pointer hover:shadow-md ${
                    notification.is_read
                      ? "border-gray-200"
                      : "border-amber-300 bg-amber-50/20"
                  }`}
                >

                  {/* ICON */}

                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0 border border-amber-200/60">
                    {getNotificationIcon(
                      notification.type
                    )}
                  </div>

                  {/* CONTENT */}

                  <div className="flex-1 min-w-0">

                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-4 mb-1">

                      <h3
                        className={`font-serif text-sm sm:text-base ${
                          notification.is_read
                            ? "font-medium text-gray-800"
                            : "font-bold text-gray-900"
                        }`}
                      >
                        {notification.title}
                      </h3>

                      <span className="text-[10px] sm:text-[11px] text-gray-400 whitespace-normal sm:whitespace-nowrap">
                        🕒{" "}
                        {formatDate(
                          notification.created_at
                        )}
                      </span>

                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed mb-3">
                      {notification.description}
                    </p>

                    {!notification.is_read && (
                      <span className="inline-block bg-amber-100 text-amber-900 text-[8px] sm:text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded border border-amber-300">
                        NEW ALERT • TAP TO MARK READ
                      </span>
                    )}

                  </div>

                </div>

              ))}

            </div>

          )}

          {/* ==================================================
              MOBILE LOGOUT
          ================================================== */}

          <div className="md:hidden border-t border-gray-200 mt-8 pt-6">

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs text-rose-700 font-semibold bg-white border border-gray-200 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />

              Log out
            </button>

          </div>

        </div>

      </main>

    </div>
  );
}
