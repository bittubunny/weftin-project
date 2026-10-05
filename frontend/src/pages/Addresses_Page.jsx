import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
  Edit3,
  Trash2,
  X,
  Menu,
  ShoppingCart
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80";

export default function Addresses_Page() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    avatar: DEFAULT_AVATAR
  });

  const [unreadCount, setUnreadCount] = useState(0);

  const [form, setForm] = useState({
    title: "",
    type: "HOME",
    address: "",
    city: "",
    phone: "",
    is_default: false
  });

  const [userEmail, setUserEmail] = useState("");

  // --------------------------------------------------
  // TOAST
  // --------------------------------------------------

  const showToast = (msg) => {
    setToastMessage(msg);

    setTimeout(() => {
      setToastMessage("");
    }, 3000);
  };

  // --------------------------------------------------
  // CLOSE MOBILE MENU
  // --------------------------------------------------

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // --------------------------------------------------
  // GET LOGGED-IN USER
  // --------------------------------------------------

  useEffect(() => {
    const savedUser = localStorage.getItem("weftin_user");

    if (!savedUser) {
      showToast("Please login to manage your addresses.");
      setLoading(false);
      return;
    }

    try {
      const user = JSON.parse(savedUser);

      if (!user.email) {
        showToast("User email not found.");
        setLoading(false);
        return;
      }

      setUserEmail(user.email);

      setProfileData((prev) => ({
        ...prev,
        name: user.name || user.full_name || "",
        email: user.email,
        avatar:
          user.avatar ||
          user.profile_image ||
          user.profile_picture ||
          DEFAULT_AVATAR
      }));

      fetchAddresses(user.email);
      fetchProfile(user.email);
      fetchUnreadNotifications(user.email);
    } catch (error) {
      console.error("Invalid user data:", error);
      showToast("Unable to load user information.");
      setLoading(false);
    }
  }, []);

  // --------------------------------------------------
  // FETCH PROFILE
  // --------------------------------------------------

  const fetchProfile = async (email) => {
    try {
      const response = await fetch(
        `${API_URL}/api/user/${encodeURIComponent(email)}`
      );

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      setProfileData((prev) => ({
        name:
          data.name ||
          data.full_name ||
          data.username ||
          prev.name ||
          "User",

        email: data.email || email,

        avatar:
          data.avatar ||
          data.profile_image ||
          data.profile_picture ||
          prev.avatar ||
          DEFAULT_AVATAR
      }));
    } catch (error) {
      console.error("PROFILE FETCH ERROR:", error);
    }
  };

  // --------------------------------------------------
  // FETCH UNREAD NOTIFICATIONS
  // --------------------------------------------------

  const fetchUnreadNotifications = async (email) => {
    try {
      const response = await fetch(
        `${API_URL}/api/notifications/unread-count/${encodeURIComponent(
          email
        )}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch notification count.");
      }

      const data = await response.json();

      setUnreadCount(Number(data.count) || 0);
    } catch (error) {
      console.error("UNREAD NOTIFICATION COUNT ERROR:", error);
      setUnreadCount(0);
    }
  };

  // --------------------------------------------------
  // KEEP NOTIFICATION COUNT UPDATED
  // --------------------------------------------------

  useEffect(() => {
    if (!userEmail) return;

    fetchUnreadNotifications(userEmail);

    const interval = setInterval(() => {
      fetchUnreadNotifications(userEmail);
    }, 10000);

    return () => clearInterval(interval);
  }, [userEmail]);

  // --------------------------------------------------
  // NOTIFICATION BADGE
  // --------------------------------------------------

  const NotificationBadge = ({ mobile = false, header = false }) => {
    if (unreadCount <= 0) {
      return null;
    }

    if (header) {
      return (
        <span className="absolute -top-1 -right-1 bg-rose-700 text-white text-[9px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center font-bold">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      );
    }

    if (mobile) {
      return (
        <span className="inline-flex bg-rose-700 text-white min-w-4 h-4 px-1 rounded-full items-center justify-center text-[9px] font-bold shrink-0">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      );
    }

    return (
      <span className="bg-rose-700 text-white text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center font-bold shrink-0">
        {unreadCount > 99 ? "99+" : unreadCount}
      </span>
    );
  };

  // --------------------------------------------------
  // FETCH ADDRESSES
  // --------------------------------------------------

  const fetchAddresses = async (email) => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/addresses/${encodeURIComponent(email)}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch addresses.");
      }

      const data = await response.json();

      setAddresses(data);
    } catch (error) {
      console.error("ADDRESS FETCH ERROR:", error);
      showToast("Failed to load addresses.");
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // FORM HANDLING
  // --------------------------------------------------

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  // --------------------------------------------------
  // OPEN ADD MODAL
  // --------------------------------------------------

  const openAddModal = () => {
    setEditingAddress(null);

    setForm({
      title: "",
      type: "HOME",
      address: "",
      city: "",
      phone: "",
      is_default: addresses.length === 0
    });

    setShowModal(true);
  };

  // --------------------------------------------------
  // OPEN EDIT MODAL
  // --------------------------------------------------

  const openEditModal = (address) => {
    setEditingAddress(address);

    setForm({
      title: address.title || "",
      type: address.type || "HOME",
      address: address.address || "",
      city: address.city || "",
      phone: address.phone || "",
      is_default: Boolean(address.is_default)
    });

    setShowModal(true);
  };

  // --------------------------------------------------
  // SAVE ADDRESS
  // --------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userEmail) {
      showToast("User email not found.");
      return;
    }

    if (
      !form.title.trim() ||
      !form.address.trim() ||
      !form.city.trim() ||
      !form.phone.trim()
    ) {
      showToast("Please fill in all required fields.");
      return;
    }

    try {
      let response;

      if (editingAddress) {
        // EDIT
        response = await fetch(
          `${API_URL}/api/addresses/${editingAddress.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              title: form.title,
              type: form.type,
              address: form.address,
              city: form.city,
              phone: form.phone,
              is_default: form.is_default
            })
          }
        );
      } else {
        // CREATE
        response = await fetch(`${API_URL}/api/addresses`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            user_email: userEmail,
            title: form.title,
            type: form.type,
            address: form.address,
            city: form.city,
            phone: form.phone,
            is_default: form.is_default
          })
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.detail || "Failed to save address."
        );
      }

      setShowModal(false);

      setForm({
        title: "",
        type: "HOME",
        address: "",
        city: "",
        phone: "",
        is_default: false
      });

      setEditingAddress(null);

      await fetchAddresses(userEmail);

      showToast(
        editingAddress
          ? "Address updated successfully."
          : "New delivery address added."
      );
    } catch (error) {
      console.error("ADDRESS SAVE ERROR:", error);
      showToast(error.message || "Failed to save address.");
    }
  };

  // --------------------------------------------------
  // DELETE ADDRESS
  // --------------------------------------------------

  const deleteAddress = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this address?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/api/addresses/${id}`,
        {
          method: "DELETE"
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.detail || "Failed to delete address."
        );
      }

      await fetchAddresses(userEmail);

      showToast("Delivery address removed.");
    } catch (error) {
      console.error("ADDRESS DELETE ERROR:", error);
      showToast(error.message || "Failed to delete address.");
    }
  };

  // --------------------------------------------------
  // MAKE DEFAULT
  // --------------------------------------------------

  const setDefaultAddress = async (id) => {
    try {
      const response = await fetch(
        `${API_URL}/api/addresses/${id}/default`,
        {
          method: "PATCH"
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.detail || "Failed to change default address."
        );
      }

      await fetchAddresses(userEmail);

      showToast("Default delivery address updated.");
    } catch (error) {
      console.error("DEFAULT ADDRESS ERROR:", error);
      showToast(
        error.message || "Failed to update default address."
      );
    }
  };

  // --------------------------------------------------
  // CLOSE MODAL
  // --------------------------------------------------

  const closeModal = () => {
    setShowModal(false);
    setEditingAddress(null);

    setForm({
      title: "",
      type: "HOME",
      address: "",
      city: "",
      phone: "",
      is_default: false
    });
  };

  // --------------------------------------------------
  // LOGOUT
  // --------------------------------------------------

  const handleLogout = () => {
    localStorage.removeItem("weftin_user");
    closeMobileMenu();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-gray-900 font-sans flex">

      {/* ================================================= */}
      {/* TOAST */}
      {/* ================================================= */}

      {toastMessage && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-[100] bg-gray-900 text-white px-5 sm:px-6 py-3 rounded-lg shadow-2xl text-sm flex items-center gap-3 border border-amber-500/30 max-w-[calc(100vw-2rem)]">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ================================================= */}
      {/* MOBILE MENU OVERLAY */}
      {/* ================================================= */}

      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* ================================================= */}
      {/* MOBILE SLIDE-IN NAVIGATION */}
      {/* ================================================= */}

      <aside
        className={`md:hidden fixed left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">

          {/* MOBILE LOGO */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">

            <div className="flex items-center gap-3">

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

            <button
              onClick={closeMobileMenu}
              className="p-2 rounded-lg hover:bg-gray-100"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

          </div>

          {/* MOBILE NAVIGATION */}
          <nav className="p-4 space-y-1 text-xs font-medium text-gray-600 overflow-y-auto">

            <Link
              to="/dashboard"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700"
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              Dashboard
            </Link>

            <Link
              to="/orders"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700"
            >
              <Package className="w-4 h-4 shrink-0" />
              My Orders
            </Link>

            <Link
              to="/custom-designs"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700"
            >
              <Scissors className="w-4 h-4 shrink-0" />
              Custom Designs
            </Link>

            <Link
              to="/measurements"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700"
            >
              <Ruler className="w-4 h-4 shrink-0" />
              Measurements
            </Link>

            <Link
              to="/wishlist"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700"
            >
              <Heart className="w-4 h-4 shrink-0" />
              Wishlist
            </Link>

            <Link
              to="/addresses"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-100/60 text-amber-900 font-semibold border-l-4 border-amber-700"
            >
              <MapPin className="w-4 h-4 shrink-0" />
              Addresses
            </Link>

            <Link
              to="/profile"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700"
            >
              <User className="w-4 h-4 shrink-0" />
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

                <span className="truncate">
                  Notifications
                </span>
              </span>

              <NotificationBadge mobile />
            </Link>

            <Link
              to="/support"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700"
            >
              <Headphones className="w-4 h-4 shrink-0" />
              Support
            </Link>

          </nav>

          {/* MOBILE LOGOUT */}
          <div className="mt-auto p-4 border-t border-gray-100">

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-xs text-rose-700 font-semibold hover:bg-rose-50 rounded-lg"
            >
              <LogOut className="w-4 h-4" />
              Log out
            </button>

          </div>

        </div>
      </aside>

      {/* ================================================= */}
      {/* DESKTOP SIDEBAR */}
      {/* ================================================= */}

      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between hidden md:flex sticky top-0 h-screen">

        <div>

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

            <Link
              to="/wishlist"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700"
            >
              <Heart className="w-4 h-4" />
              Wishlist
            </Link>

            <Link
              to="/addresses"
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-100/60 text-amber-900 font-semibold border-l-4 border-amber-700"
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

            {/* DESKTOP NOTIFICATIONS */}
            <Link
              to="/notifications"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700 justify-between"
            >
              <span className="flex items-center gap-3 min-w-0">
                <Bell className="w-4 h-4 shrink-0" />

                <span className="truncate">
                  Notifications
                </span>
              </span>

              <NotificationBadge />
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

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-xs text-rose-700 font-semibold hover:bg-rose-50 rounded-lg"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>

        </div>

      </aside>

      {/* ================================================= */}
      {/* MAIN */}
      {/* ================================================= */}

      <div className="flex-1 flex flex-col min-w-0">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex justify-between items-center">

          {/* LEFT */}
          <div className="flex items-center gap-3 min-w-0">

            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 shrink-0"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5 text-gray-700" />
            </button>

            <div className="text-[10px] sm:text-xs text-gray-400 truncate">

              <span className="hidden sm:inline">
                Portfolio
                <span className="mx-2">&gt;</span>
              </span>

              <span className="text-gray-900 font-semibold uppercase tracking-wider">
                ADDRESSES
              </span>

            </div>

          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">

            {/* CART */}
            <Link
              to="/cart"
              className="relative p-2 rounded-lg hover:bg-gray-50"
              title="Cart"
            >
              <ShoppingCart className="w-5 h-5 text-gray-600" />
            </Link>

            {/* TOP NOTIFICATION */}
            <Link
              to="/notifications"
              className="relative p-2 rounded-lg hover:bg-gray-50"
              title="Notifications"
            >
              <Bell className="w-5 h-5 text-gray-600" />

              <NotificationBadge header />
            </Link>

            {/* USER */}
            <Link
              to="/profile"
              className="flex items-center gap-2 border-l pl-2 sm:pl-4 border-gray-200"
            >

              <img
                src={profileData.avatar || DEFAULT_AVATAR}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover border border-gray-200"
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_AVATAR;
                }}
              />

              <div className="hidden sm:block max-w-[180px]">

                <span className="text-xs font-semibold text-gray-800 block truncate">
                  {profileData.name || "User"}
                </span>

                <span className="text-[10px] text-gray-400 block truncate">
                  {profileData.email || userEmail}
                </span>

              </div>

            </Link>

          </div>

        </header>

        {/* ================================================= */}
        {/* CONTENT */}
        {/* ================================================= */}

        <main className="p-4 sm:p-6 lg:p-8 xl:p-12 max-w-7xl w-full">

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">

            <div>

              <div className="flex items-center gap-2 text-amber-700 mb-1">

                <MapPin className="w-5 h-5" />

                <h2 className="text-2xl sm:text-3xl font-serif text-gray-900">
                  Delivery Addresses
                </h2>

              </div>

              <p className="text-xs text-gray-500 max-w-xl">
                Manage your saved delivery addresses and choose your default destination.
              </p>

            </div>

            <button
              onClick={openAddModal}
              className="w-full sm:w-auto bg-[#1C1816] hover:bg-black text-white px-5 py-3 rounded-lg text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              New Delivery Spot
            </button>

          </div>

          {/* LOADING */}
          {loading && (
            <div className="bg-white border border-gray-200 rounded-xl p-8 sm:p-12 text-center">

              <div className="w-8 h-8 border-2 border-gray-300 border-t-amber-700 rounded-full animate-spin mx-auto mb-4"></div>

              <p className="text-sm text-gray-500">
                Loading your delivery addresses...
              </p>

            </div>
          )}

          {/* EMPTY */}
          {!loading && addresses.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-8 sm:p-12 text-center">

              <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-5">
                <MapPin className="w-7 h-7 text-amber-700" />
              </div>

              <h3 className="font-serif text-xl text-gray-900 mb-2">
                No saved addresses
              </h3>

              <p className="text-sm text-gray-500 mb-6">
                Add your first delivery address to make checkout faster.
              </p>

              <button
                onClick={openAddModal}
                className="bg-gray-900 text-white px-5 py-3 rounded-lg text-xs uppercase tracking-widest font-semibold"
              >
                Add Address
              </button>

            </div>
          )}

          {/* ADDRESSES */}
          {!loading && addresses.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {addresses.map((addr) => (

                <div
                  key={addr.id}
                  className={`bg-white rounded-xl border p-5 sm:p-6 shadow-sm flex flex-col justify-between ${
                    addr.is_default
                      ? "border-amber-600 ring-1 ring-amber-600/30"
                      : "border-gray-200"
                  }`}
                >

                  <div>

                    {/* CARD HEADER */}
                    <div className="flex justify-between items-start mb-4 gap-3">

                      <div className="flex items-center gap-3 min-w-0">

                        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-200 shrink-0">
                          <MapPin className="w-4 h-4" />
                        </div>

                        <div className="min-w-0">

                          <h3 className="font-serif text-base font-bold text-gray-900 truncate">
                            {addr.title}
                          </h3>

                          <span className="bg-amber-100 text-amber-900 text-[8px] font-bold tracking-widest px-2 py-0.5 rounded uppercase">
                            {addr.type}
                          </span>

                        </div>

                      </div>

                      <div className="flex gap-2 shrink-0">

                        <button
                          onClick={() => openEditModal(addr)}
                          className="p-2 border border-gray-200 rounded hover:border-black text-gray-600"
                          title="Edit address"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => deleteAddress(addr.id)}
                          className="p-2 border border-gray-200 rounded hover:border-rose-600 text-rose-700"
                          title="Delete address"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                      </div>

                    </div>

                    {/* ADDRESS */}
                    <div className="text-xs text-gray-600 space-y-1 mb-6">

                      <p className="font-medium text-gray-900 break-words">
                        {addr.address}
                      </p>

                      <p>
                        {addr.city}
                      </p>

                      <p className="text-gray-500 font-mono mt-2 break-all">
                        📞 {addr.phone}
                      </p>

                    </div>

                  </div>

                  {/* FOOTER */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-4 border-t border-gray-100 text-[11px]">

                    <span className="font-mono text-gray-400">
                      ID: AD-{String(addr.id).padStart(2, "0")}
                    </span>

                    {addr.is_default ? (

                      <span className="bg-emerald-100 text-emerald-800 text-[10px] uppercase font-bold px-3 py-1 rounded">
                        ✓ DEFAULT DELIVERY SPOT
                      </span>

                    ) : (

                      <button
                        onClick={() => setDefaultAddress(addr.id)}
                        className="text-amber-800 font-semibold uppercase tracking-wider hover:underline"
                      >
                        Make Default Spot
                      </button>

                    )}

                  </div>

                </div>

              ))}

            </div>
          )}

        </main>

      </div>

      {/* ================================================= */}
      {/* ADD / EDIT ADDRESS MODAL */}
      {/* ================================================= */}

      {showModal && (

        <div className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">

          <div className="bg-white w-full max-w-lg max-h-[95vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">

            {/* MODAL HEADER */}
            <div className="px-5 sm:px-6 py-5 border-b border-gray-200 flex justify-between items-center gap-4">

              <div className="min-w-0">

                <h2 className="font-serif text-xl sm:text-2xl text-gray-900">
                  {editingAddress
                    ? "Edit Delivery Address"
                    : "Add Delivery Address"}
                </h2>

                <p className="text-xs text-gray-500 mt-1">
                  {editingAddress
                    ? "Update your saved delivery information."
                    : "Add a new address for future deliveries."}
                </p>

              </div>

              <button
                onClick={closeModal}
                className="p-2 rounded-lg hover:bg-gray-100 shrink-0"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>

            </div>

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="p-5 sm:p-6 space-y-5 overflow-y-auto"
            >

              {/* TITLE */}
              <div>

                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  ADDRESS TITLE
                </label>

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleInputChange}
                  placeholder="Example: My Home"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-amber-700"
                  required
                />

              </div>

              {/* TYPE */}
              <div>

                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  ADDRESS TYPE
                </label>

                <select
                  name="type"
                  value={form.type}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-amber-700 bg-white"
                >
                  <option value="HOME">Home</option>
                  <option value="WORK">Work</option>
                  <option value="OTHER">Other</option>
                </select>

              </div>

              {/* ADDRESS */}
              <div>

                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  FULL ADDRESS
                </label>

                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleInputChange}
                  placeholder="House / Flat number, Street, Area"
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-amber-700 resize-none"
                  required
                />

              </div>

              {/* CITY */}
              <div>

                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  CITY / STATE / PINCODE
                </label>

                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleInputChange}
                  placeholder="Hyderabad, Telangana — 500081"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-amber-700"
                  required
                />

              </div>

              {/* PHONE */}
              <div>

                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  PHONE NUMBER
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleInputChange}
                  placeholder="+91 98765 43210"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-amber-700"
                  required
                />

              </div>

              {/* DEFAULT */}
              <label className="flex items-center gap-3 cursor-pointer">

                <input
                  type="checkbox"
                  name="is_default"
                  checked={form.is_default}
                  onChange={handleInputChange}
                  className="w-4 h-4 accent-amber-700"
                />

                <span className="text-sm text-gray-700">
                  Make this my default delivery address
                </span>

              </label>

              {/* BUTTONS */}
              <div className="flex gap-3 pt-2">

                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 border border-gray-300 text-gray-700 px-5 py-3 rounded-lg text-xs uppercase tracking-widest font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 bg-[#1C1816] hover:bg-black text-white px-5 py-3 rounded-lg text-xs uppercase tracking-widest font-semibold"
                >
                  {editingAddress
                    ? "Save Changes"
                    : "Save Address"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}