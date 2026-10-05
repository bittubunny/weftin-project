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
  Trash2,
  Edit3,
  X,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  Menu
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "https://weftin-project.onrender.com";

const emptyForm = {
  name: "",
  gender: "Female",
  usage: "Default Fit Profile",
  height: "",
  preferred_fit: "Regular Fit",
  bust: "",
  waist: "",
  shoulder: "",
  armhole: "",
  hips: "",
  sleeve: "",
  total_length: "",
  inseam: "",
  neck_cut: "",
  sleeve_sewing: "",
  hemline_length: "",
  remarks: "",
  status: "Complete",
  is_default: false
};

export default function Measurements_Page() {
  const [toastMessage, setToastMessage] = useState("");
  const [profiles, setProfiles] = useState([]);
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  /* =========================
     TOAST
  ========================= */

  const showToast = (message) => {
    setToastMessage(message);

    setTimeout(() => {
      setToastMessage("");
    }, 3000);
  };

  /* =========================
     USER
  ========================= */

  useEffect(() => {
    const savedUser = localStorage.getItem("weftin_user");

    if (!savedUser) {
      setLoading(false);
      return;
    }

    try {
      const user = JSON.parse(savedUser);

      setCurrentUser(user);
      setUserEmail(user.email || "");

      if (user.email) {
        fetchProfiles(user.email);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error("User loading error:", error);
      setLoading(false);
    }
  }, []);

  /* =========================
     NOTIFICATION COUNT
  ========================= */

  const loadUnreadCount = async (email) => {
    if (!email) {
      setUnreadCount(0);
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/notifications/unread-count/${encodeURIComponent(
          email
        )}`
      );

      if (!response.ok) return;

      const data = await response.json();

      setUnreadCount(Number(data?.count || 0));
    } catch (error) {
      console.error("Unread notification count error:", error);
    }
  };

  useEffect(() => {
    if (!userEmail) return;

    loadUnreadCount(userEmail);
  }, [userEmail]);

  /* =========================
     NOTIFICATION BADGE
  ========================= */

  const NotificationBadge = ({ sidebar = false }) => {
    if (unreadCount <= 0) return null;

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

  /* =========================
     FETCH MEASUREMENTS
  ========================= */

  const fetchProfiles = async (email) => {
    const token = localStorage.getItem("weftin_token");

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/measurements/${encodeURIComponent(email)}`,
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch measurement profiles");
      }

      const data = await response.json();

      setProfiles(Array.isArray(data) ? data : []);

      if (Array.isArray(data) && data.length > 0) {
        const defaultProfile =
          data.find((profile) => profile.is_default) || data[0];

        setSelectedProfileId(defaultProfile.id);
      } else {
        setSelectedProfileId(null);
      }
    } catch (error) {
      console.error("Fetch measurements error:", error);
      showToast("Failed to load measurements");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     FORM HANDLING
  ========================= */

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  /* =========================
     OPEN ADD MODAL
  ========================= */

  const openAddModal = () => {
    setEditingProfile(null);

    setForm({
      ...emptyForm,
      is_default: profiles.length === 0
    });

    setShowModal(true);
  };

  /* =========================
     OPEN EDIT MODAL
  ========================= */

  const openEditModal = (profile) => {
    setEditingProfile(profile);

    setForm({
      name: profile.name || "",
      gender: profile.gender || "Female",
      usage: profile.usage || "Default Fit Profile",
      height: profile.height || "",
      preferred_fit: profile.preferred_fit || "Regular Fit",
      bust: profile.bust || "",
      waist: profile.waist || "",
      shoulder: profile.shoulder || "",
      armhole: profile.armhole || "",
      hips: profile.hips || "",
      sleeve: profile.sleeve || "",
      total_length: profile.total_length || "",
      inseam: profile.inseam || "",
      neck_cut: profile.neck_cut || "",
      sleeve_sewing: profile.sleeve_sewing || "",
      hemline_length: profile.hemline_length || "",
      remarks: profile.remarks || "",
      status: profile.status || "Complete",
      is_default: Boolean(profile.is_default)
    });

    setShowModal(true);
  };

  /* =========================
     SAVE PROFILE
  ========================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userEmail) {
      showToast("Please login first");
      return;
    }

    const token = localStorage.getItem("weftin_token");

    try {
      const payload = {
        ...form,
        user_email: userEmail
      };

      let response;

      if (editingProfile) {
        response = await fetch(
          `${API_URL}/api/measurements/${editingProfile.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: JSON.stringify(payload)
          }
        );
      } else {
        response = await fetch(`${API_URL}/api/measurements`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify(payload)
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.detail || "Failed to save measurement profile"
        );
      }

      setShowModal(false);
      setEditingProfile(null);
      setForm(emptyForm);

      await fetchProfiles(userEmail);

      showToast(
        editingProfile
          ? "Measurement profile updated"
          : "Measurement profile added"
      );
    } catch (error) {
      console.error("Save measurement error:", error);
      showToast(error.message || "Failed to save measurement profile");
    }
  };

  /* =========================
     DELETE PROFILE
  ========================= */

  const handleDelete = async (profileId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this measurement profile?"
    );

    if (!confirmed) return;

    const token = localStorage.getItem("weftin_token");

    try {
      const response = await fetch(
        `${API_URL}/api/measurements/${profileId}`,
        {
          method: "DELETE",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.detail || "Failed to delete measurement profile"
        );
      }

      await fetchProfiles(userEmail);

      showToast("Measurement profile deleted");
    } catch (error) {
      console.error("Delete measurement error:", error);
      showToast(error.message || "Failed to delete measurement profile");
    }
  };

  /* =========================
     SET DEFAULT
  ========================= */

  const setDefaultProfile = async (profileId) => {
    const token = localStorage.getItem("weftin_token");

    try {
      const response = await fetch(
        `${API_URL}/api/measurements/${profileId}/default`,
        {
          method: "PATCH",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.detail || "Failed to set default profile"
        );
      }

      await fetchProfiles(userEmail);

      showToast("Default measurement profile updated");
    } catch (error) {
      console.error("Default profile error:", error);
      showToast(error.message || "Failed to update default profile");
    }
  };

  /* =========================
     SELECTED PROFILE
  ========================= */

  const selectedProfile =
    profiles.find((profile) => profile.id === selectedProfileId) ||
    profiles.find((profile) => profile.is_default) ||
    profiles[0] ||
    null;

  /* =========================
     USER DISPLAY
  ========================= */

  const userName =
    currentUser?.name ||
    currentUser?.full_name ||
    currentUser?.username ||
    currentUser?.email ||
    "WEFTIN Member";

  const userInitial = userName.charAt(0).toUpperCase();

  const UserAvatar = ({ size = "w-8 h-8" }) => {
    if (currentUser?.avatar) {
      return (
        <img
          src={currentUser.avatar}
          alt={userName}
          className={`${size} rounded-full object-cover border border-amber-500`}
        />
      );
    }

    return (
      <div
        className={`${size} rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-serif font-bold border border-amber-200`}
      >
        {userInitial}
      </div>
    );
  };

  /* =========================
     MOBILE MENU CLOSE
  ========================= */

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  /* =========================
     NAVIGATION
  ========================= */

  const navigationItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard"
    },
    {
      label: "Orders",
      icon: Package,
      path: "/orders"
    },
    {
      label: "Custom Designs",
      icon: Scissors,
      path: "/custom-designs"
    },
    {
      label: "Measurements",
      icon: Ruler,
      path: "/measurements",
      active: true
    },
    {
      label: "Wishlist",
      icon: Heart,
      path: "/wishlist"
    },
    {
      label: "Addresses",
      icon: MapPin,
      path: "/addresses"
    },
    {
      label: "Profile",
      icon: User,
      path: "/profile"
    }
  ];

  /* =========================
     RENDER
  ========================= */

  return (
    <div className="min-h-screen bg-[#faf9f6] text-gray-900">

      {/* =========================
          TOAST
      ========================= */}

      {toastMessage && (
        <div className="fixed top-5 right-5 z-[100] bg-black text-white px-5 py-3 rounded-lg shadow-xl text-sm">
          {toastMessage}
        </div>
      )}

      {/* =========================
          DESKTOP SIDEBAR
      ========================= */}

      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 flex-col z-30">

        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <Link to="/dashboard" className="block">
            <div className="font-serif text-2xl tracking-[0.2em]">
              WEFTIN
            </div>

            <div className="text-[9px] tracking-[0.35em] text-gray-500 mt-1">
              ATELIER
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 text-xs">

          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  item.active
                    ? "bg-amber-50 text-amber-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />

                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* Notifications */}
          <Link
            to="/notifications"
            className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 shrink-0" />

              <span>Notifications</span>
            </div>

            <NotificationBadge sidebar />
          </Link>

          {/* Support */}
          <Link
            to="/support"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <Headphones className="w-4 h-4 shrink-0" />

            <span>Support</span>
          </Link>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-100">
          <Link
            to="/"
            onClick={() => {
              localStorage.removeItem("weftin_user");
              localStorage.removeItem("weftin_token");
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors text-xs"
          >
            <LogOut className="w-4 h-4" />

            <span>Log out</span>
          </Link>
        </div>
      </aside>

      {/* =========================
          MOBILE OVERLAY
      ========================= */}

      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* =========================
          MOBILE SLIDE MENU
      ========================= */}

      <aside
        className={`md:hidden fixed left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Mobile menu header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <Link
            to="/dashboard"
            onClick={closeMobileMenu}
            className="block"
          >
            <div className="font-serif text-xl tracking-[0.2em]">
              WEFTIN
            </div>

            <div className="text-[8px] tracking-[0.35em] text-gray-500 mt-1">
              ATELIER
            </div>
          </Link>

          <button
            type="button"
            onClick={closeMobileMenu}
            className="p-2 text-gray-600 hover:text-black"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile user */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
          <UserAvatar />

          <div className="min-w-0">
            <p className="text-sm font-medium truncate">
              {userName}
            </p>

            <p className="text-[11px] text-gray-500 truncate">
              {userEmail}
            </p>
          </div>
        </div>

        {/* Mobile navigation */}
        <nav className="p-4 space-y-1 text-xs overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                to={item.path}
                onClick={closeMobileMenu}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  item.active
                    ? "bg-amber-50 text-amber-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />

                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* Mobile notifications */}
          <Link
            to="/notifications"
            onClick={closeMobileMenu}
            className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 shrink-0" />

              <span>Notifications</span>
            </div>

            <NotificationBadge sidebar />
          </Link>

          {/* Mobile support */}
          <Link
            to="/support"
            onClick={closeMobileMenu}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <Headphones className="w-4 h-4 shrink-0" />

            <span>Support</span>
          </Link>
        </nav>

        {/* Mobile logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white">
          <Link
            to="/"
            onClick={() => {
              localStorage.removeItem("weftin_user");
              localStorage.removeItem("weftin_token");
              closeMobileMenu();
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors text-xs"
          >
            <LogOut className="w-4 h-4" />

            <span>Log out</span>
          </Link>
        </div>
      </aside>

      {/* =========================
          MAIN AREA
      ========================= */}

      <div className="md:ml-64 min-h-screen">

        {/* =========================
            DESKTOP HEADER
        ========================= */}

        <header className="hidden md:flex bg-white border-b border-gray-200 px-8 py-5 items-center justify-between">

          <div>
            <div className="text-[10px] tracking-[0.25em] text-gray-400 uppercase">
              Portfolio
            </div>

            <h1 className="font-serif text-2xl mt-1">
              Measurements
            </h1>
          </div>

          <div className="flex items-center gap-6">

            {/* Cart */}
            <Link
              to="/cart"
              className="relative text-gray-600 hover:text-black transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
            </Link>

            {/* Notifications */}
            <Link
              to="/notifications"
              className="relative text-gray-600 hover:text-black transition-colors"
            >
              <Bell className="w-5 h-5" />

              <NotificationBadge />
            </Link>

            {/* User */}
            <div className="flex items-center gap-3">
              <UserAvatar />

              <div className="hidden lg:block">
                <p className="text-sm font-medium">
                  {userName}
                </p>

                <p className="text-[10px] text-gray-500">
                  {userEmail}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* =========================
            MOBILE HEADER
        ========================= */}

        <header className="md:hidden bg-white border-b border-gray-200">
          <div className="px-4 py-4 flex items-center justify-between">

            {/* Logo */}
            <Link to="/dashboard" className="block">
              <div className="font-serif text-xl tracking-[0.18em]">
                WEFTIN
              </div>

              <div className="text-[7px] tracking-[0.35em] text-gray-500 mt-1">
                ATELIER
              </div>
            </Link>

            {/* Mobile actions */}
            <div className="flex items-center gap-4">

              {/* Cart */}
              <Link
                to="/cart"
                className="relative text-gray-600 hover:text-black"
              >
                <ShoppingBag className="w-5 h-5" />
              </Link>

              {/* Notifications */}
              <Link
                to="/notifications"
                className="relative text-gray-600 hover:text-black"
              >
                <Bell className="w-5 h-5" />

                <NotificationBadge />
              </Link>

              {/* User avatar */}
              <UserAvatar size="w-8 h-8" />

              {/* Menu */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="text-gray-700 hover:text-black"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </header>

        {/* =========================
            CONTENT
        ========================= */}

        <main className="p-4 sm:p-6 lg:p-12 max-w-7xl w-full">

          {/* Heading */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">

            <div>
              <p className="text-xs text-gray-500 leading-relaxed max-w-2xl">
                Save your measurements once and use them across your
                WEFTIN Atelier orders and custom designs.
              </p>
            </div>

            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center justify-center gap-2 bg-black text-white px-5 py-3 rounded-lg text-xs tracking-wide hover:bg-gray-800 transition-colors"
            >
              <Plus className="w-4 h-4" />

              Add Measurement
            </button>
          </div>

          {/* =========================
              LOADING
          ========================= */}

          {loading ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
              <div className="text-sm text-gray-500">
                Loading measurements...
              </div>
            </div>
          ) : profiles.length === 0 ? (

            /* =========================
               EMPTY STATE
            ========================= */

            <div className="bg-white border border-gray-200 rounded-xl p-8 sm:p-12 text-center">

              <div className="w-16 h-16 mx-auto rounded-full bg-amber-50 flex items-center justify-center mb-5">
                <Ruler className="w-7 h-7 text-amber-700" />
              </div>

              <h2 className="font-serif text-2xl mb-2">
                No measurement profiles
              </h2>

              <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed mb-6">
                Create your first measurement profile so you can
                quickly use your saved measurements for future
                purchases and custom designs.
              </p>

              <button
                type="button"
                onClick={openAddModal}
                className="inline-flex items-center gap-2 bg-black text-white px-5 py-3 rounded-lg text-xs hover:bg-gray-800"
              >
                <Plus className="w-4 h-4" />

                Add Measurement
              </button>
            </div>

          ) : (

            /* =========================
               PROFILES
            ========================= */

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Profile list */}
              <div className="lg:col-span-1 space-y-4">

                {profiles.map((profile) => {
                  const isSelected =
                    selectedProfileId === profile.id;

                  return (
                    <button
                      type="button"
                      key={profile.id}
                      onClick={() =>
                        setSelectedProfileId(profile.id)
                      }
                      className={`w-full text-left bg-white border rounded-xl p-5 transition-all ${
                        isSelected
                          ? "border-amber-400 shadow-sm"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">

                        <div className="min-w-0">

                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-serif text-lg truncate">
                              {profile.name}
                            </h3>

                            {profile.is_default && (
                              <span className="shrink-0 text-[9px] uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                                Default
                              </span>
                            )}
                          </div>

                          <p className="text-[11px] text-gray-500">
                            {profile.gender} ·{" "}
                            {profile.preferred_fit || "Regular Fit"}
                          </p>

                          <p className="text-[10px] text-gray-400 mt-2">
                            {profile.usage}
                          </p>
                        </div>

                        <Ruler className="w-4 h-4 text-gray-400 shrink-0" />
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">

                        <span className="text-[10px] text-gray-500">
                          {profile.status || "Complete"}
                        </span>

                        <span
                          className={`w-2 h-2 rounded-full ${
                            profile.status === "Complete"
                              ? "bg-green-500"
                              : "bg-amber-500"
                          }`}
                        />
                      </div>
                    </button>
                  );
                })}

                {/* Add another */}
                <button
                  type="button"
                  onClick={openAddModal}
                  className="w-full border border-dashed border-gray-300 rounded-xl p-5 text-gray-500 hover:border-gray-500 hover:text-gray-800 transition-colors flex items-center justify-center gap-2 text-xs"
                >
                  <Plus className="w-4 h-4" />

                  Add another profile
                </button>
              </div>

              {/* =========================
                  SELECTED PROFILE
              ========================= */}

              <div className="lg:col-span-2">

                {selectedProfile ? (
                  <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 lg:p-8">

                    {/* Profile header */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5 pb-6 border-b border-gray-100">

                      <div>
                        <div className="flex flex-wrap items-center gap-2">

                          <h2 className="font-serif text-2xl">
                            {selectedProfile.name}
                          </h2>

                          {selectedProfile.is_default && (
                            <span className="text-[9px] uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                              Default
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-gray-500 mt-1">
                          {selectedProfile.gender} ·{" "}
                          {selectedProfile.preferred_fit ||
                            "Regular Fit"}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            openEditModal(selectedProfile)
                          }
                          className="inline-flex items-center gap-2 border border-gray-200 px-3 py-2 rounded-lg text-xs hover:bg-gray-50"
                        >
                          <Edit3 className="w-3.5 h-3.5" />

                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(selectedProfile.id)
                          }
                          className="inline-flex items-center gap-2 border border-rose-200 text-rose-700 px-3 py-2 rounded-lg text-xs hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />

                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Measurements */}
                    <div className="py-6">

                      <div className="flex items-center justify-between mb-5">

                        <div>
                          <h3 className="font-serif text-lg">
                            Measurement Details
                          </h3>

                          <p className="text-[10px] text-gray-500 mt-1">
                            All measurements are in inches.
                          </p>
                        </div>

                        {!selectedProfile.is_default && (
                          <button
                            type="button"
                            onClick={() =>
                              setDefaultProfile(
                                selectedProfile.id
                              )
                            }
                            className="text-[10px] text-amber-800 hover:underline"
                          >
                            Set as default
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">

                        {[
                          ["Height", selectedProfile.height],
                          ["Bust", selectedProfile.bust],
                          ["Waist", selectedProfile.waist],
                          ["Shoulder", selectedProfile.shoulder],
                          ["Armhole", selectedProfile.armhole],
                          ["Hips", selectedProfile.hips],
                          ["Sleeve", selectedProfile.sleeve],
                          [
                            "Total Length",
                            selectedProfile.total_length
                          ],
                          ["Inseam", selectedProfile.inseam],
                          ["Neck Cut", selectedProfile.neck_cut],
                          [
                            "Sleeve Sewing",
                            selectedProfile.sleeve_sewing
                          ],
                          [
                            "Hemline Length",
                            selectedProfile.hemline_length
                          ]
                        ].map(([label, value]) => (
                          <div
                            key={label}
                            className="bg-[#faf9f6] rounded-lg p-4"
                          >
                            <p className="text-[9px] uppercase tracking-wider text-gray-400 mb-1">
                              {label}
                            </p>

                            <p className="text-sm font-medium">
                              {value !== null &&
                              value !== undefined &&
                              value !== ""
                                ? `${value}"`
                                : "—"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Remarks */}
                    {selectedProfile.remarks && (
                      <div className="border-t border-gray-100 pt-6">

                        <h3 className="font-serif text-lg mb-2">
                          Remarks
                        </h3>

                        <p className="text-sm text-gray-600 leading-relaxed">
                          {selectedProfile.remarks}
                        </p>
                      </div>
                    )}

                    {/* Profile info */}
                    <div className="border-t border-gray-100 mt-6 pt-6">

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />

                          <div>
                            <p className="text-xs font-medium">
                              Profile status
                            </p>

                            <p className="text-[10px] text-gray-500 mt-1">
                              {selectedProfile.status ||
                                "Complete"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <Ruler className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />

                          <div>
                            <p className="text-xs font-medium">
                              Usage
                            </p>

                            <p className="text-[10px] text-gray-500 mt-1">
                              {selectedProfile.usage ||
                                "Default Fit Profile"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
                    <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-3" />

                    <p className="text-sm text-gray-500">
                      Select a measurement profile.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* =========================
          ADD / EDIT MODAL
      ========================= */}

      {showModal && (
        <div className="fixed inset-0 z-[90] bg-black/40 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl">

            {/* Modal header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 sm:px-6 py-4 flex items-center justify-between z-10">

              <div>
                <h2 className="font-serif text-xl">
                  {editingProfile
                    ? "Edit Measurement Profile"
                    : "Add Measurement Profile"}
                </h2>

                <p className="text-[10px] text-gray-500 mt-1">
                  Enter your measurements carefully for the best fit.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-500 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal form */}
            <form
              onSubmit={handleSubmit}
              className="p-5 sm:p-6 space-y-7"
            >

              {/* Basic information */}
              <section>
                <h3 className="font-serif text-lg mb-4">
                  Basic Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-2">
                      Profile Name
                    </label>

                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. My Default Fit"
                      className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-2">
                      Gender
                    </label>

                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleInputChange}
                      className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm outline-none focus:border-amber-500 bg-white"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-2">
                      Usage
                    </label>

                    <input
                      type="text"
                      name="usage"
                      value={form.usage}
                      onChange={handleInputChange}
                      className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-2">
                      Preferred Fit
                    </label>

                    <select
                      name="preferred_fit"
                      value={form.preferred_fit}
                      onChange={handleInputChange}
                      className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm outline-none focus:border-amber-500 bg-white"
                    >
                      <option value="Slim Fit">Slim Fit</option>
                      <option value="Regular Fit">
                        Regular Fit
                      </option>
                      <option value="Relaxed Fit">
                        Relaxed Fit
                      </option>
                      <option value="Loose Fit">Loose Fit</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Body measurements */}
              <section>
                <h3 className="font-serif text-lg mb-4">
                  Body Measurements
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">

                  {[
                    ["height", "Height"],
                    ["bust", "Bust"],
                    ["waist", "Waist"],
                    ["shoulder", "Shoulder"],
                    ["armhole", "Armhole"],
                    ["hips", "Hips"],
                    ["sleeve", "Sleeve"],
                    ["total_length", "Total Length"],
                    ["inseam", "Inseam"],
                    ["neck_cut", "Neck Cut"],
                    ["sleeve_sewing", "Sleeve Sewing"],
                    ["hemline_length", "Hemline Length"]
                  ].map(([name, label]) => (
                    <div key={name}>
                      <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-2">
                        {label}
                      </label>

                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        name={name}
                        value={form[name]}
                        onChange={handleInputChange}
                        placeholder="0.0"
                        className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm outline-none focus:border-amber-500"
                      />
                    </div>
                  ))}
                </div>
              </section>

              {/* Additional */}
              <section>
                <h3 className="font-serif text-lg mb-4">
                  Additional Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-2">
                      Status
                    </label>

                    <select
                      name="status"
                      value={form.status}
                      onChange={handleInputChange}
                      className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm outline-none focus:border-amber-500 bg-white"
                    >
                      <option value="Complete">Complete</option>
                      <option value="Incomplete">
                        Incomplete
                      </option>
                    </select>
                  </div>

                  <div className="flex items-center gap-3 sm:pt-6">

                    <input
                      id="is_default"
                      type="checkbox"
                      name="is_default"
                      checked={form.is_default}
                      onChange={handleInputChange}
                      className="w-4 h-4 accent-amber-600"
                    />

                    <label
                      htmlFor="is_default"
                      className="text-xs text-gray-700"
                    >
                      Set as default measurement profile
                    </label>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-2">
                    Remarks
                  </label>

                  <textarea
                    name="remarks"
                    value={form.remarks}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Any fitting preferences or additional notes..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm outline-none focus:border-amber-500 resize-none"
                  />
                </div>
              </section>

              {/* Modal buttons */}
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-100">

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-3 border border-gray-200 rounded-lg text-xs hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-3 bg-black text-white rounded-lg text-xs hover:bg-gray-800"
                >
                  {editingProfile
                    ? "Update Measurements"
                    : "Save Measurements"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
