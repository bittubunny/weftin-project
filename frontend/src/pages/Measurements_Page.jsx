import React, { useEffect, useState } from "react";
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
  Trash2,
  Edit3,
  X,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  Menu,
  ChevronRight,
  Settings,
  Search
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
  const navigate = useNavigate();

  const [toastMessage, setToastMessage] = useState("");
  const [profiles, setProfiles] = useState([]);
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [currentUser, setCurrentUser] = useState("");
  const [userAvatar, setUserAvatar] = useState("");

  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [cartCount, setCartCount] = useState(0);

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
     USER & CART SETUP
  ========================= */

  useEffect(() => {
    const savedUser = localStorage.getItem("weftin_user");

    try {
      const user = JSON.parse(savedUser);
      if (user) {
        setCurrentUser(user);
        setUserEmail(user.email || "");
        if (user.avatar) setUserAvatar(user.avatar);
        if (user.email) {
          fetchProfiles(user.email);
          loadUnreadCount(user.email);
          fetchUserAvatar(user.email);
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error("User loading error:", error);
      setLoading(false);
    }

    try {
      const savedCart = JSON.parse(localStorage.getItem("weftin_cart")) || [];
      const total = savedCart.reduce((acc, i) => acc + (Number(i.qty) || 0), 0);
      setCartCount(total);
    } catch (e) {
      setCartCount(0);
    }
  }, []);

  const fetchUserAvatar = async (email) => {
    try {
      const response = await fetch(`${API_URL}/api/user/${encodeURIComponent(email)}`);
      if (!response.ok) return;
      const data = await response.json();
      if (data && data.avatar) {
        setUserAvatar(data.avatar);
      }
    } catch (error) {
      console.error("Failed to fetch user avatar:", error);
    }
  };

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
    "WEFTIN Member";

  const userInitial = userName.charAt(0).toUpperCase() || "W";

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

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

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-gray-900 font-sans relative">

      {/* TOAST */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] bg-gray-900 text-white px-6 py-3 rounded-lg shadow-2xl text-sm flex items-center gap-3 border border-amber-500/30">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP ANNOUNCEMENT BAR */}
      <div className="bg-[#1C1816] text-[#E5D5BC] text-[10px] sm:text-xs py-2 px-4 text-center tracking-[0.15em] sm:tracking-[0.2em] uppercase font-medium">
        LIMITED FESTIVE EDIT — 20% OFF SELECTED COUTURE PIECES
      </div>

      {/* UNIFIED NAVIGATION HEADER */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-gray-200 px-6 lg:px-12 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <form onSubmit={handleSearch} className="hidden lg:flex items-center bg-gray-100 rounded-full px-4 py-2 w-64 border border-gray-200">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input 
              type="text" 
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search anything..." 
              className="bg-transparent text-xs text-gray-800 focus:outline-none w-full" 
            />
          </form>

          <div className="text-center">
            <Link to="/">
              <h1 className="font-serif text-2xl tracking-[0.25em] font-bold text-gray-900">WEFTIN</h1>
            </Link>
          </div>

          <div className="flex items-center gap-5 lg:gap-6">
            <span className="text-xs font-medium text-gray-700 cursor-pointer hidden sm:inline">INR &or;</span>
            
            <Link to="/wishlist" className="text-gray-800 hover:text-black">
              <Heart className="w-5 h-5" />
            </Link>
            
            <Link to="/notifications" className="relative text-gray-800 hover:text-black">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-rose-700 text-white text-[8px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center font-bold">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>

            <Link to="/profile" className="flex items-center gap-2 text-gray-800 hover:text-black">
              {userAvatar ? (
                <img src={userAvatar} alt={userName} className="w-7 h-7 rounded-full object-cover border border-amber-600 shadow-xs" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-serif font-bold border border-amber-300 text-xs">
                  {userInitial}
                </div>
              )}
              <span className="text-xs font-semibold hidden sm:inline max-w-28 truncate">{userName}</span>
            </Link>

            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1 text-gray-800 hover:text-black cursor-pointer flex items-center gap-1.5 border-l pl-4 border-gray-200"
              aria-label="Open navigation drawer"
            >
              <Menu className="w-5 h-5" />
              <span className="text-[10px] uppercase tracking-wider font-semibold hidden lg:inline">Menu</span>
            </button>

            <Link to="/cart" className="relative text-gray-800 hover:text-black">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && <span className="absolute -top-1 -right-2 bg-amber-700 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>}
            </Link>
          </div>
        </div>

        {/* Sub Nav Links */}
        <nav className="hidden md:flex justify-center items-center gap-6 lg:gap-8 mt-4 pt-3 border-t border-gray-200/60 text-[10px] lg:text-xs tracking-[0.15em] uppercase text-gray-700 font-medium">
          <Link to="/" className="hover:text-black transition-colors">Home</Link>
          <Link to="/shop" className="hover:text-black transition-colors">Shop</Link>
          <Link to="/collections" className="hover:text-black transition-colors">Collections</Link>
          <Link to="/custom-designs" className="hover:text-black transition-colors">Custom Design</Link>
          <Link to="/lookbook" className="hover:text-black transition-colors">Lookbook</Link>
          <Link to="/limited" className="hover:text-black transition-colors">Limited Edition</Link>
        </nav>
      </header>

      {/* SLIDING NAVIGATION DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity" onClick={closeMobileMenu} />
      )}

      <aside className={`fixed left-0 top-0 bottom-0 w-80 max-w-[90vw] bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col justify-between ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div>
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <Link to="/" onClick={closeMobileMenu} className="flex items-center gap-3">
              <div className="bg-black text-[#E5D5BC] w-9 h-9 rounded-lg flex items-center justify-center font-serif font-bold text-base shadow-sm">W</div>
              <div>
                <h2 className="font-serif text-sm tracking-[0.2em] font-bold text-gray-900">WEFTIN</h2>
                <span className="text-[9px] uppercase tracking-[0.2em] text-gray-400 block font-medium">ATELIER NAVIGATION</span>
              </div>
            </Link>
            <button onClick={closeMobileMenu} className="p-2 text-gray-500 hover:text-black rounded-full hover:bg-gray-200/50 transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div onClick={() => { closeMobileMenu(); navigate("/profile"); }} className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-amber-50/30 cursor-pointer hover:bg-amber-50/60 transition-colors">
            {userAvatar ? (
              <img src={userAvatar} alt={userName} className="w-10 h-10 rounded-full object-cover border border-amber-600 shadow-xs" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-serif font-bold border border-amber-300">
                {userInitial}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-900 truncate">{userName}</p>
              <p className="text-[10px] text-gray-500 truncate">{userEmail || "Member Account"}</p>
            </div>
          </div>

          <nav className="p-4 space-y-1 text-xs font-medium text-gray-700 overflow-y-auto max-h-[calc(100vh-250px)]">
            <div className="px-3 py-2 text-[10px] uppercase tracking-widest text-gray-400 font-bold">Main Pages</div>
            <Link to="/" onClick={closeMobileMenu} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-amber-50 hover:text-amber-900 transition-colors group">
              <span className="flex items-center gap-3"><LayoutDashboard className="w-4 h-4 text-amber-700" />Home</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/shop" onClick={closeMobileMenu} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-amber-50 hover:text-amber-900 transition-colors group">
              <span className="flex items-center gap-3"><ShoppingBag className="w-4 h-4 text-amber-700" />Shop Catalog</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/collections" onClick={closeMobileMenu} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-amber-50 hover:text-amber-900 transition-colors group">
              <span className="flex items-center gap-3"><Package className="w-4 h-4 text-amber-700" />Collections</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/custom-designs" onClick={closeMobileMenu} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-amber-50 hover:text-amber-900 transition-colors group">
              <span className="flex items-center gap-3"><Scissors className="w-4 h-4 text-amber-700" />Custom Designs & Workspace</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/lookbook" onClick={closeMobileMenu} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-amber-50 hover:text-amber-900 transition-colors group">
              <span className="flex items-center gap-3"><Heart className="w-4 h-4 text-amber-700" />Lookbook Journal</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/limited" onClick={closeMobileMenu} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-amber-50 hover:text-amber-900 transition-colors group">
              <span className="flex items-center gap-3"><span className="w-4 h-4 flex items-center justify-center text-sm">★</span>Limited Edition Drop</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <div className="pt-3 pb-1 px-3 text-[10px] uppercase tracking-widest text-gray-400 font-bold border-t border-gray-100 mt-2">Member Portal & Profile</div>
            <Link to="/dashboard" onClick={closeMobileMenu} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-amber-50 hover:text-amber-900 transition-colors group">
              <span className="flex items-center gap-3"><LayoutDashboard className="w-4 h-4 text-gray-700" />Dashboard Overview</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/orders" onClick={closeMobileMenu} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-amber-50 hover:text-amber-900 transition-colors group">
              <span className="flex items-center gap-3"><Package className="w-4 h-4 text-gray-700" />My Orders & History</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/measurements" onClick={closeMobileMenu} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-amber-100/60 text-amber-900 font-semibold group">
              <span className="flex items-center gap-3"><Ruler className="w-4 h-4 text-amber-700" />Bespoke Fit Measurements</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/wishlist" onClick={closeMobileMenu} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-amber-50 hover:text-amber-900 transition-colors group">
              <span className="flex items-center gap-3"><Heart className="w-4 h-4 text-gray-700" />Saved Wishlist</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/addresses" onClick={closeMobileMenu} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-amber-50 hover:text-amber-900 transition-colors group">
              <span className="flex items-center gap-3"><MapPin className="w-4 h-4 text-gray-700" />Delivery Addresses</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/profile" onClick={closeMobileMenu} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-amber-50 hover:text-amber-900 transition-colors group">
              <span className="flex items-center gap-3"><User className="w-4 h-4 text-gray-700" />Member Profile</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/notifications" onClick={closeMobileMenu} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-amber-50 hover:text-amber-900 transition-colors group">
              <span className="flex items-center gap-3"><Bell className="w-4 h-4 text-gray-700" />Notifications</span>
              {unreadCount > 0 && <span className="bg-rose-700 text-white text-[9px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center font-bold">{unreadCount}</span>}
            </Link>
            <Link to="/support" onClick={closeMobileMenu} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-amber-50 hover:text-amber-900 transition-colors group">
              <span className="flex items-center gap-3"><Headphones className="w-4 h-4 text-gray-700" />Concierge Support</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <div className="pt-3 pb-1 px-3 text-[10px] uppercase tracking-widest text-amber-800 font-bold border-t border-gray-100 mt-2">Administration</div>
            <Link to="/admin/home-cms" onClick={closeMobileMenu} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-black text-white transition-colors">
              <span className="flex items-center gap-3 font-semibold text-amber-300"><Settings className="w-4 h-4" />Admin Product CMS</span>
              <ChevronRight className="w-3.5 h-3.5 text-amber-300" />
            </Link>
          </nav>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs text-rose-700 font-semibold hover:bg-rose-50 rounded-lg transition-colors cursor-pointer border border-rose-200/60 bg-white shadow-2xs">
            <LogOut className="w-4 h-4" /> Log out of account
          </button>
        </div>
      </aside>

      {/* =========================
          CONTENT
      ========================= */}
      <main className="p-4 sm:p-6 lg:p-12 max-w-7xl mx-auto w-full">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="font-serif text-3xl mb-1">Bespoke Fit Measurements</h2>
            <p className="text-xs text-gray-500 leading-relaxed max-w-2xl">
              Save your measurements once and use them across your WEFTIN Atelier orders and custom designs.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 bg-black text-white px-5 py-3 rounded-lg text-xs uppercase tracking-widest font-semibold hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Measurement Profile
          </button>
        </div>

        {loading ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <div className="text-sm text-gray-500">Loading measurements...</div>
          </div>
        ) : profiles.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 sm:p-12 text-center shadow-sm">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-50 flex items-center justify-center mb-5">
              <Ruler className="w-7 h-7 text-amber-700" />
            </div>

            <h2 className="font-serif text-2xl mb-2">No measurement profiles</h2>
            <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed mb-6">
              Create your first measurement profile so you can quickly use your saved measurements for future purchases and custom designs.
            </p>

            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center gap-2 bg-black text-white px-5 py-3 rounded-lg text-xs uppercase tracking-widest font-semibold hover:bg-gray-800 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Measurement
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
              {profiles.map((profile) => {
                const isSelected = selectedProfileId === profile.id;

                return (
                  <button
                    type="button"
                    key={profile.id}
                    onClick={() => setSelectedProfileId(profile.id)}
                    className={`w-full text-left bg-white border rounded-xl p-5 transition-all cursor-pointer ${
                      isSelected
                        ? "border-amber-400 shadow-sm bg-amber-50/10"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-serif text-lg truncate">{profile.name}</h3>
                          {profile.is_default && (
                            <span className="shrink-0 text-[9px] uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                              Default
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-gray-500">
                          {profile.gender} · {profile.preferred_fit || "Regular Fit"}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-2 font-medium">{profile.usage}</p>
                      </div>

                      <Ruler className="w-4 h-4 text-amber-700 shrink-0" />
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-[10px] uppercase font-semibold text-gray-500">{profile.status || "Complete"}</span>
                      <span className={`w-2 h-2 rounded-full ${profile.status === "Complete" ? "bg-emerald-500" : "bg-amber-500"}`} />
                    </div>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={openAddModal}
                className="w-full border border-dashed border-gray-300 rounded-xl p-5 text-gray-500 hover:border-black hover:text-black transition-colors flex items-center justify-center gap-2 text-xs uppercase tracking-wider font-semibold cursor-pointer bg-white"
              >
                <Plus className="w-4 h-4" />
                Add another profile
              </button>
            </div>

            <div className="lg:col-span-2">
              {selectedProfile ? (
                <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 lg:p-8 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5 pb-6 border-b border-gray-100">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-serif text-2xl">{selectedProfile.name}</h2>
                        {selectedProfile.is_default && (
                          <span className="text-[9px] uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {selectedProfile.gender} · {selectedProfile.preferred_fit || "Regular Fit"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(selectedProfile)}
                        className="inline-flex items-center gap-2 border border-gray-200 px-3 py-2 rounded-lg text-xs uppercase tracking-wider font-semibold hover:border-black transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(selectedProfile.id)}
                        className="inline-flex items-center gap-2 border border-rose-200 text-rose-700 px-3 py-2 rounded-lg text-xs uppercase tracking-wider font-semibold hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="py-6">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h3 className="font-serif text-lg">Measurement Details</h3>
                        <p className="text-[10px] text-gray-500 mt-0.5">All measurements are in inches.</p>
                      </div>

                      {!selectedProfile.is_default && (
                        <button
                          type="button"
                          onClick={() => setDefaultProfile(selectedProfile.id)}
                          className="text-xs text-amber-800 font-semibold hover:underline cursor-pointer uppercase tracking-wider"
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
                        ["Total Length", selectedProfile.total_length],
                        ["Inseam", selectedProfile.inseam],
                        ["Neck Cut", selectedProfile.neck_cut],
                        ["Sleeve Sewing", selectedProfile.sleeve_sewing],
                        ["Hemline Length", selectedProfile.hemline_length]
                      ].map(([label, value]) => (
                        <div key={label} className="bg-[#FAF8F5] rounded-lg p-4 border border-gray-100">
                          <p className="text-[9px] uppercase tracking-wider text-gray-400 mb-1">{label}</p>
                          <p className="text-sm font-bold text-gray-800">
                            {value !== null && value !== undefined && value !== "" ? `${value}"` : "—"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedProfile.remarks && (
                    <div className="border-t border-gray-100 pt-6">
                      <h3 className="font-serif text-lg mb-2">Remarks</h3>
                      <p className="text-xs text-gray-600 leading-relaxed italic">"{selectedProfile.remarks}"</p>
                    </div>
                  )}

                  <div className="border-t border-gray-100 mt-6 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-800">Profile Status</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{selectedProfile.status || "Complete"}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Ruler className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-800">Profile Usage</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{selectedProfile.usage || "Default Fit Profile"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-xl p-10 text-center shadow-sm">
                  <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-xs text-gray-500">Select a measurement profile from the left list.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* =========================
          ADD / EDIT MODAL
      ========================= */}
      {showModal && (
        <div className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
            
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="font-serif text-xl">
                  {editingProfile ? "Edit Measurement Profile" : "Add Measurement Profile"}
                </h2>
                <p className="text-[10px] text-gray-500 mt-0.5">Enter your measurements carefully in inches.</p>
              </div>

              <button type="button" onClick={() => setShowModal(false)} className="p-2 text-gray-500 hover:text-black cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-7 text-xs">
              
              <section className="space-y-4">
                <h3 className="font-serif text-base border-b border-gray-100 pb-2">Basic Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1 font-semibold">Profile Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. My Default Fit"
                      className="w-full bg-[#FAF8F5] border border-gray-200 rounded-lg px-3.5 py-3 outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1 font-semibold">Gender</label>
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleInputChange}
                      className="w-full bg-[#FAF8F5] border border-gray-200 rounded-lg px-3.5 py-3 outline-none focus:border-black bg-white"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1 font-semibold">Usage / Category</label>
                    <input
                      type="text"
                      name="usage"
                      value={form.usage}
                      onChange={handleInputChange}
                      className="w-full bg-[#FAF8F5] border border-gray-200 rounded-lg px-3.5 py-3 outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1 font-semibold">Preferred Fit</label>
                    <select
                      name="preferred_fit"
                      value={form.preferred_fit}
                      onChange={handleInputChange}
                      className="w-full bg-[#FAF8F5] border border-gray-200 rounded-lg px-3.5 py-3 outline-none focus:border-black bg-white"
                    >
                      <option value="Slim Fit">Slim Fit</option>
                      <option value="Regular Fit">Regular Fit</option>
                      <option value="Relaxed Fit">Relaxed Fit</option>
                      <option value="Loose Fit">Loose Fit</option>
                    </select>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="font-serif text-base border-b border-gray-100 pb-2">Body Measurements (Inches)</h3>
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
                      <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1 font-semibold">{label}</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        name={name}
                        value={form[name]}
                        onChange={handleInputChange}
                        placeholder="0.0"
                        className="w-full bg-[#FAF8F5] border border-gray-200 rounded-lg px-3.5 py-3 outline-none focus:border-black"
                      />
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="font-serif text-base border-b border-gray-100 pb-2">Additional Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1 font-semibold">Status</label>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleInputChange}
                      className="w-full bg-[#FAF8F5] border border-gray-200 rounded-lg px-3.5 py-3 outline-none focus:border-black bg-white"
                    >
                      <option value="Complete">Complete</option>
                      <option value="Incomplete">Incomplete</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-3 sm:pt-6">
                    <input
                      id="is_default"
                      type="checkbox"
                      name="is_default"
                      checked={form.is_default}
                      onChange={handleInputChange}
                      className="w-4 h-4 accent-black cursor-pointer"
                    />
                    <label htmlFor="is_default" className="text-xs text-gray-700 cursor-pointer font-medium">
                      Set as default measurement profile
                    </label>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1 font-semibold">Remarks</label>
                  <textarea
                    name="remarks"
                    value={form.remarks}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Any fitting preferences or additional notes..."
                    className="w-full bg-[#FAF8F5] border border-gray-200 rounded-lg px-3.5 py-3 outline-none focus:border-black resize-none"
                  />
                </div>
              </section>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg uppercase tracking-wider font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-black text-white rounded-lg uppercase tracking-wider font-semibold hover:bg-gray-800 cursor-pointer shadow-sm"
                >
                  {editingProfile ? "Update Measurements" : "Save Measurements"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
