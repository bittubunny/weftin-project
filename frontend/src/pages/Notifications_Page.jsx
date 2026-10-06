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
  Menu,
  ChevronRight,
  Settings,
  Search
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
  const [userAvatar, setUserAvatar] = useState("");

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    avatar: DEFAULT_AVATAR
  });

  const [searchText, setSearchText] = useState("");

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
      if (user?.avatar) {
        setUserAvatar(user.avatar);
      }

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

  const userInitial = userName.charAt(0).toUpperCase() || "W";

  // ==================================================
  // LOAD DATABASE PROFILE
  // ==================================================

  useEffect(() => {
    if (!userEmail) {
      return;
    }

    const loadUserProfile = async () => {
      const token = localStorage.getItem("weftin_token");

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/user/${encodeURIComponent(
            userEmail
          )}`,
          {
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {})
            }
          }
        );

        if (!response.ok) {
          throw new Error(
            `Profile request failed: ${response.status}`
          );
        }

        const data = await response.json();

        if (data && data.email) {
          if (data.avatar) {
            setUserAvatar(data.avatar);
          }
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

    const token = localStorage.getItem("weftin_token");

    try {
      setLoading(true);
      setErrorMessage("");

      const response = await fetch(
        `${API_BASE_URL}/api/notifications/${encodeURIComponent(
          userEmail
        )}`,
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        }
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

    const token = localStorage.getItem("weftin_token");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/notifications/${
          notification.id
        }/read?user_email=${encodeURIComponent(
          userEmail
        )}`,
        {
          method: "PUT",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
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

    const token = localStorage.getItem("weftin_token");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/notifications/read-all/${encodeURIComponent(
          userEmail
        )}`,
        {
          method: "PUT",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
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

    const token = localStorage.getItem("weftin_token");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/notifications/${encodeURIComponent(
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

  const NotificationBadge = () => {
    if (unreadCount <= 0) {
      return null;
    }

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
    <div className="min-h-screen bg-[#FAF8F5] text-gray-900 font-sans relative">

      {/* ==================================================
          TOAST
      ================================================== */}

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] bg-gray-900 text-white px-6 py-3 rounded-lg shadow-2xl text-sm flex items-center gap-3 border border-amber-500/30">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0"></span>
          <span className="flex-1">{toastMessage}</span>
          <button
            onClick={() => setToastMessage("")}
            className="text-gray-400 hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
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
              <UserAvatar size="w-7 h-7" />
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
              <ShoppingCart className="w-5 h-5" />
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
            <UserAvatar size="w-10 h-10" />
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
              <span className="flex items-center gap-3"><ShoppingCart className="w-4 h-4 text-amber-700" />Shop Catalog</span>
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
            <Link to="/addresses" onClick={closeMobileMenu} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-amber-50 hover:text-amber-900 transition-colors group">
              <span className="flex items-center gap-3"><MapPin className="w-4 h-4 text-gray-700" />Delivery Addresses</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/profile" onClick={closeMobileMenu} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-amber-50 hover:text-amber-900 transition-colors group">
              <span className="flex items-center gap-3"><User className="w-4 h-4 text-gray-700" />Member Profile</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/notifications" onClick={closeMobileMenu} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-amber-100/60 text-amber-900 font-semibold group">
              <span className="flex items-center gap-3"><Bell className="w-4 h-4 text-amber-700" />Notifications</span>
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

      {/* ==================================================
          PAGE CONTENT
      ================================================== */}

      <main className="p-4 sm:p-6 lg:p-8 xl:p-12 max-w-7xl mx-auto w-full">

        {/* TITLE + ACTIONS */}

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

          {/* ACTION BUTTONS */}

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full xl:w-auto">

            {/* REFRESH */}

            <button
              onClick={loadNotifications}
              disabled={loading}
              className="bg-white border border-gray-300 hover:border-black disabled:opacity-50 text-gray-800 px-3 py-2.5 rounded-lg transition-colors cursor-pointer"
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
              className="flex-1 sm:flex-none bg-white border border-gray-300 hover:border-black disabled:opacity-40 disabled:cursor-not-allowed text-gray-800 px-3 sm:px-4 py-2.5 rounded-lg text-[10px] sm:text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 text-amber-700" />

              Mark all read
            </button>

            {/* CLEAR */}

            <button
              onClick={clearAlarms}
              disabled={notifications.length === 0}
              className="flex-1 sm:flex-none bg-white border border-gray-300 hover:border-rose-600 disabled:opacity-40 disabled:cursor-not-allowed text-rose-700 px-3 sm:px-4 py-2.5 rounded-lg text-[10px] sm:text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />

              Clear Alarms
            </button>

          </div>

        </div>

        {/* ERROR */}

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
                className="mt-3 text-xs font-semibold underline hover:no-underline cursor-pointer"
              >
                Try again
              </button>

            </div>

          </div>
        )}

        {/* EMPTY */}

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

      </main>

    </div>
  );
}
