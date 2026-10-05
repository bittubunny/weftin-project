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
  Menu
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://weftin-project.onrender.com";

export default function Orders_Page() {
  const navigate = useNavigate();

  // ==================================================
  // USER
  // ==================================================

  const [savedUser, setSavedUser] = useState(null);

  useEffect(() => {
    try {
      const storedUser =
        localStorage.getItem("weftin_user");

      if (!storedUser) {
        setSavedUser(null);
        return;
      }

      const user = JSON.parse(storedUser);

      setSavedUser(user);
    } catch (error) {
      console.error(
        "Unable to read user:",
        error
      );

      setSavedUser(null);
    }
  }, []);

  const userEmail =
    savedUser?.email || "";

  const userName =
    savedUser?.name ||
    savedUser?.full_name ||
    savedUser?.username ||
    "WEFTIN Member";

  // ==================================================
  // STATE
  // ==================================================

  const [orders, setOrders] =
    useState([]);

  const [activeTab, setActiveTab] =
    useState("All");

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [toastMessage, setToastMessage] =
    useState("");

  const [unreadCount, setUnreadCount] =
    useState(0);

  // MOBILE MENU
  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

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
  // LOAD ORDERS
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

    try {
      setLoading(true);
      setErrorMessage("");

      const response = await fetch(
        `${API_BASE_URL}/api/orders/${encodeURIComponent(
          userEmail
        )}`
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

  const loadUnreadCount =
    useCallback(async () => {
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
  // INITIAL LOAD
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
  // REFRESH
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
  // STATUS
  // ==================================================

  const normalizeStatus = (status) => {
    return String(
      status || "PROCESSING"
    )
      .trim()
      .toUpperCase();
  };

  // ==================================================
  // STATUS LABEL
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
  // STATUS STYLE
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
  // STATUS ICON
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
  // DATE FORMAT
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
  // PRICE FORMAT
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
  // FILTER
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
  // TRACK ORDER
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
  // INVOICE
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
  // REORDER
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

      // ----------------------------------------------
      // READ EXISTING CART
      // ----------------------------------------------

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

      // ----------------------------------------------
      // ORDER DETAILS
      // ----------------------------------------------

      const size =
        order.size || "";

      const color =
        order.color || "";

      const quantity =
        Number(order.quantity) || 1;

      const numericProductId =
        Number(productId);

      // ----------------------------------------------
      // CHECK IF SAME ITEM ALREADY EXISTS
      // ----------------------------------------------

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

      // ----------------------------------------------
      // ALREADY IN CART
      // ----------------------------------------------

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
      }

      // ----------------------------------------------
      // NOT IN CART → ADD ITEM
      // ----------------------------------------------

      else {
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

      // ----------------------------------------------
      // SUCCESS
      // ----------------------------------------------

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
  // MOBILE NAVIGATION
  // ==================================================

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // ==================================================
  // NOTIFICATION BADGE
  // ==================================================

  const NotificationBadge = ({
    sidebar = false
  }) => {
    if (unreadCount <= 0) {
      return null;
    }

    return (
      <span
        className={
          sidebar
            ? "bg-rose-700 text-white text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center font-bold shrink-0"
            : "absolute -top-2 -right-2 bg-rose-700 text-white text-[8px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center font-bold"
        }
      >
        {unreadCount > 99
          ? "99+"
          : unreadCount}
      </span>
    );
  };

  // ==================================================
  // USER AVATAR
  // ==================================================

  const UserAvatar = ({
    mobile = false
  }) => {
    if (savedUser?.avatar) {
      return (
        <img
          src={savedUser.avatar}
          alt={userName}
          className={
            mobile
              ? "w-8 h-8 rounded-full object-cover border border-amber-500"
              : "w-8 h-8 rounded-full object-cover border"
          }
        />
      );
    }

    return (
      <div
        className={
          mobile
            ? "w-8 h-8 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-serif font-bold border border-amber-300"
            : "w-8 h-8 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-serif font-bold border"
        }
      >
        {userName
          .charAt(0)
          .toUpperCase()}
      </div>
    );
  };

  // ==================================================
  // LOADING
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
  // MAIN
  // ==================================================

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-gray-900 font-sans flex">

      {/* ==================================================
          TOAST
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
          DESKTOP SIDEBAR
      ================================================== */}

      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between hidden md:flex sticky top-0 h-screen">

        <div>

          {/* BRAND */}

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

          {/* NAVIGATION */}

          <nav className="p-4 space-y-1 text-xs font-medium text-gray-600">

            <Link
              to="/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>

            {/* ACTIVE ORDERS */}

            <Link
              to="/orders"
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-100/60 text-amber-900 font-semibold border-l-4 border-amber-700"
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
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700"
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

            {/* NOTIFICATIONS */}

            <Link
              to="/notifications"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700 justify-between"
            >
              <span className="flex items-center gap-3">
                <Bell className="w-4 h-4" />
                Notifications
              </span>

              <NotificationBadge sidebar />
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

        {/* LOGOUT */}

        <div className="p-4 border-t border-gray-100">

          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-2 text-xs text-rose-700 font-semibold hover:bg-rose-50 rounded-lg"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </Link>

        </div>

      </aside>

      {/* ==================================================
          MOBILE MENU OVERLAY
      ================================================== */}

      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* ==================================================
          MOBILE SLIDE-IN NAVIGATION
      ================================================== */}

      <aside
        className={`md:hidden fixed left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >

        {/* MOBILE MENU HEADER */}

        <div className="p-5 border-b border-gray-100 flex items-center justify-between">

          <Link
            to="/dashboard"
            onClick={closeMobileMenu}
            className="flex items-center gap-3"
          >

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

          </Link>

          <button
            onClick={closeMobileMenu}
            className="p-2 text-gray-500 hover:text-black"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>

        </div>

        {/* MOBILE USER */}

        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">

          <UserAvatar mobile />

          <div className="min-w-0">

            <p className="text-sm font-semibold text-gray-900 truncate">
              {userName}
            </p>

            <p className="text-[10px] text-gray-400 truncate">
              {userEmail}
            </p>

          </div>

        </div>

        {/* MOBILE NAVIGATION */}

        <nav className="p-4 space-y-1 text-xs font-medium text-gray-600 overflow-y-auto">

          <Link
            to="/dashboard"
            onClick={closeMobileMenu}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>

          <Link
            to="/orders"
            onClick={closeMobileMenu}
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-100/60 text-amber-900 font-semibold border-l-4 border-amber-700"
          >
            <Package className="w-4 h-4" />
            My Orders
          </Link>

          <Link
            to="/custom-designs"
            onClick={closeMobileMenu}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50"
          >
            <Scissors className="w-4 h-4" />
            Custom Designs
          </Link>

          <Link
            to="/measurements"
            onClick={closeMobileMenu}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50"
          >
            <Ruler className="w-4 h-4" />
            Measurements
          </Link>

          <Link
            to="/wishlist"
            onClick={closeMobileMenu}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50"
          >
            <Heart className="w-4 h-4" />
            Wishlist
          </Link>

          <Link
            to="/addresses"
            onClick={closeMobileMenu}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50"
          >
            <MapPin className="w-4 h-4" />
            Addresses
          </Link>

          <Link
            to="/profile"
            onClick={closeMobileMenu}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50"
          >
            <User className="w-4 h-4" />
            Profile
          </Link>

          <Link
            to="/notifications"
            onClick={closeMobileMenu}
            className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-50"
          >

            <span className="flex items-center gap-3">
              <Bell className="w-4 h-4" />
              Notifications
            </span>

            <NotificationBadge sidebar />

          </Link>

          <Link
            to="/support"
            onClick={closeMobileMenu}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50"
          >
            <Headphones className="w-4 h-4" />
            Support
          </Link>

        </nav>

        {/* MOBILE LOGOUT */}

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white">

          <Link
            to="/"
            onClick={closeMobileMenu}
            className="flex items-center gap-3 px-4 py-3 text-xs text-rose-700 font-semibold hover:bg-rose-50 rounded-lg"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </Link>

        </div>

      </aside>

      {/* ==================================================
          MAIN
      ================================================== */}

      <div className="flex-1 flex flex-col min-w-0">

        {/* ==================================================
            DESKTOP HEADER
        ================================================== */}

        <header className="hidden md:flex bg-white border-b border-gray-200 px-8 py-4 justify-between items-center">

          <div className="text-xs text-gray-400">

            Portfolio

            <span className="mx-2">
              &gt;
            </span>

            <span className="text-gray-900 font-semibold uppercase tracking-wider">
              MY ORDERS
            </span>

          </div>

          <div className="flex items-center gap-4">

            {/* CART */}

            <Link
              to="/cart"
              className="relative text-gray-600 hover:text-black transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
            </Link>

            {/* NOTIFICATIONS */}

            <Link
              to="/notifications"
              className="relative text-gray-600 hover:text-black transition-colors"
            >
              <Bell className="w-5 h-5" />

              <NotificationBadge />

            </Link>

            {/* USER */}

            <div className="flex items-center gap-2 border-l pl-4 border-gray-200">

              <UserAvatar />

              <span className="text-xs font-semibold text-gray-800">
                {userName}
              </span>

            </div>

          </div>

        </header>

        {/* ==================================================
            MOBILE HEADER
        ================================================== */}

        <header className="md:hidden bg-white border-b border-gray-200">

          <div className="px-4 py-4 flex items-center justify-between">

            {/* LOGO */}

            <Link
              to="/dashboard"
              className="flex items-center gap-3"
            >

              <div className="bg-black text-[#E5D5BC] w-8 h-8 rounded flex items-center justify-center font-serif font-bold">
                W
              </div>

              <div>
                <h1 className="font-serif text-sm tracking-[0.2em] font-bold text-gray-900">
                  WEFTIN
                </h1>

                <span className="text-[8px] uppercase tracking-[0.18em] text-gray-400 block">
                  ATELIER TAILORS
                </span>
              </div>

            </Link>

            {/* MOBILE ACTIONS */}

            <div className="flex items-center gap-4">

              {/* CART */}

              <Link
                to="/cart"
                className="relative text-gray-600"
                aria-label="Cart"
              >
                <ShoppingBag className="w-5 h-5" />
              </Link>

              {/* NOTIFICATIONS */}

              <Link
                to="/notifications"
                className="relative text-gray-600"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />

                <NotificationBadge />

              </Link>

              {/* USER AVATAR */}

              <Link
                to="/profile"
                aria-label="Profile"
              >
                <UserAvatar mobile />
              </Link>

              {/* MENU */}

              <button
                onClick={() =>
                  setMobileMenuOpen(true)
                }
                className="text-gray-700"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>

            </div>

          </div>

        </header>

        {/* ==================================================
            CONTENT
        ================================================== */}

        <main className="p-4 sm:p-6 lg:p-12 max-w-7xl w-full">

          {/* TITLE */}

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
                className="bg-white border border-gray-300 hover:border-black text-gray-800 px-3 py-2.5 rounded-lg"
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
                    className={`px-4 py-1.5 rounded-md font-semibold transition-all whitespace-nowrap ${
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
              ERROR
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
                  className="mt-3 text-xs font-semibold underline hover:no-underline"
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
                  className="inline-flex items-center gap-2 bg-[#1C1816] text-white px-5 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-black"
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
                          className="py-2.5 bg-[#1C1816] text-white rounded font-semibold uppercase tracking-wider hover:bg-black flex items-center justify-center gap-1.5"
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
                          className="py-2.5 border border-gray-300 text-gray-800 rounded font-semibold uppercase tracking-wider hover:border-black bg-white flex items-center justify-center gap-1.5"
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
                          className="py-2.5 border border-gray-300 text-gray-800 rounded font-semibold uppercase tracking-wider hover:border-black bg-white flex items-center justify-center gap-1.5"
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

    </div>
  );
}
