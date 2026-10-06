import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  ShoppingBag,
  Bell,
  LogOut,
  Package,
  Scissors,
  Ruler,
  Heart,
  MapPin,
  Headphones,
  Menu,
  X,
  Truck,
  MessageSquare,
  Sparkles,
  ChevronRight,
  Settings
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://weftin-project.onrender.com";

export default function Dashboard() {
  const navigate = useNavigate();

  const [toastMessage, setToastMessage] = useState('');
  const [savedUser, setSavedUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userAvatar, setUserAvatar] = useState("");
  const [loading, setLoading] = useState(true);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("weftin_user");
      if (!storedUser) {
        navigate("/login");
        return;
      }
      const user = JSON.parse(storedUser);
      if (!user?.email) {
        navigate("/login");
        return;
      }
      setSavedUser(user);
      if (user?.avatar) {
        setUserAvatar(user.avatar);
      }

      // Fetch latest profile avatar from DB
      fetch(`${API_BASE_URL}/api/user/${encodeURIComponent(user.email)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.avatar) {
            setUserAvatar(data.avatar);
          }
        })
        .catch((err) => console.error("Avatar sync error:", err));

      loadDashboardData(user.email);
    } catch (error) {
      console.error("Unable to load user:", error);
      navigate("/login");
    }
  }, [navigate]);

  const loadDashboardData = async (email) => {
    const token = localStorage.getItem("weftin_token");
    try {
      setLoading(true);

      // Fetch unread notifications
      const notifRes = await fetch(
        `${API_BASE_URL}/api/notifications/unread-count/${encodeURIComponent(email)}`
      );
      if (notifRes.ok) {
        const notifData = await notifRes.json();
        setUnreadCount(Number(notifData?.count || 0));
      }

      // Fetch user orders
      const ordersRes = await fetch(
        `${API_BASE_URL}/api/orders/${encodeURIComponent(email)}`,
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        }
      );
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        if (Array.isArray(ordersData)) {
          setRecentOrders(ordersData.slice(0, 3)); // Top 3 recent
        }
      }
    } catch (error) {
      console.error("Dashboard data load error:", error);
    } finally {
      setLoading(false);
    }
  };

  const userEmail = savedUser?.email || "";
  const userName = savedUser?.name || savedUser?.full_name || savedUser?.username || "WEFTIN Member";
  const userInitial = userName.charAt(0).toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("weftin_user");
    localStorage.removeItem("weftin_token");
    setMobileMenuOpen(false);
    navigate("/login");
  };

  const NotificationBadge = ({ sidebar = false }) => {
    if (unreadCount <= 0) return null;
    return (
      <span className={sidebar ? "bg-rose-700 text-white text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center font-bold shrink-0" : "absolute -top-1 -right-2 bg-rose-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold"}>
        {unreadCount > 99 ? "99+" : unreadCount}
      </span>
    );
  };

  const UserAvatar = ({ size = "w-8 h-8" }) => {
    if (userAvatar) {
      return <img src={userAvatar} alt={userName} className={`${size} rounded-full object-cover border border-amber-500 shadow-xs`} />;
    }
    return (
      <div className={`${size} rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-serif font-bold border border-amber-200`}>
        {userInitial}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-gray-900 font-sans flex">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-2xl text-sm animate-fade-in flex items-center gap-3 border border-amber-500/30">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          {toastMessage}
        </div>
      )}

      {/* MOBILE MENU OVERLAY */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity" onClick={closeMobileMenu} />
      )}

      {/* SLIDING NAVIGATION DRAWER (MOBILE & DRAWER) */}
      <aside className={`fixed left-0 top-0 bottom-0 w-80 max-w-[90vw] bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col justify-between ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div>
          {/* DRAWER HEADER */}
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <Link to="/" onClick={closeMobileMenu} className="flex items-center gap-3">
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
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-amber-50/30">
            <UserAvatar size="w-10 h-10" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-900 truncate">
                {userName}
              </p>
              <p className="text-[10px] text-gray-500 truncate">
                {userEmail || "Member Account"}
              </p>
            </div>
          </div>

          {/* COMPLETE NAVIGATION LINKS */}
          <nav className="p-4 space-y-1 text-xs font-medium text-gray-700 overflow-y-auto max-h-[calc(100vh-250px)]">
            <div className="px-3 py-2 text-[10px] uppercase tracking-widest text-gray-400 font-bold">
              Main Pages
            </div>

            <Link to="/" onClick={closeMobileMenu} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-amber-50 hover:text-amber-900 transition-colors group">
              <span className="flex items-center gap-3"><LayoutDashboard className="w-4 h-4 text-amber-700" /> Home</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/shop" onClick={closeMobileMenu} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-amber-50 hover:text-amber-900 transition-colors group">
              <span className="flex items-center gap-3"><ShoppingBag className="w-4 h-4 text-amber-700" /> Shop Catalog</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/collections" onClick={closeMobileMenu} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-amber-50 hover:text-amber-900 transition-colors group">
              <span className="flex items-center gap-3"><Package className="w-4 h-4 text-amber-700" /> Collections</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/custom-designs" onClick={closeMobileMenu} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-amber-50 hover:text-amber-900 transition-colors group">
              <span className="flex items-center gap-3"><Scissors className="w-4 h-4 text-amber-700" /> Custom Designs & Workspace</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/lookbook" onClick={closeMobileMenu} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-amber-50 hover:text-amber-900 transition-colors group">
              <span className="flex items-center gap-3"><Heart className="w-4 h-4 text-amber-700" /> Lookbook Journal</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <div className="pt-3 pb-1 px-3 text-[10px] uppercase tracking-widest text-gray-400 font-bold border-t border-gray-100 mt-2">
              Member Portal & Profile
            </div>

            <Link to="/dashboard" onClick={closeMobileMenu} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-amber-50 text-amber-900 font-semibold transition-colors group">
              <span className="flex items-center gap-3"><LayoutDashboard className="w-4 h-4 text-amber-700" /> Dashboard Overview</span>
              <ChevronRight className="w-3.5 h-3.5 text-amber-700" />
            </Link>
            <Link to="/orders" onClick={closeMobileMenu} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-amber-50 hover:text-amber-900 transition-colors group">
              <span className="flex items-center gap-3"><Package className="w-4 h-4 text-gray-700" /> My Orders & History</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/measurements" onClick={closeMobileMenu} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-amber-50 hover:text-amber-900 transition-colors group">
              <span className="flex items-center gap-3"><Ruler className="w-4 h-4 text-gray-700" /> Bespoke Fit Measurements</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/wishlist" onClick={closeMobileMenu} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-amber-50 hover:text-amber-900 transition-colors group">
              <span className="flex items-center gap-3"><Heart className="w-4 h-4 text-gray-700" /> Saved Wishlist</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/addresses" onClick={closeMobileMenu} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-amber-50 hover:text-amber-900 transition-colors group">
              <span className="flex items-center gap-3"><MapPin className="w-4 h-4 text-gray-700" /> Delivery Addresses</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/profile" onClick={closeMobileMenu} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-amber-50 hover:text-amber-900 transition-colors group">
              <span className="flex items-center gap-3"><User className="w-4 h-4 text-gray-700" /> Member Profile</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/notifications" onClick={closeMobileMenu} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-amber-50 hover:text-amber-900 transition-colors group">
              <span className="flex items-center gap-3"><Bell className="w-4 h-4 text-gray-700" /> Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-rose-700 text-white text-[9px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </Link>
            <Link to="/support" onClick={closeMobileMenu} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-amber-50 hover:text-amber-900 transition-colors group">
              <span className="flex items-center gap-3"><Headphones className="w-4 h-4 text-gray-700" /> Concierge Support</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <div className="pt-3 pb-1 px-3 text-[10px] uppercase tracking-widest text-amber-800 font-bold border-t border-gray-100 mt-2">
              Administration
            </div>
            <Link to="/admin/home-cms" onClick={closeMobileMenu} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-black text-white transition-colors">
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

      {/* LEFT SIDEBAR (Desktop) */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between hidden md:flex sticky top-0 h-screen shrink-0 z-30">
        <div>
          <div className="p-6 border-b border-gray-100">
            <Link to="/" className="block">
              <h1 className="font-serif text-xl tracking-[0.2em] font-bold text-gray-900">WEFTIN</h1>
              <span className="text-[9px] uppercase tracking-[0.25em] text-gray-500">Atelier Tailors</span>
            </Link>
          </div>

          <div className="m-4 p-3 bg-amber-50/60 rounded-xl border border-amber-200/60 flex items-center gap-3">
            <UserAvatar size="w-10 h-10" />
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-gray-900 truncate">{userName}</h4>
              <span className="text-[9px] uppercase font-bold tracking-widest text-amber-800">GOLD MEMBER</span>
            </div>
          </div>

          <nav className="p-4 space-y-1 text-xs font-medium text-gray-700">
            <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-amber-50 text-amber-900 font-semibold rounded-lg border border-amber-200/60">
              <LayoutDashboard className="w-4 h-4 text-amber-700" /> Dashboard
            </Link>
            <Link to="/orders" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
              <Package className="w-4 h-4" /> My Orders
            </Link>
            <Link to="/custom-designs" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
              <Scissors className="w-4 h-4" /> Custom Designs
            </Link>
            <Link to="/measurements" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
              <Ruler className="w-4 h-4" /> Measurements
            </Link>
            <Link to="/wishlist" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
              <Heart className="w-4 h-4" /> Wishlist
            </Link>
            <Link to="/addresses" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
              <MapPin className="w-4 h-4" /> Addresses
            </Link>
            <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
              <User className="w-4 h-4" /> Profile
            </Link>
            <Link to="/notifications" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg justify-between">
              <span className="flex items-center gap-3"><Bell className="w-4 h-4" /> Notifications</span>
              <NotificationBadge sidebar />
            </Link>
            <Link to="/support" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
              <Headphones className="w-4 h-4" /> Support
            </Link>
          </nav>
        </div>

        <div className="p-6 border-t border-gray-100">
          <button onClick={handleLogout} className="flex items-center gap-3 text-xs uppercase tracking-wider text-rose-700 hover:text-rose-900 font-medium cursor-pointer">
            <LogOut className="w-4 h-4" /> Log Out
          </button>
          <span className="block text-[10px] text-gray-400 mt-4">© 2026 WEFTIN Luxury Ltd.</span>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-h-screen min-w-0 md:ml-64">
        
        {/* TOP BAR */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-8 py-4 flex justify-between items-center sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenuOpen(true)} className="p-2 rounded-lg hover:bg-gray-100 cursor-pointer" aria-label="Open menu">
              <Menu className="w-5 h-5 text-gray-700" />
            </button>
            <div className="text-xs uppercase tracking-widest text-gray-500 truncate">
              Portfolio <span className="mx-2">/</span> <span className="text-gray-900 font-semibold">Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            <Link to="/cart" className="relative text-gray-600 hover:text-black transition-colors" title="Shopping Bag">
              <ShoppingBag className="w-5 h-5" />
            </Link>
            <Link to="/notifications" className="relative text-gray-600 hover:text-black" title="Notifications">
              <Bell className="w-5 h-5" />
              <NotificationBadge />
            </Link>
            <Link to="/profile" className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <UserAvatar size="w-9 h-9" />
              <span className="text-xs font-semibold text-gray-800 hidden sm:inline">{userName}</span>
            </Link>
          </div>
        </header>

        {/* DASHBOARD BODY */}
        <div className="p-4 sm:p-8 lg:p-12 max-w-7xl mx-auto w-full space-y-10">
          
          {/* WELCOME BANNER (Stock image removed, replaced with clean luxury editorial layout) */}
          <div className="bg-[#5C1D24] text-white rounded-2xl p-6 sm:p-10 shadow-xl relative overflow-hidden flex flex-col lg:flex-row justify-between items-center gap-8">
            <div className="max-w-2xl w-full">
              <span className="text-xs uppercase tracking-[0.3em] text-amber-300 font-semibold mb-2 block">WELCOME BACK, {userName.toUpperCase()}</span>
              <h2 className="text-3xl font-serif font-light mb-2">WEFTIN GOLD MEMBER</h2>
              <p className="text-gray-200 text-xs mb-6 leading-relaxed">
                Your luxury personal atelier book is active + Free alterations insurance enabled.
              </p>
              
              <div className="bg-black/30 p-4 rounded-xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                <div>
                  <span className="inline-block bg-amber-700/80 text-white px-2 py-0.5 rounded text-[10px] uppercase font-semibold mb-1">Status: Active</span>
                  <span className="block text-amber-300 font-semibold">Atelier Concierge Ready</span>
                  <p className="text-gray-300 text-[11px]">Explore your personalized fittings and orders below.</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => navigate('/orders')} className="bg-white text-gray-900 px-4 py-2 font-semibold uppercase tracking-wider rounded text-[10px] cursor-pointer">
                    View Orders
                  </button>
                  <button onClick={() => navigate('/shop')} className="border border-white/40 text-white px-4 py-2 font-semibold uppercase tracking-wider rounded text-[10px] hover:bg-white/10 cursor-pointer">
                    Continue Shopping
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mt-6">
                <span className="text-xs bg-black/20 px-3 py-1.5 rounded border border-white/10">Total Orders: <strong>{recentOrders.length}</strong></span>
                <span className="text-xs bg-black/20 px-3 py-1.5 rounded border border-white/10">Unread Alerts: <strong>{unreadCount}</strong></span>
              </div>
            </div>
          </div>

          {/* BOUTIQUE WORKSPACE ACTIONS */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {[
              { label: 'Track Order', sub: 'Sync live progress', icon: Truck, path: '/orders' },
              { label: 'Start Custom Design', sub: 'Personalized design request', icon: Sparkles, path: '/custom-designs' },
              { label: 'Fit Profiles', sub: 'Digital measurement book', icon: Ruler, path: '/measurements' },
              { label: 'View Wishlist', sub: 'Explore saved items', icon: Heart, path: '/wishlist' },
              { label: 'Manage Address', sub: 'Edit delivery locations', icon: MapPin, path: '/addresses' },
              { label: 'Contact Support', sub: 'Premium concierge advisories', icon: Headphones, path: '/support' }
            ].map((action, i) => {
              const IconComp = action.icon;
              return (
                <div key={i} onClick={() => navigate(action.path)} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:border-amber-600 transition-colors flex flex-col justify-between">
                  <IconComp className="w-5 h-5 text-amber-700 mb-3" />
                  <div>
                    <h4 className="font-serif text-xs font-bold text-gray-900 mb-1">{action.label}</h4>
                    <p className="text-[10px] text-gray-400">{action.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RECENT ORDERS LEDGER TABLE */}
          <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif text-lg text-gray-900">Recent Orders Ledger</h3>
              <Link to="/orders" className="text-xs text-amber-700 uppercase tracking-widest font-semibold hover:underline">
                See All Orders →
              </Link>
            </div>
            {recentOrders.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-6">No recent orders found. Explore our collections!</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 uppercase tracking-wider">
                      <th className="pb-3">Order ID</th>
                      <th className="pb-3">Product Information</th>
                      <th className="pb-3">Order Date</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {recentOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-gray-50">
                        <td className="py-4 font-semibold text-gray-900">{ord.order_number || ord.id}</td>
                        <td className="py-4 flex items-center gap-3">
                          {ord.product_image && <img src={ord.product_image} alt="" className="w-8 h-10 object-cover rounded" />}
                          {ord.product_name || "WEFTIN Product"}
                        </td>
                        <td className="py-4">{new Date(ord.created_at || Date.now()).toLocaleDateString()}</td>
                        <td className="py-4 font-semibold">₹{Number(ord.total_price || 0).toLocaleString()}</td>
                        <td className="py-4">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            {ord.status || "PROCESSING"}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <button onClick={() => navigate('/orders')} className="bg-black text-white px-3 py-1.5 rounded uppercase text-[10px] cursor-pointer">
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* SUPPORT & LOGGING STREAM GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-serif text-lg text-gray-900 mb-1">Premium Atelier Support Desk</h3>
                <p className="text-xs text-gray-500 mb-6">Need immediate help with custom thread sizes or weavings? Our dedicated advisors are live.</p>
              </div>
              <div className="space-y-3">
                <button onClick={() => navigate('/support')} className="w-full bg-black text-white py-3 rounded text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 cursor-pointer">
                  <MessageSquare className="w-4 h-4 text-emerald-400" /> Open Support Desk
                </button>
              </div>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="font-serif text-lg text-gray-900 mb-1">Atelier Logging Stream</h3>
              <p className="text-xs text-gray-500 mb-6">Real-time status operations ledger</p>
              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
                  <span className="w-2 h-2 rounded-full bg-sky-500 mt-1.5"></span>
                  <div>
                    <strong className="text-gray-900 block">Atelier Session Initialized</strong>
                    <span className="text-[11px] text-gray-500">Secured token validation active across NeonDB.</span>
                    <span className="text-[9px] text-gray-400 block mt-0.5">Active now</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
