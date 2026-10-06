import React, { useEffect, useState, useCallback } from "react";
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
  Plus,
  MessageSquare,
  Trash2,
  RefreshCw,
  ShoppingBag,
  Menu,
  X,
  ChevronRight,
  Settings
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "https://weftin-project.onrender.com";

export default function CustomDesigns_Page() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState("");

  const [currentUser, setCurrentUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Best Sellers and Quick View state
  const [bestSellers, setBestSellers] = useState([]);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // --------------------------------------------------
  // CURRENT USER & PROFILE SYNC
  // --------------------------------------------------

  useEffect(() => {
    try {
      const savedUser = JSON.parse(
        localStorage.getItem("weftin_user") || "null"
      );
      setCurrentUser(savedUser);
    } catch (error) {
      console.error("Failed to load user:", error);
      setCurrentUser(null);
    }
  }, []);

  const userEmail = currentUser?.email;

  const userName =
    currentUser?.name ||
    currentUser?.full_name ||
    currentUser?.username ||
    currentUser?.email ||
    "My Account";

  const userInitial = userName.charAt(0).toUpperCase();

  // --------------------------------------------------
  // USER AVATAR (Interactive profile redirect)
  // --------------------------------------------------

  const UserAvatar = ({ size = "w-8 h-8" }) => {
    const handleAvatarClick = (e) => {
      e.stopPropagation();
      navigate("/profile");
    };

    if (currentUser?.avatar) {
      return (
        <img
          src={currentUser.avatar}
          alt={userName}
          onClick={handleAvatarClick}
          className={`${size} rounded-full object-cover border border-amber-500 cursor-pointer hover:opacity-90 transition-opacity`}
        />
      );
    }

    return (
      <div
        onClick={handleAvatarClick}
        className={`${size} rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-serif font-bold border border-amber-200 cursor-pointer hover:bg-amber-200 transition-colors`}
      >
        {userInitial}
      </div>
    );
  };

  // --------------------------------------------------
  // TOAST
  // --------------------------------------------------

  const showToast = useCallback((msg) => {
    setToastMessage(msg);

    setTimeout(() => {
      setToastMessage("");
    }, 3000);
  }, []);

  // --------------------------------------------------
  // LOAD NOTIFICATION COUNT
  // --------------------------------------------------

  const loadUnreadCount = async (email) => {
    if (!email) {
      setUnreadCount(0);
      return;
    }

    const token = localStorage.getItem("weftin_token");

    try {
      const response = await fetch(
        `${API_BASE}/api/notifications/unread-count/${encodeURIComponent(
          email
        )}`,
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        }
      );

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      setUnreadCount(Number(data?.count || 0));
    } catch (error) {
      console.error("Unread notification count error:", error);
    }
  };

  useEffect(() => {
    if (!userEmail) {
      setUnreadCount(0);
      return;
    }

    loadUnreadCount(userEmail);
  }, [userEmail]);

  // --------------------------------------------------
  // LOAD BEST SELLERS FOR CUSTOM DESIGN INSPIRATION (4 ITEMS)
  // --------------------------------------------------

  useEffect(() => {
    fetch(`${API_BASE}/api/home-products?section=Best+Seller`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch Best Sellers");
        }
        return res.json();
      })
      .then((data) => {
        setBestSellers(Array.isArray(data) ? data.slice(0, 4) : []);
      })
      .catch((err) => {
        console.error("Best seller fetch error:", err);
        setBestSellers([]);
      });
  }, []);

  // --------------------------------------------------
  // BESPOKE CUSTOM DESIGN INITIATION (MATCHING PRODUCT OVERVIEW)
  // --------------------------------------------------

  const handleBespokeCustomDesign = async (product) => {
    const savedUser = JSON.parse(localStorage.getItem("weftin_user"));
    const token = localStorage.getItem("weftin_token");

    if (!savedUser?.email) {
      showToast("Please sign in before creating a custom design.");
      setTimeout(() => navigate("/login"), 1000);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/api/custom-designs`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            user_email: savedUser.email,
            product_id: Number(product.id),
            product_name: product.name,
            product_category: product.category,
            product_price: product.price,
            product_image: product.image
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to create custom design");
      }

      showToast("Bespoke custom design request created!");

      setTimeout(() => {
        navigate("/custom-designs");
        loadRequests(); // Refresh requests list
      }, 500);

    } catch (error) {
      console.error("Custom design error:", error);
      showToast("Unable to create custom design request.");
    }
  };

  // --------------------------------------------------
  // NOTIFICATION BADGE
  // --------------------------------------------------

  const NotificationBadge = ({ sidebar = false }) => {
    if (unreadCount <= 0) {
      return null;
    }

    return (
      <span
        className={
          sidebar
            ? "bg-rose-700 text-white text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center font-bold shrink-0"
            : "absolute -top-2 -right-2 bg-rose-700 text-white text-[8px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center font-bold"
        }
      >
        {unreadCount > 99 ? "99+" : unreadCount}
      </span>
    );
  };

  // --------------------------------------------------
  // LOAD USER CUSTOM DESIGNS
  // --------------------------------------------------

  const loadRequests = async () => {
    if (!userEmail) {
      setRequests([]);
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("weftin_token");

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE}/api/custom-designs/${encodeURIComponent(
          userEmail
        )}`,
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load custom designs");
      }

      const data = await response.json();

      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading custom designs:", error);
      showToast("Unable to load custom design requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [userEmail]);

  // --------------------------------------------------
  // DELETE REQUEST
  // --------------------------------------------------

  const deleteRequest = async (requestId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this custom design request?"
    );

    if (!confirmed) {
      return;
    }

    if (!userEmail) {
      showToast("Please sign in again.");
      return;
    }

    const token = localStorage.getItem("weftin_token");

    try {
      const response = await fetch(
        `${API_BASE}/api/custom-designs/${requestId}?user_email=${encodeURIComponent(
          userEmail
        )}`,
        {
          method: "DELETE",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to delete custom design"
        );
      }

      setRequests((current) =>
        current.filter((item) => item.id !== requestId)
      );

      showToast("Custom design request deleted.");
    } catch (error) {
      console.error("Delete custom design error:", error);
      showToast("Unable to delete custom design.");
    }
  };

  // --------------------------------------------------
  // STATUS STYLE
  // --------------------------------------------------

  const getStatusClass = (status) => {
    const normalized = String(status || "").toLowerCase();

    if (normalized.includes("complete")) {
      return "bg-emerald-100 text-emerald-800 border border-emerald-300";
    }

    if (
      normalized.includes("progress") ||
      normalized.includes("working")
    ) {
      return "bg-blue-100 text-blue-800 border border-blue-300";
    }

    if (
      normalized.includes("cancel") ||
      normalized.includes("reject")
    ) {
      return "bg-rose-100 text-rose-800 border border-rose-300";
    }

    return "bg-purple-100 text-purple-800 border border-purple-300";
  };

  // --------------------------------------------------
  // DATE FORMAT
  // --------------------------------------------------

  const formatDate = (date) => {
    if (!date) {
      return "Unknown date";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Unknown date";
    }

    return parsedDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("weftin_user");
    localStorage.removeItem("weftin_token");
    setMobileMenuOpen(false);
    navigate("/login");
  };

  // --------------------------------------------------
  // NOT LOGGED IN
  // --------------------------------------------------

  if (!userEmail) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center px-6">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-10 text-center max-w-md">
          <User className="w-12 h-12 mx-auto text-gray-300 mb-4" />

          <h2 className="font-serif text-2xl text-gray-900 mb-2">
            Sign in required
          </h2>

          <p className="text-sm text-gray-500 mb-6">
            Please sign in to view your bespoke custom design requests.
          </p>

          <button
            onClick={() => navigate("/profile")}
            className="bg-black text-white px-8 py-3 rounded-lg text-xs uppercase tracking-widest font-semibold cursor-pointer"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-gray-900 font-sans flex">

      {/* TOAST */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] bg-gray-900 text-white px-6 py-3 rounded-lg shadow-2xl text-sm flex items-center gap-3 border border-amber-500/30">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          {toastMessage}
        </div>
      )}

      {/* DESKTOP SIDEBAR (LEGACY CUSTOM DESIGN SIDEBAR) */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between hidden md:flex fixed top-0 left-0 h-screen z-30">
        <div>
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3">
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
            </Link>
          </div>

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
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-100/60 text-amber-900 font-semibold border-l-4 border-amber-700"
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

            <Link
              to="/wishlist"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700"
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

            <Link
              to="/notifications"
              className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700"
            >
              <span className="flex items-center gap-3">
                <Bell className="w-4 h-4" />
                Notifications
              </span>
              <NotificationBadge sidebar />
            </Link>

            <Link
              to="/support"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700"
            >
              <Headphones className="w-4 h-4" />
              Support
            </Link>
          </nav>
        </div>

        <div className="p-4 border-t border-gray-100">
          <Link
            to="/"
            onClick={() => {
              localStorage.removeItem("weftin_user");
              localStorage.removeItem("weftin_token");
            }}
            className="flex items-center gap-3 px-4 py-2 text-xs text-rose-700 font-semibold hover:bg-rose-50 rounded-lg"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </Link>
        </div>
      </aside>

      {/* MOBILE OVERLAY */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
          onClick={closeMobileMenu}
        />
      )}

      {/* MOBILE SLIDE-IN NAVIGATION DRAWER (MATCHING HOME PAGE EXACTLY) */}
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
          <div 
            onClick={() => {
              closeMobileMenu();
              navigate("/profile");
            }}
            className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-amber-50/30 cursor-pointer hover:bg-amber-50/60 transition-colors"
          >
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
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

          {/* COMPLETE NAVIGATION LINKS MATCHING HOME PAGE */}
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
                <span className="w-4 h-4 flex items-center justify-center text-sm">★</span>
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
              className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-black text-white transition-colors"
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

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-64">

        {/* DESKTOP HEADER */}
        <header className="hidden md:flex bg-white border-b border-gray-200 px-8 py-4 justify-between items-center sticky top-0 z-20">
          <div className="text-xs text-gray-400">
            Portfolio
            <span className="mx-2">&gt;</span>
            <span className="text-gray-900 font-semibold uppercase tracking-wider">
              Custom Designs
            </span>
          </div>

          <div className="flex items-center gap-5">
            <Link
              to="/cart"
              className="relative text-gray-600 hover:text-black transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
            </Link>

            <Link
              to="/notifications"
              className="relative text-gray-600 hover:text-black transition-colors"
            >
              <Bell className="w-5 h-5" />
              <NotificationBadge />
            </Link>

            <div 
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2 border-l pl-4 border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <UserAvatar />
              <span className="text-xs font-semibold text-gray-800">
                {userName}
              </span>
            </div>
          </div>
        </header>

        {/* MOBILE HEADER */}
        <header className="md:hidden bg-white border-b border-gray-200 sticky top-0 z-20">
          <div className="px-4 py-4 flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-3"
            >
              <div className="bg-black text-[#E5D5BC] w-8 h-8 rounded flex items-center justify-center font-serif font-bold">
                W
              </div>
              <div>
                <h1 className="font-serif text-base tracking-[0.2em] font-bold text-gray-900">
                  WEFTIN
                </h1>
                <span className="text-[8px] uppercase tracking-[0.15em] text-gray-400 block">
                  ATELIER TAILORS
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                to="/cart"
                className="relative text-gray-700 hover:text-black"
              >
                <ShoppingBag className="w-5 h-5" />
              </Link>

              <Link
                to="/notifications"
                className="relative text-gray-700 hover:text-black"
              >
                <Bell className="w-5 h-5" />
                <NotificationBadge />
              </Link>

              <UserAvatar size="w-7 h-7" />

              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="p-1 text-gray-700 hover:text-black cursor-pointer"
                aria-label="Open navigation drawer"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </header>

        {/* PAGE BODY */}
        <main className="p-4 sm:p-6 lg:p-8 xl:p-12 max-w-6xl w-full space-y-12">

          {/* PAGE HEADER */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 text-amber-700 mb-1">
                <Scissors className="w-5 h-5" />
                <h2 className="text-2xl font-serif text-gray-900">
                  Custom Embroidery Requests
                </h2>
              </div>

              <p className="text-xs text-gray-500">
                Submit layouts, track hand-weaving blueprints, and direct
                chat with premier master embroiderers.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button
                onClick={loadRequests}
                className="border border-gray-300 hover:border-black text-gray-700 px-4 py-3 rounded-lg text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>

              <button
                onClick={() => navigate("/shop")}
                className="bg-[#1C1816] hover:bg-black text-white px-5 py-3 rounded-lg text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                Explore Shop & Customize
              </button>
            </div>
          </div>

          {/* BEST SELLERS 4-ITEM INSPIRATION DISPLAY */}
          <section className="bg-[#FAF2EC] rounded-2xl p-6 sm:p-8 border border-amber-900/10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-amber-800 font-semibold block mb-1">
                  ATELIER INSPIRATION
                </span>
                <h3 className="font-serif text-xl text-gray-900">
                  Top Best Sellers Ready for Customization
                </h3>
              </div>
              <button
                onClick={() => navigate("/shop")}
                className="text-xs uppercase tracking-wider font-bold text-amber-900 hover:underline mt-2 sm:mt-0 cursor-pointer"
              >
                View All Catalog &rarr;
              </button>
            </div>

            {bestSellers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {bestSellers.map((item) => (
                  <div
                    key={item.id}
                    className="group bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 flex flex-col justify-between"
                  >
                    <div className="relative h-64 bg-gray-100 overflow-hidden">
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
                        <h4 className="font-serif text-sm font-medium mb-1 truncate">
                          {item.name}
                        </h4>
                        <p className="text-xs font-bold text-gray-900 mb-3">
                          {item.price}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                        <button
                          onClick={() => setQuickViewProduct(item)}
                          className="py-2 border border-gray-300 text-gray-800 text-[10px] uppercase tracking-wider hover:bg-gray-50 cursor-pointer rounded"
                        >
                          Quick View
                        </button>

                        <button
                          onClick={() => handleBespokeCustomDesign(item)}
                          className="py-2 bg-black text-white text-[10px] uppercase tracking-wider hover:bg-gray-900 cursor-pointer rounded"
                        >
                          Custom Design
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-gray-500">
                Loading best sellers...
              </div>
            )}
          </section>

          {/* REQUESTS LIST */}
          {loading ? (
            <div className="bg-white p-10 sm:p-16 rounded-xl border border-gray-200 text-center shadow-sm">
              <RefreshCw className="w-8 h-8 text-amber-700 mx-auto mb-4 animate-spin" />
              <h3 className="font-serif text-xl text-gray-800">
                Loading your custom designs...
              </h3>
              <p className="text-xs text-gray-500 mt-2">
                Retrieving your atelier requests.
              </p>
            </div>
          ) : requests.length === 0 ? (
            <div className="bg-white p-10 sm:p-16 rounded-xl border border-gray-200 text-center shadow-sm">
              <Scissors className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-serif text-xl text-gray-800 mb-2">
                No custom design requests found.
              </h3>
              <p className="text-xs text-gray-500 mb-6">
                Select a masterpiece from the Shop and click
                "Bespoke Custom Design" to initiate a tailoring blueprint.
              </p>
              <button
                onClick={() => navigate("/shop")}
                className="bg-black text-white px-8 py-3.5 text-xs uppercase tracking-widest rounded font-semibold inline-block hover:bg-gray-800 cursor-pointer"
              >
                Explore Shop Collections
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 pb-4 border-b border-gray-100 text-xs">
                    <span className="font-mono font-bold text-gray-600">
                      CD-{String(req.id).padStart(4, "0")}
                    </span>

                    <span
                      className={`self-start sm:self-auto px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${getStatusClass(
                        req.status
                      )}`}
                    >
                      {req.status || "Drafting Blueprint"}
                    </span>
                  </div>

                  <div className="py-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                    <div className="flex gap-4 items-center min-w-0">
                      <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border">
                        {req.product_image ? (
                          <img
                            src={req.product_image}
                            alt={req.product_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                            No Image
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <span className="bg-amber-100 text-amber-900 text-[9px] font-bold tracking-widest px-2 py-0.5 rounded uppercase">
                          {req.line || "BESPOKE CUSTOM LINE"}
                        </span>

                        <h3 className="font-serif text-xl font-medium text-gray-900 mt-1 break-words">
                          {req.product_name}
                        </h3>

                        <p className="text-xs text-gray-500 mt-0.5">
                          Occasion / Category:
                          <strong className="text-gray-800 ml-1">
                            {req.product_category || "Bespoke Occasion"}
                          </strong>
                        </p>

                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Created on {formatDate(req.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="text-left md:text-right bg-amber-50/60 p-4 rounded-xl border border-amber-200/60 w-full md:w-auto">
                      <span className="text-[10px] uppercase tracking-wider text-amber-800 block">
                        Cost Blueprint
                      </span>

                      <strong className="text-2xl font-serif font-bold text-gray-900">
                        {req.product_price || "Price on request"}
                      </strong>
                    </div>
                  </div>

                  <div className="bg-[#FAF8F5] border border-gray-200/80 p-4 rounded-xl text-xs text-gray-700 flex items-start gap-3 mb-6">
                    <MessageSquare className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                    <p className="italic">
                      {req.message ||
                        "Your bespoke request has been received by our atelier."}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button
                      onClick={() =>
                        navigate(
                          `/custom-workspace/${req.id}`,
                          {
                            state: {
                              request: req
                            }
                          }
                        )
                      }
                      className="bg-[#1C1816] hover:bg-black text-white py-3 rounded-lg text-xs uppercase tracking-[0.15em] font-semibold text-center transition-colors cursor-pointer"
                    >
                      Open Workspace
                    </button>

                    <button
                      onClick={() =>
                        navigate(
                          `/custom-workspace/${req.id}`,
                          {
                            state: {
                              request: req
                            }
                          }
                        )
                      }
                      className="border border-gray-300 hover:border-black text-gray-800 py-3 rounded-lg text-xs uppercase tracking-[0.15em] font-semibold text-center transition-colors bg-white cursor-pointer"
                    >
                      Discuss Sketch
                    </button>

                    <button
                      onClick={() => deleteRequest(req.id)}
                      className="border border-rose-200 text-rose-700 hover:bg-rose-50 py-3 rounded-lg text-xs uppercase tracking-[0.15em] font-semibold text-center transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Request
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </main>

      </div>

      {/* QUICK VIEW MODAL FOR BEST SELLERS */}
      {quickViewProduct && (
        <div
          className="fixed inset-0 z-[90] bg-black/60 flex items-center justify-center p-4"
          onClick={() => setQuickViewProduct(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2">
              <div className="h-80 sm:h-[420px] bg-gray-100">
                <img
                  src={quickViewProduct.image}
                  alt={quickViewProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-6 sm:p-8 relative flex flex-col justify-center">
                <button
                  onClick={() => setQuickViewProduct(null)}
                  className="absolute top-4 right-4 p-2 text-gray-500 hover:text-black cursor-pointer"
                  aria-label="Close quick view"
                >
                  <X className="w-5 h-5" />
                </button>

                <span className="text-[10px] uppercase tracking-[0.2em] text-amber-700 font-semibold mb-3">
                  {quickViewProduct.tag || "BEST SELLER"}
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
                    setQuickViewProduct(null);
                    handleBespokeCustomDesign(quickViewProduct);
                  }}
                  className="w-full bg-black text-white py-3 text-xs uppercase tracking-[0.2em] font-semibold hover:bg-gray-900 cursor-pointer mb-3 rounded"
                >
                  Custom Design
                </button>

                <button
                  onClick={() => setQuickViewProduct(null)}
                  className="w-full border border-gray-300 text-gray-800 py-3 text-xs uppercase tracking-[0.2em] font-semibold hover:bg-gray-50 cursor-pointer rounded"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
