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
  Edit3,
  Trash2,
  X,
  Menu,
  ShoppingBag,
  ChevronRight,
  Settings,
  Search
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "https://weftin-project.onrender.com";

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80";

export default function Addresses_Page() {
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

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

  // --------------------------------------------------
  // GET LOGGED-IN USER
  // --------------------------------------------------

  useEffect(() => {
    const savedUser = localStorage.getItem("weftin_user");

    if (!savedUser) {
      showToast("Please login to manage your addresses.");
      setLoading(false);
      navigate("/login");
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
  }, [navigate]);

  // --------------------------------------------------
  // FETCH PROFILE
  // --------------------------------------------------

  const fetchProfile = async (email) => {
    const token = localStorage.getItem("weftin_token");

    try {
      const response = await fetch(
        `${API_URL}/api/user/${encodeURIComponent(email)}`,
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

  const NotificationBadge = () => {
    if (unreadCount <= 0) {
      return null;
    }

    return (
      <span className="absolute -top-1 -right-2 bg-rose-700 text-white text-[8px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center font-bold">
        {unreadCount > 99 ? "9+" : unreadCount}
      </span>
    );
  };

  // --------------------------------------------------
  // FETCH ADDRESSES
  // --------------------------------------------------

  const fetchAddresses = async (email) => {
    const token = localStorage.getItem("weftin_token");

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/addresses/${encodeURIComponent(email)}`,
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        }
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

    const token = localStorage.getItem("weftin_token");

    try {
      let response;

      if (editingAddress) {
        response = await fetch(
          `${API_URL}/api/addresses/${editingAddress.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {})
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
        response = await fetch(`${API_URL}/api/addresses`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
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

    const token = localStorage.getItem("weftin_token");

    try {
      const response = await fetch(
        `${API_URL}/api/addresses/${id}`,
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
    const token = localStorage.getItem("weftin_token");

    try {
      const response = await fetch(
        `${API_URL}/api/addresses/${id}/default`,
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

  const userName = profileData.name || "WEFTIN Member";
  const userInitial = userName.charAt(0).toUpperCase() || "W";

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
              <NotificationBadge />
            </Link>

            <Link to="/profile" className="flex items-center gap-2 text-gray-800 hover:text-black">
              {profileData.avatar ? (
                <img src={profileData.avatar} alt={userName} className="w-7 h-7 rounded-full object-cover border border-amber-600 shadow-xs" />
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
            {profileData.avatar ? (
              <img src={profileData.avatar} alt={userName} className="w-10 h-10 rounded-full object-cover border border-amber-600 shadow-xs" />
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

            <div className="pt-3 pb-1 px-3 text-[10px] uppercase tracking-widest text-amber-800 font-bold border-t border-gray-100 mt-2">Member Portal & Profile</div>
            <Link to="/dashboard" onClick={closeMobileMenu} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-amber-50 hover:text-amber-900 transition-colors group">
              <span className="flex items-center gap-3"><LayoutDashboard className="w-4 h-4 text-gray-700" />Dashboard Overview</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/orders" onClick={closeMobileMenu} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-amber-50 hover:text-amber-900 transition-colors group">
              <span className="flex items-center gap-3"><Package className="w-4 h-4 text-gray-700" />My Orders & History</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/measurements" onClick={closeMobileMenu} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-amber-50 hover:text-amber-900 transition-colors group">
              <span className="flex items-center gap-3"><Ruler className="w-4 h-4 text-gray-700" />Bespoke Fit Measurements</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/wishlist" onClick={closeMobileMenu} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-amber-50 hover:text-amber-900 transition-colors group">
              <span className="flex items-center gap-3"><Heart className="w-4 h-4 text-gray-700" />Saved Wishlist</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/addresses" onClick={closeMobileMenu} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-amber-100/60 text-amber-900 font-semibold group">
              <span className="flex items-center gap-3"><MapPin className="w-4 h-4 text-amber-700" />Delivery Addresses</span>
              <ChevronRight className="w-3.5 h-3.5 text-amber-700" />
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

      {/* ================================================= */}
      {/* MAIN CONTENT AREA */}
      {/* ================================================= */}

      <main className="p-4 sm:p-6 lg:p-8 xl:p-12 max-w-7xl mx-auto w-full">

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
            className="w-full sm:w-auto bg-[#1C1816] hover:bg-black text-white px-5 py-3 rounded-lg text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            New Delivery Spot
          </button>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="bg-white border border-gray-200 rounded-xl p-8 sm:p-12 text-center shadow-sm">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-amber-700 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-gray-500">
              Loading your delivery addresses...
            </p>
          </div>
        )}

        {/* EMPTY */}
        {!loading && addresses.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-8 sm:p-12 text-center shadow-sm">
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
              className="bg-gray-900 text-white px-5 py-3 rounded-lg text-xs uppercase tracking-widest font-semibold cursor-pointer"
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
                        className="p-2 border border-gray-200 rounded hover:border-black text-gray-600 cursor-pointer"
                        title="Edit address"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => deleteAddress(addr.id)}
                        className="p-2 border border-gray-200 rounded hover:border-rose-600 text-rose-700 cursor-pointer"
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
                      className="text-amber-800 font-semibold uppercase tracking-wider hover:underline cursor-pointer"
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
                className="p-2 rounded-lg hover:bg-gray-100 shrink-0 cursor-pointer"
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
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-amber-700 bg-gray-50/50"
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
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-amber-700 resize-none bg-gray-50/50"
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
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-amber-700 bg-gray-50/50"
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
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-amber-700 bg-gray-50/50"
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
                  className="w-4 h-4 accent-amber-700 cursor-pointer"
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
                  className="flex-1 border border-gray-300 text-gray-700 px-5 py-3 rounded-lg text-xs uppercase tracking-widest font-semibold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 bg-[#1C1816] hover:bg-black text-white px-5 py-3 rounded-lg text-xs uppercase tracking-widest font-semibold cursor-pointer shadow-sm"
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
