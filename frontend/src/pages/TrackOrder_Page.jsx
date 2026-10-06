import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useParams, useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Scissors,
  Ruler,
  Heart,
  MapPin,
  User,
  Bell,
  Headphones,
  LogOut,
  ArrowLeft,
  Download,
  Check,
  ShieldCheck,
  RefreshCw,
  XCircle,
  Menu,
  X,
  ShoppingCart,
  Truck,
  ChevronRight,
  Settings,
  Search,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://weftin-project.onrender.com";

export default function TrackOrder_Page() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [savedUser, setSavedUser] = useState(null);
  const [userAvatar, setUserAvatar] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [searchText, setSearchText] = useState("");

  const orderData = location.state?.order || {
    order_number: id || "WF-2026-1042",
    product_name: "Handwoven Silk Saree",
    product_category: "SAREE",
    ordered_at: "June 18, 2026",
    estimated_delivery: "June 22, 2026",
    status: "SHIPPED",
    total_price: "₹8,999",
    product_image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=300"
  };

  const [currentOrderStatus, setCurrentOrderStatus] = useState(
    orderData.status || "SHIPPED"
  );

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  // Load User & Notifications
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("weftin_user");
      if (!storedUser) {
        navigate("/login");
        return;
      }
      const user = JSON.parse(storedUser);
      setSavedUser(user);
      if (user?.avatar) {
        setUserAvatar(user.avatar);
      }
      if (user?.email) {
        loadUnreadCount(user.email);
        fetchUserAvatar(user.email);
      }
    } catch (error) {
      console.error("Unable to load user:", error);
      navigate("/login");
    }
  }, [navigate]);

  const fetchUserAvatar = async (email) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/${encodeURIComponent(email)}`);
      if (!response.ok) return;
      const data = await response.json();
      if (data && data.avatar) {
        setUserAvatar(data.avatar);
      }
    } catch (error) {
      console.error("Failed to fetch user avatar:", error);
    }
  };

  const loadUnreadCount = async (email) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/notifications/unread-count/${encodeURIComponent(email)}`
      );
      if (!response.ok) return;
      const data = await response.json();
      setUnreadCount(Number(data?.count || 0));
    } catch (err) {
      console.error("Unread count error:", err);
    }
  };

  const userEmail = savedUser?.email || "";
  const userName = savedUser?.name || savedUser?.full_name || savedUser?.username || "WEFTIN Member";
  const userInitial = userName.charAt(0).toUpperCase() || "W";

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

  const handleCancelOrder = async () => {
    const orderNum = orderData.order_number || orderData.orderNumber || orderData.id;
    if (!userEmail || !orderNum) return;

    const confirmed = window.confirm("Are you sure you want to cancel this luxury order?");
    if (!confirmed) return;

    setCancelling(true);
    const token = localStorage.getItem("weftin_token");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/orders/${encodeURIComponent(orderNum)}/status?status=CANCELLED&user_email=${encodeURIComponent(userEmail)}`,
        {
          method: "PUT",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.detail || "Failed to cancel order.");
      }

      setCurrentOrderStatus("CANCELLED");
      showToast("Order cancellation request processed successfully.");
    } catch (error) {
      console.error("Cancel order error:", error);
      showToast(error.message || "Unable to cancel order.");
    } finally {
      setCancelling(false);
    }
  };

  const handleDownloadInvoice = () => {
    const orderNum = orderData.order_number || orderData.orderNumber || orderData.id;
    const productName = orderData.product_name || orderData.productName || "WEFTIN Product";
    const orderDate = orderData.ordered_at || orderData.created_at || orderData.date || "Recent";
    const orderPrice = orderData.total_price || orderData.totalPrice || orderData.price || "₹0";
    const paymentStat = orderData.payment_status || "Paid";

    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice - ${orderNum}</title>
        <style>
          body { font-family: serif; padding: 40px; color: #111; background: #FAF8F5; }
          .header { border-bottom: 2px solid #111; padding-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start; }
          .logo { font-size: 28px; font-weight: bold; letter-spacing: 0.2em; }
          .meta { text-align: right; font-size: 12px; font-family: sans-serif; }
          .content { margin-top: 30px; font-family: sans-serif; font-size: 13px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border-bottom: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background: #f4f1ea; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; }
          .total { margin-top: 20px; text-align: right; font-size: 16px; font-family: serif; font-weight: bold; }
          .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #666; font-family: sans-serif; text-transform: uppercase; letter-spacing: 0.15em; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">WEFTIN</div>
            <div style="font-size: 10px; letter-spacing: 0.2em; margin-top: 4px; font-family: sans-serif;">ATELIER TAILORS & LUXURY COUTURE</div>
          </div>
          <div class="meta">
            <strong>Order Receipt / Invoice</strong><br>
            Invoice #: INV-${orderNum}<br>
            Date: ${orderDate}
          </div>
        </div>
        <div class="content">
          <p><strong>Billed To:</strong> ${userName} (${userEmail})</p>
          <table>
            <thead>
              <tr>
                <th>Item Description</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>${productName}</strong><br><span style="font-size:10px; color:#666;">Bespoke Atelier Creation</span></td>
                <td>${currentOrderStatus}</td>
                <td>${paymentStat}</td>
                <td><strong>${orderPrice}</strong></td>
              </tr>
            </tbody>
          </table>
          <div class="total">
            Grand Total: ${orderPrice}
          </div>
        </div>
        <div class="footer">
          © 2026 WEFTIN Atelier. Crafted with pristine elegance. Thank you for your patronage.
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([invoiceHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `WEFTIN_Invoice_${orderNum}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast("Invoice downloaded successfully!");
  };

  const milestones = [
    { title: "Order Placed", desc: "Payment validated successfully via secured pipeline.", date: orderData.ordered_at || "Recent", completed: true },
    { title: "Design & Layout Verified", desc: 'Craft specialists configured fabric alignment check against measurements profile.', date: orderData.ordered_at || "Recent", completed: true },
    { title: "Weaving & Inspection", desc: "Outfit hand finished, pressed, and delicate gold tags applied.", date: orderData.ordered_at || "Recent", completed: true },
    { title: "Shipped via Air Cargo", desc: `Handled by Premium Logistics. AWB: ${orderData.tracking_number || "AWB-3912952A"}.`, date: orderData.ordered_at || "Recent", completed: ["SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].includes(currentOrderStatus) },
    { title: "Delivered Successfully", desc: "Hand delivered with protective luxury box. Returns/Alteration requests are eligible for 10 days.", date: orderData.estimated_delivery || "Expected Soon", completed: currentOrderStatus === "DELIVERED" }
  ];

  const NotificationBadge = () => {
    if (unreadCount <= 0) return null;
    return (
      <span className="absolute -top-1 -right-2 bg-rose-700 text-white text-[8px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center font-bold">
        {unreadCount > 9 ? "9+" : unreadCount}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-gray-900 font-sans relative">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] bg-gray-900 text-white px-6 py-3 rounded-lg shadow-2xl text-sm flex items-center gap-3 border border-amber-500/30">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          {toastMessage}
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

            <div className="pt-3 pb-1 px-3 text-[10px] uppercase tracking-widest text-amber-800 font-bold border-t border-gray-100 mt-2">Member Portal & Profile</div>
            <Link to="/dashboard" onClick={closeMobileMenu} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-amber-50 hover:text-amber-900 transition-colors group">
              <span className="flex items-center gap-3"><LayoutDashboard className="w-4 h-4 text-gray-700" />Dashboard Overview</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/orders" onClick={closeMobileMenu} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-amber-100/60 text-amber-900 font-semibold group">
              <span className="flex items-center gap-3"><Package className="w-4 h-4 text-amber-700" />My Orders & History</span>
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

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 p-8 lg:p-12 max-w-7xl mx-auto space-y-6">
        
        <Link to="/orders" className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-amber-800 font-semibold hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Orders List
        </Link>

        {/* Header Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold block mb-1">ORDER TRACKING • <span className="font-mono">{orderData.order_number || orderData.id}</span></span>
            <h2 className="text-3xl font-serif font-light text-gray-900">{orderData.product_name || orderData.name}</h2>
            <p className="text-xs text-gray-500 mt-1">Ordered on {orderData.ordered_at || orderData.date} • Estimated Arrival: <strong className="text-amber-800">{orderData.estimated_delivery || orderData.arrival}</strong></p>
          </div>
          <button onClick={handleDownloadInvoice} className="bg-white border border-gray-300 hover:border-black text-gray-800 px-5 py-3 rounded-lg text-xs uppercase tracking-wider font-semibold flex items-center gap-2 shadow-sm cursor-pointer">
            <Download className="w-4 h-4 text-amber-700" /> Download Invoice Receipt
          </button>
        </div>

        {/* Grid: Timeline + Order Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Milestones Timeline */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-gray-200 p-8 shadow-sm space-y-6">
            <h3 className="font-serif text-lg font-bold text-gray-900 pb-3 border-b border-gray-100">DETAILED TRACKING MILESTONES</h3>

            <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
              {milestones.map((m, idx) => (
                <div key={idx} className="relative flex items-start gap-4">
                  <span className={`absolute -left-6 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${m.completed ? 'border-amber-700 bg-amber-700 text-white' : 'border-gray-300'}`}>
                    {m.completed && <Check className="w-2.5 h-2.5" />}
                  </span>
                  <div>
                    <h4 className="font-serif text-sm font-semibold text-gray-900">{m.title}</h4>
                    <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{m.desc}</p>
                    <span className="text-[10px] text-gray-400 mt-1 block font-mono">{m.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Order Summary & Actions */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm space-y-6">
              <h3 className="font-serif text-lg font-bold text-gray-900 pb-3 border-b border-gray-100">ORDER INFORMATION</h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center text-gray-600">
                  <span>Status</span>
                  <span className="bg-sky-100 text-sky-800 font-bold px-2.5 py-0.5 rounded text-[10px] uppercase tracking-wider">{currentOrderStatus}</span>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <span>Payment Status</span>
                  <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px] flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> {orderData.payment_status || "Paid"}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600 pt-2 border-t border-gray-100">
                  <span>Product Price</span>
                  <span className="font-semibold text-gray-900">{orderData.total_price || orderData.price}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Premium Wrapping</span>
                  <span className="text-emerald-700 font-semibold">Complimentary</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Cargo Alteration Insurance</span>
                  <span className="font-semibold text-gray-900">Active</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 flex justify-between items-baseline">
                <span className="font-serif font-bold text-base">Grand Total</span>
                <span className="text-2xl font-serif font-bold text-gray-950">{orderData.total_price || orderData.price}</span>
              </div>
            </div>

            {/* Guarantee Notice */}
            <div className="bg-amber-50/50 p-6 rounded-xl border border-amber-200/80 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-serif font-bold text-amber-900 text-sm">
                <ShieldCheck className="w-4 h-4 text-amber-700" /> WEFTIN Guarantee Policy
              </div>
              <p className="text-gray-600 leading-relaxed">
                Custom designs and premium standard sarees include our 10-day complimentary physical fitting correction option. Our tailor will contact you directly to align if required.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {currentOrderStatus !== "CANCELLED" && (
                <button 
                  onClick={handleCancelOrder} 
                  disabled={cancelling}
                  className="w-full bg-white border border-gray-300 hover:border-rose-600 text-rose-700 py-3 rounded-lg text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                >
                  <XCircle className="w-4 h-4" /> {cancelling ? "Processing..." : "Cancel This Luxury Order"}
                </button>
              )}
              <button onClick={() => { showToast('Adding items back to bag'); navigate("/cart"); }} className="w-full bg-[#1C1816] hover:bg-black text-white py-3.5 rounded-lg text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 shadow-sm cursor-pointer">
                <RefreshCw className="w-4 h-4 text-amber-400" /> Instant Reorder Products
              </button>
            </div>

          </div>

        </div>

      </main>

    </div>
  );
}
