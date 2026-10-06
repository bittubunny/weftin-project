import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  ShoppingBag,
  Bell,
  LogOut,
  LayoutDashboard,
  Package,
  Scissors,
  Ruler,
  Heart,
  MapPin,
  Headphones,
  Menu,
  X,
  ChevronRight,
  Settings,
  Search
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://weftin-project.onrender.com";

export default function Profile_Page() {
  const navigate = useNavigate();

  const [toastMessage, setToastMessage] = useState("");
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [cartCount, setCartCount] = useState(0);

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    tier: "WEFTIN Gold Member (Managed Tier)",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
  });

  const [isEditing, setIsEditing] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 3000);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Update initial cart count
  const updateCartCount = () => {
    try {
      const savedCart = JSON.parse(localStorage.getItem("weftin_cart")) || [];
      const total = savedCart.reduce((acc, item) => acc + (Number(item.qty) || 0), 0);
      setCartCount(total);
    } catch (e) {
      setCartCount(0);
    }
  };

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("weftin_user"));

    if (!savedUser || !savedUser.email) {
      navigate("/login");
      return;
    }

    const userEmail = savedUser.email;
    const token = localStorage.getItem("weftin_token");

    updateCartCount();

    fetch(`${API_BASE_URL}/api/user/${encodeURIComponent(userEmail)}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Profile request failed: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.email) {
          setProfileData((prev) => ({
            ...prev,
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
            avatar: data.avatar || prev.avatar,
          }));
        }
      })
      .catch((err) => {
        console.error("Failed to load user profile:", err);
      });

    fetch(
      `${API_BASE_URL}/api/notifications/unread-count/${encodeURIComponent(
        userEmail
      )}`
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            `Notification count request failed: ${res.status}`
          );
        }
        return res.json();
      })
      .then((data) => {
        setUnreadNotificationCount(Number(data.count) || 0);
      })
      .catch((err) => {
        console.error("Failed to load notification count:", err);
        setUnreadNotificationCount(0);
      });
  }, [navigate]);

  const handleSaveProfile = async () => {
    const token = localStorage.getItem("weftin_token");
    const savedUser = JSON.parse(localStorage.getItem("weftin_user")) || {};
    const oldEmail = savedUser.email;

    try {
      const response = await fetch(`${API_BASE_URL}/api/user/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          old_email: oldEmail,
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone,
          avatar: profileData.avatar,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast("Profile details updated successfully in database!");

        savedUser.name = profileData.name;
        savedUser.email = profileData.email;
        savedUser.avatar = profileData.avatar;

        localStorage.setItem(
          "weftin_user",
          JSON.stringify(savedUser)
        );
      } else {
        showToast(data.detail || "Failed to update profile.");
      }
    } catch (err) {
      console.error("Profile update error:", err);
      showToast("Backend connection error.");
    }
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

  const NotificationBadge = () => {
    if (unreadNotificationCount <= 0) {
      return null;
    }

    return (
      <span className="absolute -top-1 -right-2 bg-rose-700 text-white text-[8px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center font-bold">
        {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
      </span>
    );
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
            {profileData.avatar ? (
              <img src={profileData.avatar} alt={userName} className="w-10 h-10 rounded-full object-cover border border-amber-600 shadow-xs" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-serif font-bold border border-amber-300">
                {userInitial}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-900 truncate">{userName}</p>
              <p className="text-[10px] text-gray-500 truncate">{profileData.email || "Member Account"}</p>
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
            <Link to="/measurements" onClick={closeMobileMenu} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-amber-50 hover:text-amber-900 transition-colors group">
              <span className="flex items-center gap-3"><Ruler className="w-4 h-4 text-gray-700" />Bespoke Fit Measurements</span>
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
            <Link to="/profile" onClick={closeMobileMenu} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-amber-100/60 text-amber-900 font-semibold group">
              <span className="flex items-center gap-3"><User className="w-4 h-4 text-amber-700" />Member Profile</span>
              <ChevronRight className="w-3.5 h-3.5 text-amber-700" />
            </Link>
            <Link to="/notifications" onClick={closeMobileMenu} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-amber-50 hover:text-amber-900 transition-colors group">
              <span className="flex items-center gap-3"><Bell className="w-4 h-4 text-gray-700" />Notifications</span>
              {unreadNotificationCount > 0 && <span className="bg-rose-700 text-white text-[9px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center font-bold">{unreadNotificationCount}</span>}
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

      {/* =========================================================
          MAIN CONTENT
      ========================================================= */}
      <main className="flex-1 flex flex-col min-h-screen min-w-0 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 xl:p-12 space-y-8 lg:space-y-10">

        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-light text-gray-900 flex items-start sm:items-center gap-2">
            <User className="w-5 h-5 sm:w-6 sm:h-6 text-amber-700 mt-1 sm:mt-0 shrink-0" />
            <span>
              My Luxury Credentials Portfolio
            </span>
          </h2>

          <p className="text-[11px] sm:text-xs text-gray-500 mt-2 leading-relaxed max-w-3xl">
            Directly connected to NeonDB database. Update your contact, email, and personal specifications below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

          {/* Profile Summary */}
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center text-center">

            <div className="relative mb-4">
              <img
                src={
                  profileData.avatar ||
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250"
                }
                alt="Avatar"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-amber-600 shadow-md"
              />
            </div>

            <h3 className="font-serif text-lg font-semibold text-gray-900 break-words max-w-full">
              {profileData.name || "Atelier Member"}
            </h3>

            <span className="inline-block bg-amber-50 text-amber-800 border border-amber-200 text-[9px] sm:text-[10px] uppercase tracking-widest font-semibold px-3 py-1 rounded-full mt-2 mb-6">
              WEFTIN Gold Member
            </span>

            <div className="w-full text-left space-y-3 text-xs text-gray-600 border-t border-gray-100 pt-4">
              <p className="break-all">
                <strong>Email:</strong>{" "}
                {profileData.email || "Not provided"}
              </p>

              <p>
                <strong>Phone:</strong>{" "}
                {profileData.phone ? (
                  profileData.phone
                ) : (
                  <span className="text-gray-400 italic">
                    Not provided
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Personal Information */}
          <div className="lg:col-span-2 bg-white p-5 sm:p-6 lg:p-8 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">

            <div>
              <h3 className="text-[10px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">
                Personal Information (Database Synced)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6 mb-6">

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-2 font-semibold">
                    Full Legal Name
                  </label>

                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        name: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                    className="w-full bg-gray-50 border border-gray-200 text-xs px-4 py-3 rounded text-gray-800 disabled:opacity-70 focus:outline-none focus:border-black transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-2 font-semibold">
                    Mailing Address Email (Editable Record)
                  </label>

                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        email: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                    className="w-full bg-gray-50 border border-gray-200 text-xs px-4 py-3 rounded text-gray-800 disabled:opacity-70 focus:outline-none focus:border-black transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6 mb-6">

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-2 font-semibold">
                    Contact Phone Number (Include country code e.g., +91)
                  </label>

                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={profileData.phone}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        phone: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                    className="w-full bg-gray-50 border border-gray-200 text-xs px-4 py-3 rounded text-gray-800 disabled:opacity-70 focus:outline-none focus:border-black transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-2 font-semibold">
                    Membership Tier
                  </label>

                  <input
                    type="text"
                    value={profileData.tier}
                    disabled
                    className="w-full bg-gray-100 border border-gray-200 text-xs px-4 py-3 rounded text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-2 font-semibold">
                  Custom Avatar Image URL
                </label>

                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={profileData.avatar}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      avatar: e.target.value,
                    })
                  }
                  disabled={!isEditing}
                  className="w-full bg-gray-50 border border-gray-200 text-xs px-4 py-3 rounded text-gray-800 disabled:opacity-70 focus:outline-none focus:border-black transition-colors"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-100">

              {isEditing && (
                <button
                  onClick={() => setIsEditing(false)}
                  className="w-full sm:w-auto bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 px-6 sm:px-8 py-3 text-xs font-semibold uppercase tracking-[0.15em] rounded transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              )}

              <button
                onClick={() => {
                  if (isEditing) {
                    handleSaveProfile();
                  }

                  setIsEditing(!isEditing);
                }}
                className="w-full sm:w-auto bg-black hover:bg-gray-800 text-white px-6 sm:px-8 py-3 text-xs font-semibold uppercase tracking-[0.15em] rounded transition-colors shadow-sm cursor-pointer"
              >
                {isEditing
                  ? "Save Changes"
                  : "Edit Profile"}
              </button>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
