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
  RefreshCw,
  Truck,
  FileText,
  ShoppingBag,
  AlertCircle,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
  Menu,
  ChevronRight,
  Settings,
  Search
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://weftin-project.onrender.com";

export default function Orders_Page() {
  const navigate = useNavigate();

  // ==================================================
  // USER STATE & INITIALIZATION
  // ==================================================

  const [savedUser, setSavedUser] = useState(null);
  const [userAvatar, setUserAvatar] = useState("");

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("weftin_user");

      if (!storedUser) {
        setSavedUser(null);
        return;
      }

      const user = JSON.parse(storedUser);
      setSavedUser(user);

      if (user?.avatar) {
        setUserAvatar(user.avatar);
      }

      if (user?.email) {
        fetchUserAvatar(user.email);
      }
    } catch (error) {
      console.error(
        "Unable to read user:",
        error
      );

      setSavedUser(null);
    }
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

  const userEmail = savedUser?.email || "";

  const userName =
    savedUser?.name ||
    savedUser?.full_name ||
    savedUser?.username ||
    "WEFTIN Member";

  const userInitial = userName.charAt(0).toUpperCase() || "W";

  // ==================================================
  // COMPONENT STATE & HOOKS
  // ==================================================

  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  // ==================================================
  // TOAST NOTIFICATION UTILITY
  // ==================================================

  const showToast = useCallback((message) => {
    setToastMessage(message);

    window.setTimeout(() => {
      setToastMessage("");
    }, 3000);
  }, []);

  // ==================================================
  // LOAD ORDERS FROM BACKEND
  // ==================================================

  const loadOrders = useCallback(async () => {
    if (!userEmail) {
      setOrders([]);
      setLoading(false);

      setErrorMessage(
        "Please sign in to view your orders."
      );

      return;
    }

    const token = localStorage.getItem("weftin_token");

    try {
      setLoading(true);
      setErrorMessage("");

      const response = await fetch(
        `${API_BASE_URL}/api/orders/${encodeURIComponent(
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
            "Failed to load your orders."
        );
      }

      if (!Array.isArray(data)) {
        throw new Error(
          "Invalid order data received from server."
        );
      }

      setOrders(data);
    } catch (error) {
      console.error(
        "Order loading error:",
        error
      );

      setOrders([]);

      setErrorMessage(
        error?.message ||
          "Unable to load your orders."
      );
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  // ==================================================
  // LOAD UNREAD NOTIFICATION COUNT
  // ==================================================

  const loadUnreadCount = useCallback(async () => {
    if (!userEmail) {
      setUnreadCount(0);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/notifications/unread-count/${encodeURIComponent(
          userEmail
        )}`
      );

      const data = await response.json();

      if (!response.ok) {
        return;
      }

      setUnreadCount(
        Number(data?.count || 0)
      );
    } catch (error) {
      console.error(
        "Unread notification count error:",
        error
      );
    }
  }, [userEmail]);

  // ==================================================
  // INITIAL LOAD EFFECT
  // ==================================================

  useEffect(() => {
    if (!userEmail) {
      setLoading(false);
      return;
    }

    loadOrders();
    loadUnreadCount();
  }, [
    userEmail,
    loadOrders,
    loadUnreadCount
  ]);

  // ==================================================
  // REFRESH HANDLER
  // ==================================================

  const handleRefresh = async () => {
    await Promise.all([
      loadOrders(),
      loadUnreadCount()
    ]);

    showToast(
      "Orders refreshed successfully."
    );
  };

  // ==================================================
  // STATUS NORMALIZATION
  // ==================================================

  const normalizeStatus = (status) => {
    return String(
      status || "PROCESSING"
    )
      .trim()
      .toUpperCase();
  };

  // ==================================================
  // STATUS LABEL FORMATTER
  // ==================================================

  const getStatusLabel = (status) => {
    const normalized =
      normalizeStatus(status);

    const labels = {
      PROCESSING: "PROCESSING",
      CONFIRMED: "CONFIRMED",
      TAILORING: "TAILORING",
      READY_TO_SHIP: "READY TO SHIP",
      SHIPPED: "SHIPPED",
      OUT_FOR_DELIVERY:
        "OUT FOR DELIVERY",
      DELIVERED: "DELIVERED",
      CANCELLED: "CANCELLED"
    };

    return (
      labels[normalized] ||
      normalized.replaceAll("_", " ")
    );
  };

  // ==================================================
  // STATUS STYLE MAPPER
  // ==================================================

  const getStatusStyle = (status) => {
    const normalized =
      normalizeStatus(status);

    switch (normalized) {
      case "PROCESSING":
        return "bg-amber-100 text-amber-800";

      case "CONFIRMED":
        return "bg-blue-100 text-blue-800";

      case "TAILORING":
        return "bg-purple-100 text-purple-800";

      case "READY_TO_SHIP":
        return "bg-cyan-100 text-cyan-800";

      case "SHIPPED":
        return "bg-sky-100 text-sky-800";

      case "OUT_FOR_DELIVERY":
        return "bg-orange-100 text-orange-800";

      case "DELIVERED":
        return "bg-emerald-100 text-emerald-800";

      case "CANCELLED":
        return "bg-rose-100 text-rose-800";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // ==================================================
  // STATUS ICON RENDERER
  // ==================================================

  const getStatusIcon = (status) => {
    const normalized =
      normalizeStatus(status);

    switch (normalized) {
      case "DELIVERED":
        return (
          <CheckCircle2 className="w-3.5 h-3.5" />
        );

      case "CANCELLED":
        return (
          <XCircle className="w-3.5 h-3.5" />
        );

      case "SHIPPED":
      case "OUT_FOR_DELIVERY":
        return (
          <Truck className="w-3.5 h-3.5" />
        );

      case "TAILORING":
        return (
          <Sparkles className="w-3.5 h-3.5" />
        );

      default:
        return (
          <Clock className="w-3.5 h-3.5" />
        );
    }
  };

  // ==================================================
  // DATE FORMATTER
  // ==================================================

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "Date unavailable";
    }

    const date =
      new Date(dateValue);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return String(dateValue);
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );
  };

  // ==================================================
  // PRICE FORMATTER
  // ==================================================

  const formatPrice = (price) => {
    const numericPrice =
      Number(price);

    if (
      Number.isNaN(
        numericPrice
      )
    ) {
      return price
        ? String(price)
        : "₹0";
    }

    return numericPrice.toLocaleString(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2
      }
    );
  };

  // ==================================================
  // ORDER FILTER COMPUTATION
  // ==================================================

  const filteredOrders =
    activeTab === "All"
      ? orders
      : activeTab === "Active"
      ? orders.filter((order) =>
          [
            "PROCESSING",
            "CONFIRMED",
            "TAILORING",
            "READY_TO_SHIP",
            "SHIPPED",
            "OUT_FOR_DELIVERY"
          ].includes(
            normalizeStatus(
              order.status
            )
          )
        )
      : orders.filter(
          (order) =>
            normalizeStatus(
              order.status
            ) ===
            activeTab.toUpperCase()
        );

  // ==================================================
  // TRACK ORDER HANDLER
  // ==================================================

  const handleTrackOrder = (
    order
  ) => {
    const orderNumber =
      order.order_number ||
      order.orderNumber ||
      order.id;

    navigate(
      `/track-order/${encodeURIComponent(
        orderNumber
      )}`,
      {
        state: {
          order
        }
      }
    );
  };

  // ==================================================
  // INVOICE HANDLER
  // ==================================================

  const handleInvoice = (
    order
  ) => {
    const orderNumber =
      order.order_number ||
      order.orderNumber ||
      order.id;

    showToast(
      `Invoice for ${orderNumber} will be available here.`
    );
  };

  // ==================================================
  // REORDER HANDLER
  // ==================================================

  const handleReorder = (
    order
  ) => {
    if (!userEmail) {
      showToast(
        "Please sign in before reordering."
      );

      return;
    }

    try {
      const productId =
        order.product_id;

      if (!productId) {
        showToast(
          "This order cannot be reordered because its product information is unavailable."
        );

        return;
      }

      let cart = [];

      try {
        const storedCart =
          localStorage.getItem(
            "weftin_cart"
          );

        if (storedCart) {
          const parsedCart =
            JSON.parse(storedCart);

          if (Array.isArray(parsedCart)) {
            cart = parsedCart;
          }
        }
      } catch (error) {
        console.error(
          "Unable to read existing cart:",
          error
        );

        cart = [];
      }

      const size =
        order.size || "";

      const color =
        order.color || "";

      const quantity =
        Number(order.quantity) || 1;

      const numericProductId =
        Number(productId);

      const existingIndex =
        cart.findIndex((item) => {
          const itemProductId =
            Number(
              item.product_id ??
              item.productId ??
              item.id
            );

          const itemSize =
            item.size || "";

          const itemColor =
            item.color ||
            item.shade ||
            "";

          return (
            itemProductId ===
              numericProductId &&
            itemSize === size &&
            itemColor === color
          );
        });

      if (existingIndex !== -1) {
        const updatedCart =
          [...cart];

        updatedCart[
          existingIndex
        ] = {
          ...updatedCart[
            existingIndex
          ],

          qty:
            Number(
              updatedCart[
                existingIndex
              ].qty || 0
            ) + quantity
        };

        localStorage.setItem(
          "weftin_cart",
          JSON.stringify(
            updatedCart
          )
        );
      } else {
        const cartItem = {
          id: numericProductId,

          product_id:
            numericProductId,

          name:
            order.product_name ||
            "WEFTIN Product",

          category:
            order.product_category ||
            "",

          image:
            order.product_image ||
            "",

          price:
            `₹${Number(
              order.unit_price || 0
            ).toLocaleString(
              "en-IN"
            )}`,

          size:
            size,

          color:
            color,

          shade:
            color,

          qty:
            quantity,

          tag:
            "ATELIER"
        };

        cart.push(
          cartItem
        );

        localStorage.setItem(
          "weftin_cart",
          JSON.stringify(
            cart
          )
        );
      }

      showToast(
        `${order.product_name || "Item"} added to your bag.`
      );

      window.setTimeout(() => {
        navigate("/cart");
      }, 700);

    } catch (error) {
      console.error(
        "Reorder error:",
        error
      );

      showToast(
        "Unable to reorder this item."
      );
    }
  };

  // ==================================================
  // NAVIGATION HELPERS
  // ==================================================

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

  // ==================================================
  // NOTIFICATION BADGE COMPONENT
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

  // ==================================================
  // LOADING SCREEN
  // ==================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-5 rounded-full border-2 border-gray-200 border-t-amber-700 animate-spin"></div>

          <p className="font-serif text-lg text-gray-900">
            Loading Your Orders
          </p>

          <p className="text-xs text-gray-500 mt-2">
            Retrieving your atelier orders...
          </p>
        </div>
      </div>
    );
  }

  // ==================================================
  // RENDER MAIN COMPONENT
  // ==================================================

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-gray-900 font-sans relative">

      {/* ==================================================
          TOAST NOTIFICATION BANNER
      ================================================== */}

      {toastMessage && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-[100] bg-gray-900 text-white px-5 sm:px-6 py-3 rounded-lg shadow-2xl text-sm flex items-center gap-3 border border-amber-500/30 max-w-[calc(100vw-2rem)] sm:max-w-sm">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0"></span>

          <span className="flex-1">
            {toastMessage}
          </span>

          <button
            onClick={() =>
              setToastMessage("")
            }
            className="text-gray-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ==================================================
          TOP ANNOUNCEMENT BAR
      ================================================== */}

      <div className="bg-[#1C1816] text-[#E5D5BC] text-[10px] sm:text-xs py-2 px-4 text-center tracking-[0.15em] sm:tracking-[0.2em] uppercase font-medium">
        LIMITED FESTIVE EDIT — 20% OFF SELECTED COUTURE PIECES
      </div>

      {/* ==================================================
          UNIFIED NAVIGATION HEADER (MATCHING HOME PAGE)
      ================================================== */}

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

      {/* ==================================================
          SLIDING NAVIGATION DRAWER
      ================================================== */}

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

      {/* ==================================================
          MAIN CONTENT AREA
      ================================================== */}

      <main className="p-4 sm:p-6 lg:p-12 max-w-7xl mx-auto w-full">

        {/* TITLE & TABS */}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">

          <div>
            <h2 className="text-3xl font-serif text-gray-900">
              My Orders & Invoices
            </h2>

            <p className="text-xs text-gray-500 mt-1">
              View real-time status of your current
              and past WEFTIN orders.
            </p>
          </div>

          {/* ACTIONS */}

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">

            <button
              onClick={handleRefresh}
              className="bg-white border border-gray-300 hover:border-black text-gray-800 px-3 py-2.5 rounded-lg cursor-pointer"
              title="Refresh orders"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* FILTER TABS */}

            <div className="flex bg-white border border-gray-200 rounded-lg p-1 text-xs overflow-x-auto max-w-full">

              {[
                "All",
                "Active",
                "Delivered",
                "Cancelled"
              ].map((tab) => (

                <button
                  key={tab}
                  onClick={() =>
                    setActiveTab(tab)
                  }
                  className={`px-4 py-1.5 rounded-md font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === tab
                      ? "bg-amber-100 text-amber-900"
                      : "text-gray-600 hover:text-black"
                  }`}
                >
                  {tab}
                </button>

              ))}

            </div>

          </div>

        </div>

        {/* ==================================================
            ERROR BANNER
        ================================================== */}

        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-5 rounded-xl mb-6 flex items-start gap-3">

            <AlertCircle className="w-5 h-5 flex-shrink-0" />

            <div className="flex-1">

              <p className="text-sm font-semibold">
                Unable to load orders
              </p>

              <p className="text-xs mt-1">
                {errorMessage}
              </p>

              <button
                onClick={loadOrders}
                className="mt-3 text-xs font-semibold underline hover:no-underline cursor-pointer"
              >
                Try again
              </button>

            </div>

          </div>
        )}

        {/* ==================================================
            EMPTY STATE
        ================================================== */}

        {!errorMessage &&
        filteredOrders.length === 0 ? (

          <div className="bg-white p-8 sm:p-16 rounded-xl border border-gray-200 text-center shadow-sm">

            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />

            <h3 className="font-serif text-xl text-gray-800 mb-2">
              {orders.length === 0
                ? "No orders yet."
                : `No ${activeTab.toLowerCase()} orders.`}
            </h3>

            <p className="text-xs text-gray-500 mb-6">
              {orders.length === 0
                ? "Your WEFTIN purchases will appear here after you place an order."
                : "Try another order filter to view your purchases."}
            </p>

            {orders.length === 0 && (
              <Link
                to="/"
                className="inline-flex items-center gap-2 bg-[#1C1816] text-white px-5 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-black cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                Explore Collection
              </Link>
            )}

          </div>

        ) : !errorMessage ? (

          /* ==================================================
              ORDERS GRID
          ================================================== */

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {filteredOrders.map(
              (order) => {

                const orderNumber =
                  order.order_number ||
                  order.orderNumber ||
                  `WF-${order.id}`;

                const status =
                  normalizeStatus(
                    order.status
                  );

                const productName =
                  order.product_name ||
                  order.productName ||
                  "WEFTIN Product";

                const category =
                  order.product_category ||
                  order.category ||
                  "ATELIER";

                const productImage =
                  order.product_image ||
                  order.productImage ||
                  "";

                const quantity =
                  Number(
                    order.quantity
                  ) || 1;

                const totalPrice =
                  order.total_price ??
                  order.totalPrice ??
                  order.price ??
                  0;

                return (
                  <div
                    key={
                      order.id ||
                      orderNumber
                    }
                    className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
                  >

                    <div>

                      {/* ORDER HEADER */}

                      <div className="flex justify-between items-center pb-4 border-b border-gray-100 text-xs gap-4">

                        <span className="font-mono font-bold text-gray-600 truncate">
                          {orderNumber}
                        </span>

                        <span
                          className={`px-2.5 py-1 rounded text-[9px] uppercase font-bold tracking-wider flex items-center gap-1.5 whitespace-nowrap ${getStatusStyle(
                            status
                          )}`}
                        >
                          {getStatusIcon(
                            status
                          )}

                          {getStatusLabel(
                            status
                          )}
                        </span>

                      </div>

                      {/* PRODUCT */}

                      <div className="py-4 flex gap-4 items-center">

                        <div className="w-20 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border">

                          {productImage ? (
                            <img
                              src={
                                productImage
                              }
                              alt={
                                productName
                              }
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-7 h-7 text-gray-300" />
                            </div>
                          )}

                        </div>

                        <div className="min-w-0">

                          <span className="bg-amber-100 text-amber-900 text-[8px] font-bold tracking-widest px-2 py-0.5 rounded uppercase">
                            {category}
                          </span>

                          <h3 className="font-serif text-base font-medium text-gray-900 mt-1">
                            {productName}
                          </h3>

                          <p className="text-[11px] text-gray-500 mt-0.5">
                            Ordered:{" "}
                            {formatDate(
                              order.ordered_at ||
                                order.created_at ||
                                order.date
                            )}
                          </p>

                          {quantity > 0 && (
                            <p className="text-[11px] text-gray-500 mt-0.5">
                              Quantity:{" "}
                              {quantity}
                            </p>
                          )}

                          {order.size && (
                            <p className="text-[11px] text-gray-500 mt-0.5">
                              Size:{" "}
                              {order.size}
                            </p>
                          )}

                          {order.color && (
                            <p className="text-[11px] text-gray-500 mt-0.5">
                              Color:{" "}
                              {order.color}
                            </p>
                          )}

                          <strong className="text-sm text-gray-900 mt-1 block">
                            {formatPrice(
                              totalPrice
                            )}
                          </strong>

                        </div>

                      </div>

                      {/* SHIPPING INFO */}

                      {(order.courier ||
                        order.tracking_number ||
                        order.estimated_delivery) && (

                        <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-100">

                          <div className="flex items-center gap-2 mb-2">

                            <Truck className="w-3.5 h-3.5 text-gray-500" />

                            <span className="text-[9px] uppercase tracking-wider font-bold text-gray-500">
                              Shipping
                            </span>

                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[10px]">

                            {order.courier && (
                              <div>
                                <span className="text-gray-400 block">
                                  Courier
                                </span>

                                <span className="font-semibold text-gray-700">
                                  {order.courier}
                                </span>
                              </div>
                            )}

                            {order.tracking_number && (
                              <div>
                                <span className="text-gray-400 block">
                                  Tracking
                                </span>

                                <span className="font-semibold text-gray-700 break-all">
                                  {order.tracking_number}
                                </span>
                              </div>
                            )}

                            {order.estimated_delivery && (
                              <div>
                                <span className="text-gray-400 block">
                                  Est. Delivery
                                </span>

                                <span className="font-semibold text-gray-700">
                                  {formatDate(
                                    order.estimated_delivery
                                  )}
                                </span>
                              </div>
                            )}

                            {order.payment_status && (
                              <div>
                                <span className="text-gray-400 block">
                                  Payment
                                </span>

                                <span className="font-semibold text-gray-700">
                                  {String(
                                    order.payment_status
                                  ).toUpperCase()}
                                </span>
                              </div>
                            )}

                          </div>

                        </div>
                      )}

                    </div>

                    {/* ACTIONS */}

                    <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-100 text-[10px]">

                      <button
                        onClick={() =>
                          handleTrackOrder(
                            order
                          )
                        }
                        className="py-2.5 bg-[#1C1816] text-white rounded font-semibold uppercase tracking-wider hover:bg-black flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        Track
                      </button>

                      <button
                        onClick={() =>
                          handleInvoice(
                            order
                          )
                        }
                        className="py-2.5 border border-gray-300 text-gray-800 rounded font-semibold uppercase tracking-wider hover:border-black bg-white flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Invoice
                      </button>

                      <button
                        onClick={() =>
                          handleReorder(
                            order
                          )
                        }
                        className="py-2.5 border border-gray-300 text-gray-800 rounded font-semibold uppercase tracking-wider hover:border-black bg-white flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        Reorder
                      </button>

                    </div>

                  </div>
                );
              }
            )}

          </div>

        ) : null}

      </main>

    </div>
  );
}
