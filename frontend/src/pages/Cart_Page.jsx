import React, { useState, useEffect } from "react";
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Trash2,
  Loader2,
  CheckCircle2,
  Menu,
  X,
  Bell,
  LayoutDashboard,
  Package,
  Scissors,
  Ruler,
  MapPin,
  Headphones,
  LogOut,
  ChevronRight,
  Settings,
} from "lucide-react";
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://weftin-project.onrender.com";

export default function Cart_Page() {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [toastMessage, setToastMessage] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const [currentUser, setCurrentUser] = useState(null);
  const [userAvatar, setUserAvatar] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  // ============================================================
  // LOAD CART, USER & SYNC ACROSS TABS
  // ============================================================

  useEffect(() => {
    const loadCart = () => {
      try {
        const savedCart =
          JSON.parse(localStorage.getItem("weftin_cart")) || [];
        setCartItems(savedCart);
      } catch (error) {
        console.error("Failed to load cart:", error);
        setCartItems([]);
      }
    };

    loadCart();

    const savedUser = JSON.parse(localStorage.getItem("weftin_user") || "null");
    if (savedUser && savedUser.email) {
      setCurrentUser(savedUser);
      if (savedUser.avatar) setUserAvatar(savedUser.avatar);
      fetchUserAvatar(savedUser.email);
      fetchUnreadCount(savedUser.email);
    }

    const handleStorageChange = (e) => {
      if (e.key === "weftin_cart") {
        loadCart();
      }
      if (e.key === "weftin_user") {
        const updatedUser = JSON.parse(e.newValue || "null");
        if (updatedUser) {
          setCurrentUser(updatedUser);
          if (updatedUser.avatar) setUserAvatar(updatedUser.avatar);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

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

  const fetchUnreadCount = async (email) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/unread-count/${encodeURIComponent(email)}`);
      if (!response.ok) return;
      const data = await response.json();
      setUnreadCount(Number(data.count) || 0);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  };

  const updateCartStorage = (updatedItems) => {
    setCartItems(updatedItems);
    localStorage.setItem(
      "weftin_cart",
      JSON.stringify(updatedItems)
    );
  };

  const handleQuantityChange = (id, delta) => {
    const updated = cartItems.map((item) => {
      if (Number(item.id || item.product_id) === Number(id)) {
        const newQty = Math.max(1, Number(item.qty || 1) + delta);
        return {
          ...item,
          qty: newQty,
        };
      }
      return item;
    });
    updateCartStorage(updated);
  };

  const removeItem = (id) => {
    const updated = cartItems.filter(
      (item) => Number(item.id || item.product_id) !== Number(id)
    );
    updateCartStorage(updated);
    showToast("Item removed from cart.");
  };

  const applyCoupon = () => {
    if (coupon.trim().toUpperCase() === "FESTIVE10") {
      setDiscount(0.1);
      showToast("Coupon FESTIVE10 applied successfully (10% Off)!");
    } else {
      setDiscount(0);
      showToast('Invalid coupon code. Try "FESTIVE10"');
    }
  };

  const parsePrice = (priceStr) => {
    if (typeof priceStr === "number") return priceStr;
    if (!priceStr) return 0;
    const clean = String(priceStr).replace(/[^\d.]/g, "");
    return parseFloat(clean) || 0;
  };

  const subtotal = cartItems.reduce(
    (acc, item) => acc + parsePrice(item.price) * Number(item.qty || 1),
    0
  );

  const discountAmount = subtotal * discount;
  const grandTotal = subtotal - discountAmount;

  const handleProceedToCheckout = async () => {
    if (cartItems.length === 0) {
      showToast("Your shopping bag is empty.");
      return;
    }

    let savedUser = null;
    try {
      savedUser = JSON.parse(localStorage.getItem("weftin_user")) || null;
    } catch (error) {
      console.error("Failed to read user:", error);
    }

    if (!savedUser?.email) {
      showToast("Please sign in before proceeding to checkout.");
      setTimeout(() => navigate("/profile"), 1000);
      return;
    }

    if (isCheckingOut) return;

    setIsCheckingOut(true);
    const token = localStorage.getItem("weftin_token");

    try {
      showToast("Creating your WEFTIN order...");

      const orderRequests = cartItems.map(async (item) => {
        const unitPrice = parsePrice(item.price);
        const quantity = Number(item.qty || 1);
        const itemTotal = unitPrice * quantity;

        const orderData = {
          user_email: savedUser.email,
          product_id: item.product_id || item.productId || (Number.isFinite(Number(item.id)) ? Number(item.id) : null),
          product_name: item.name || "WEFTIN Product",
          product_category: item.category || null,
          product_image: item.image || null,
          quantity: quantity,
          size: item.size || item.sizes?.[0] || null,
          color: item.color || item.shade || null,
          unit_price: unitPrice,
          total_price: itemTotal,
          status: "PROCESSING",
          payment_status: "PENDING",
          shipping_address: null,
          tracking_number: null,
          courier: null,
          estimated_delivery: null,
        };

        const response = await fetch(`${API_BASE_URL}/api/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(orderData),
        });

        if (!response.ok) {
          let errorMessage = "Failed to create order.";
          try {
            const errorData = await response.json();
            errorMessage = errorData.detail || errorMessage;
          } catch {}
          throw new Error(errorMessage);
        }

        return await response.json();
      });

      const createdOrders = await Promise.all(orderRequests);
      localStorage.removeItem("weftin_cart");
      setCartItems([]);
      setDiscount(0);

      showToast(`${createdOrders.length} order${createdOrders.length > 1 ? "s" : ""} placed successfully!`);
      setTimeout(() => navigate("/orders"), 1000);
    } catch (error) {
      console.error("CHECKOUT ERROR:", error);
      showToast(error.message || "Unable to place your order. Please try again.");
    } finally {
      setIsCheckingOut(false);
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

  const userName = currentUser?.name || currentUser?.full_name || currentUser?.username || "WEFTIN Member";
  const userInitial = userName.charAt(0).toUpperCase() || "W";

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-gray-900 font-sans relative">

      {/* TOAST */}
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
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-2 bg-amber-700 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {cartItems.reduce((acc, i) => acc + Number(i.qty || 1), 0)}
                </span>
              )}
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
              <p className="text-[10px] text-gray-500 truncate">{currentUser?.email || "Member Account"}</p>
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

      {/* SHOPPING CART MAIN SECTION */}
      <main className="py-16 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="mb-12">
          <span className="text-[10px] uppercase tracking-[0.25em] text-amber-700 font-semibold block mb-1">
            YOUR CURATED COLLECTION
          </span>
          <h2 className="text-3xl lg:text-4xl font-serif font-light text-gray-900">
            Shopping Cart
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Review your selected WEFTIN pieces before checkout.
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white p-16 rounded-xl border border-gray-200 text-center shadow-sm">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-serif text-xl text-gray-800 mb-2">
              Your shopping bag is currently empty.
            </h3>
            <p className="text-xs text-gray-500 mb-6">
              Explore our curated collections and add your favorite luxury pieces.
            </p>
            <Link
              to="/shop"
              className="bg-black text-white px-8 py-3.5 text-xs uppercase tracking-widest rounded font-semibold inline-block hover:bg-gray-800"
            >
              Explore Collections
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            <div className="lg:col-span-2 space-y-6">
              {cartItems.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row gap-6 relative"
                >
                  <div className="relative w-full sm:w-48 h-64 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <span className="absolute top-2 left-2 z-10 bg-amber-700 text-white text-[9px] uppercase tracking-widest px-2.5 py-1 rounded">
                      {item.tag || "ATELIER"}
                    </span>
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block mb-1">
                            {item.category}
                          </span>
                          <h3 className="font-serif text-xl font-medium text-gray-900">
                            {item.name}
                          </h3>
                        </div>
                        <div className="text-right">
                          <span className="text-xl font-bold text-gray-950">
                            {item.price}
                          </span>
                          <span className="block text-[9px] text-gray-400 uppercase tracking-wider">
                            Price Inclusive of GST
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-dashed border-gray-200 my-4"></div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-gray-400 block mb-0.5">
                            TAILORED SIZE
                          </span>
                          <strong className="text-gray-800">
                            {item.size || "Not Selected"}
                          </strong>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-gray-400 block mb-0.5">
                            COLOR SHADE
                          </span>
                          <span className="flex items-center gap-1.5 font-semibold text-gray-800">
                            <span className="w-2 h-2 rounded-full bg-black inline-block"></span>
                            {item.shade || item.color || "Default"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-between items-center pt-4 border-t border-gray-100 gap-4 mt-4">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => showToast("Moved to Wishlist")}
                          className="text-[11px] uppercase tracking-wider text-gray-600 hover:text-black flex items-center gap-1 cursor-pointer"
                        >
                          <Heart className="w-3.5 h-3.5" />
                          Move to Wishlist
                        </button>

                        <button
                          onClick={() => removeItem(item.id || item.product_id)}
                          className="text-[11px] uppercase tracking-wider text-rose-700 hover:text-rose-900 flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Remove Piece
                        </button>
                      </div>

                      <div className="flex items-center border border-gray-300 rounded bg-gray-50">
                        <span className="text-[10px] uppercase tracking-wider px-3 text-gray-500">
                          QTY
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id || item.product_id, -1)}
                          className="px-2.5 py-1 text-gray-600 hover:text-black font-bold cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-3 text-xs font-semibold">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id || item.product_id, 1)}
                          className="px-2.5 py-1 text-gray-600 hover:text-black font-bold cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm space-y-6">
              <h3 className="font-serif text-lg font-bold text-gray-900 pb-3 border-b border-gray-100">
                BAG SUMMARY
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Selected Piece Subtotal</span>
                  <span className="font-semibold text-gray-900">₹{subtotal.toLocaleString()}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Festive Discount (10%)</span>
                    <span>-₹{discountAmount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Atelier Insured Shipping</span>
                  <span className="text-emerald-700 font-semibold">FREE</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 flex justify-between items-baseline">
                <span className="font-serif font-bold text-base">Grand Total</span>
                <span className="text-2xl font-bold text-gray-950">₹{grandTotal.toLocaleString()}</span>
              </div>

              <div className="pt-2">
                <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-2 font-semibold">
                  Apply Atelier Coupon
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="ENTER COUPON CODE"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    className="flex-1 bg-gray-50 border border-gray-200 text-xs px-3 py-2.5 rounded text-gray-800 uppercase focus:outline-none focus:border-black"
                  />
                  <button
                    onClick={applyCoupon}
                    className="bg-black text-white px-5 py-2.5 text-xs uppercase tracking-wider rounded font-semibold hover:bg-gray-800 cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                <span className="text-[10px] text-gray-400 mt-1 block">
                  *Try entering 'FESTIVE10' for an elite 10% atelier discount.
                </span>
              </div>

              <div className="space-y-3 pt-4">
                <button
                  onClick={handleProceedToCheckout}
                  disabled={isCheckingOut}
                  className={`w-full py-4 rounded text-xs uppercase tracking-[0.2em] font-semibold shadow-lg flex items-center justify-center gap-2 transition cursor-pointer ${
                    isCheckingOut ? "bg-gray-500 cursor-not-allowed" : "bg-[#1C1816] hover:bg-black text-white"
                  }`}
                >
                  {isCheckingOut ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating Order...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Proceed to Checkout
                    </>
                  )}
                </button>

                <Link
                  to="/shop"
                  className="w-full border border-gray-300 py-3 rounded text-xs uppercase tracking-[0.15em] font-semibold text-center block text-gray-700 hover:bg-gray-50"
                >
                  Continue Shopping
                </Link>
              </div>

              <div className="text-center pt-2">
                <span className="text-[10px] text-gray-400 uppercase tracking-widest">
                  Secure SSL. Atelier checkout connection ensured.
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-[#F3EDE2] text-gray-800 pt-16 pb-12 px-6 lg:px-12 border-t border-gray-300">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-gray-300/60">
          <div className="md:col-span-2">
            <h3 className="font-serif text-xl tracking-[0.2em] font-bold mb-4">WEFTIN</h3>
            <p className="text-xs text-gray-600 leading-relaxed mb-4">
              A digital high-fashion atelier marrying heritage luxury craftsmanship with modern silhouettes. Stitched with unparalleled dedication to structural flow.
            </p>
            <p className="text-[11px] text-gray-600"><strong>Concierge:</strong> concierge@weftin.com</p>
            <p className="text-[11px] text-gray-600"><strong>Direct Line:</strong> 1-800-WEFT-LUXE</p>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-900 mb-4">Collections</h4>
            <ul className="space-y-2 text-xs text-gray-600">
              <li><a href="#" className="hover:text-black">Sarees</a></li>
              <li><a href="#" className="hover:text-black">Lehengas</a></li>
              <li><a href="#" className="hover:text-black">Dresses</a></li>
              <li><a href="#" className="hover:text-black">Kurtis</a></li>
              <li><a href="#" className="hover:text-black">Co-Ord Sets</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-900 mb-4">Concierge Care</h4>
            <ul className="space-y-2 text-xs text-gray-600">
              <li><a href="#" className="hover:text-black">Help Center</a></li>
              <li><a href="#" className="hover:text-black">Order Tracking</a></li>
              <li><a href="#" className="hover:text-black">Returns & Adjustments</a></li>
              <li><a href="#" className="hover:text-black">Shipping Policy</a></li>
              <li><a href="#" className="hover:text-black">Fabric Quality Guide</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-900 mb-4">Account</h4>
            <ul className="space-y-2 text-xs text-gray-600">
              <li><Link to="/profile" className="hover:text-black">Sign In</Link></li>
              <li><Link to="/profile" className="hover:text-black">Register Membership</Link></li>
              <li><Link to="/orders" className="hover:text-black">Order History</Link></li>
              <li><Link to="/profile" className="hover:text-black">My Bespoke Fit</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center pt-8 text-[11px] text-gray-500">
          <p>© 2026 WEFTIN Atelier. All Rights Reserved. Crafted with pristine elegance.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-black">Privacy Policy</a>
            <a href="#" className="hover:text-black">Terms of Service</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
