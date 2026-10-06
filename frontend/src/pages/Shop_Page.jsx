import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Bell,
  Menu,
  X,
  LayoutDashboard,
  Package,
  Scissors,
  Ruler,
  MapPin,
  Headphones,
  LogOut,
  ChevronRight,
  Settings
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://weftin-project.onrender.com";

export default function Shop_Page() {
  const navigate = useNavigate();
  const location = useLocation();

  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toastMessage, setToastMessage] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState(null);
  const [userAvatar, setUserAvatar] = useState("");
  const [searchText, setSearchText] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Sidebar filter states
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColor, setSelectedColor] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [customStitching, setCustomStitching] = useState(false);
  const [sortBy, setSortBy] = useState("Featured Highlights");

  const [appliedFilters, setAppliedFilters] = useState({
    category: "All",
    sizes: [],
    color: "",
    priceRange: "",
    inStockOnly: false,
    customStitching: false,
  });

  // Dynamic products from NeonDB via FastAPI backend
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const showToast = (msg) => {
    setToastMessage(msg);

    setTimeout(() => {
      setToastMessage("");
    }, 3000);
  };

  const categoriesList = [
    "Sarees",
    "Lehengas",
    "Dresses & Gowns",
    "Kurtis",
    "Co-Ord Sets",
    "Kids Wear",
  ];

  const sizesList = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];

  const colorsList = [
    "bg-rose-950",
    "bg-emerald-900",
    "bg-indigo-950",
    "bg-amber-400",
    "bg-pink-400",
    "bg-white border",
  ];

  const handleLogout = () => {
    localStorage.removeItem("weftin_user");
    localStorage.removeItem("weftin_token");
    setMobileMenuOpen(false);
    navigate("/login");
  };

  // =========================================================
  // READ SEARCH PARAMS FROM URL
  // =========================================================
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchQuery = params.get("search");
    if (searchQuery) {
      setSearchText(searchQuery);
    }
  }, [location.search]);

  // =========================================================
  // LOAD USER + CART + NOTIFICATIONS
  // =========================================================
  useEffect(() => {
    const savedUser = JSON.parse(
      localStorage.getItem("weftin_user") || "null"
    );

    if (savedUser && savedUser.email) {
      setCurrentUser(savedUser);

      if (savedUser.avatar) {
        setUserAvatar(savedUser.avatar);
      }

      fetchUserAvatar(savedUser.email);
      fetchUnreadCount(savedUser.email);
    }

    updateCartCount();

    let notificationInterval;

    if (savedUser && savedUser.email) {
      notificationInterval = setInterval(() => {
        fetchUnreadCount(savedUser.email);
      }, 30000);
    }

    return () => {
      if (notificationInterval) {
        clearInterval(notificationInterval);
      }
    };
  }, []);

  // =========================================================
  // FETCH USER AVATAR
  // =========================================================
  const fetchUserAvatar = async (email) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/user/${encodeURIComponent(email)}`
      );

      if (!response.ok) return;

      const data = await response.json();

      if (data && data.avatar) {
        setUserAvatar(data.avatar);
      }
    } catch (error) {
      console.error("Failed to fetch user avatar:", error);
    }
  };

  // =========================================================
  // FETCH UNREAD NOTIFICATIONS
  // =========================================================
  const fetchUnreadCount = async (email) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/notifications/unread-count/${encodeURIComponent(
          email
        )}`
      );

      if (!response.ok) return;

      const data = await response.json();

      setUnreadCount(Number(data.count) || 0);
    } catch (error) {
      console.error("Failed to fetch unread notification count:", error);
    }
  };

  // =========================================================
  // CART COUNT
  // =========================================================
  const updateCartCount = () => {
    try {
      const savedCart =
        JSON.parse(localStorage.getItem("weftin_cart")) || [];

      const total = savedCart.reduce(
        (acc, item) => acc + (Number(item.qty) || 0),
        0
      );

      setCartCount(total);
    } catch (error) {
      console.error("Failed to read cart:", error);
      setCartCount(0);
    }
  };

  // =========================================================
  // FETCH PRODUCTS
  // =========================================================
  useEffect(() => {
    setLoading(true);
    setCurrentPage(1);

    fetch(
      `${API_BASE_URL}/api/products?category=${encodeURIComponent(
        selectedCategory
      )}`
    )
      .then((res) => res.json())
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(
          "Failed to fetch products from backend:",
          err
        );

        setProducts([
          {
            id: 1,
            name: "Royal Amber Kanjeevaram Saree",
            category: "Sarees",
            price: "₹12,999",
            old_price: "₹15,500",
            image:
              "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=500",
            tag: "ATELIER EXCLUSIVE",
          },
          {
            id: 2,
            name: "Forest Sage Organza Lehenga",
            category: "Lehengas",
            price: "₹14,499",
            old_price: "₹18,500",
            image:
              "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=500",
            tag: "NEW ARRIVAL",
          },
        ]);

        setLoading(false);
      });

    updateCartCount();
  }, [selectedCategory]);

  // =========================================================
  // WISHLIST
  // =========================================================
  const handleAddToWishlist = async (p) => {
    const savedUser = JSON.parse(
      localStorage.getItem("weftin_user") || "null"
    );

    if (!savedUser || !savedUser.email) {
      navigate("/login");
      return;
    }

    const token = localStorage.getItem("weftin_token");

    try {
      const response = await fetch(`${API_BASE_URL}/api/wishlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          user_email: savedUser.email,
          product_id: p.id,
          name: p.name,
          price: p.price,
          image: p.image,
          tag: p.tag || "ATELIER EXCLUSIVE",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast(
          data.message || `Saved ${p.name} to Wishlist!`
        );
      } else {
        showToast(data.detail || "Failed to save.");
      }
    } catch (err) {
      console.error("Wishlist fetch error:", err);
      showToast("Backend connection error.");
    }
  };

  // =========================================================
  // ADD TO CART
  // =========================================================
  const handleAddToCart = (p) => {
    try {
      const existingCart =
        JSON.parse(localStorage.getItem("weftin_cart")) || [];

      const existingIndex = existingCart.findIndex(
        (item) => Number(item.id || item.product_id) === Number(p.id)
      );

      if (existingIndex > -1) {
        existingCart[existingIndex].qty =
          (Number(existingCart[existingIndex].qty) || 0) + 1;
      } else {
        existingCart.push({
          id: Number(p.id),
          product_id: Number(p.id),
          name: p.name,
          category: p.category,
          price: p.price,
          size: "Standard Length",
          shade: "Gold",
          color: p.color || "",
          qty: 1,
          image: p.image,
          tag: p.tag || "ATELIER",
        });
      }

      localStorage.setItem(
        "weftin_cart",
        JSON.stringify(existingCart)
      );

      const total = existingCart.reduce(
        (acc, item) => acc + (Number(item.qty) || 0),
        0
      );

      setCartCount(total);

      showToast(`Added ${p.name} to Bag`);
    } catch (error) {
      console.error("Add to cart error:", error);
      showToast("Unable to add item to bag.");
    }
  };

  // =========================================================
  // FILTERING
  // =========================================================
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchText.trim()) {
      const query = searchText.toLowerCase().trim();
      result = result.filter(
        (p) =>
          String(p.name || "").toLowerCase().includes(query) ||
          String(p.category || "").toLowerCase().includes(query)
      );
    }

    if (appliedFilters.category !== "All") {
      result = result.filter(
        (p) =>
          p.category &&
          p.category.toLowerCase() ===
            appliedFilters.category.toLowerCase()
      );
    }

    if (appliedFilters.sizes.length > 0) {
      result = result.filter((product) => {
        if (!product.sizes) return false;

        let productSizes = [];

        if (Array.isArray(product.sizes)) {
          productSizes = product.sizes;
        } else {
          productSizes = String(product.sizes)
            .split(",")
            .map((size) => size.trim());
        }

        return appliedFilters.sizes.some((size) =>
          productSizes.some(
            (productSize) =>
              String(productSize).toLowerCase() ===
              String(size).toLowerCase()
          )
        );
      });
    }

    if (appliedFilters.color) {
      result = result.filter((product) => {
        if (!product.color) return false;

        return (
          String(product.color).toLowerCase() ===
          appliedFilters.color.toLowerCase()
        );
      });
    }

    if (appliedFilters.priceRange) {
      result = result.filter((product) => {
        const numericPrice = parseFloat(
          String(product.price || "")
            .replace(/₹/g, "")
            .replace(/,/g, "")
            .trim()
        );

        if (Number.isNaN(numericPrice)) return false;

        switch (appliedFilters.priceRange) {
          case "Under ₹5,000":
            return numericPrice < 5000;

          case "₹5,000 - ₹10,000":
            return numericPrice >= 5000 && numericPrice <= 10000;

          case "₹10,000 - ₹20,000":
            return numericPrice > 10000 && numericPrice <= 20000;

          case "Over ₹20,000":
            return numericPrice > 20000;

          default:
            return true;
        }
      });
    }

    if (appliedFilters.inStockOnly) {
      result = result.filter(
        (product) => product.in_stock === true
      );
    }

    if (appliedFilters.customStitching) {
      result = result.filter(
        (product) => product.custom_stitching === true
      );
    }

    switch (sortBy) {
      case "Price: Low to High":
        result.sort((a, b) => {
          const priceA = parseFloat(
            String(a.price || "").replace(/[₹,]/g, "")
          );

          const priceB = parseFloat(
            String(b.price || "").replace(/[₹,]/g, "")
          );

          return priceA - priceB;
        });
        break;

      case "Price: High to Low":
        result.sort((a, b) => {
          const priceA = parseFloat(
            String(a.price || "").replace(/[₹,]/g, "")
          );

          const priceB = parseFloat(
            String(b.price || "").replace(/[₹,]/g, "")
          );

          return priceB - priceA;
        });
        break;

      case "Newest Arrivals":
        result.sort(
          (a, b) => Number(b.id) - Number(a.id)
        );
        break;

      default:
        break;
    }

    return result;
  }, [products, appliedFilters, sortBy, searchText]);

  // =========================================================
  // PAGINATION SLICE
  // =========================================================
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const userName =
    currentUser?.name ||
    currentUser?.full_name ||
    currentUser?.username ||
    "WEFTIN Member";

  const userEmail = currentUser?.email || "";
  const userInitial = userName?.charAt(0)?.toUpperCase() || "W";

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
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

      {/* =====================================================
          TOAST
      ====================================================== */}
      {toastMessage && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-[100] bg-gray-900 text-white px-5 sm:px-6 py-3 rounded-lg shadow-2xl text-sm animate-fade-in flex items-center gap-3 border border-amber-500/30">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =====================================================
          TOP ANNOUNCEMENT BAR
      ====================================================== */}
      <div className="bg-[#1C1816] text-[#E5D5BC] text-[9px] sm:text-xs py-2 px-3 text-center tracking-[0.12em] sm:tracking-[0.2em] uppercase font-medium">
        LIMITED FESTIVE EDIT — 20% OFF SELECTED COUTURE PIECES
      </div>

      {/* =====================================================
          UNIFIED NAVIGATION HEADER (MATCHING HOME PAGE)
      ====================================================== */}
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
            
            <Link to="/wishlist" className="text-gray-800 hover:text-black relative">
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-rose-600 text-white text-[9px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
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
              {cartCount > 0 && <span className="absolute -top-1 -right-2 bg-amber-700 text-white text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center">{cartCount}</span>}
            </Link>
          </div>
        </div>

        {/* Sub Nav Links */}
        <nav className="hidden md:flex justify-center items-center gap-6 lg:gap-8 mt-4 pt-3 border-t border-gray-200/60 text-[10px] lg:text-xs tracking-[0.15em] uppercase text-gray-700 font-medium">
          <Link to="/" className="hover:text-black transition-colors">Home</Link>
          <Link to="/shop" className="text-black font-semibold border-b border-black pb-0.5">Shop</Link>
          <Link to="/collections" className="hover:text-black transition-colors">Collections</Link>
          <Link to="/custom-designs" className="hover:text-black transition-colors">Custom Design</Link>
          <Link to="/lookbook" className="hover:text-black transition-colors">Lookbook</Link>
          <Link to="/limited" className="hover:text-black transition-colors">Limited Edition</Link>
        </nav>
      </header>

      {/* =====================================================
          SLIDING NAVIGATION DRAWER (EXACT HOME PAGE BAR)
      ====================================================== */}
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

      {/* =====================================================
          SHOP PAGE HEADER
      ====================================================== */}
      <div className="text-center py-8 sm:py-12 px-5 max-w-xl mx-auto">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] font-semibold block mb-1">
          EXCLUSIVE CURATION
        </span>
        <h2 className="text-3xl sm:text-4xl font-serif font-light text-gray-900 mb-2">
          Shop
        </h2>
        <p className="text-xs text-gray-600 leading-relaxed">
          Explore pristine heritage ethnic attire, custom-tailoring fabrics,
          and modern silhouettes.
        </p>
      </div>

      {/* =====================================================
          MAIN LAYOUT
      ====================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pb-16 sm:pb-24 grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-10 items-start">

        {/* ===================================================
            SIDEBAR FILTER PANEL
        ==================================================== */}
        <aside className="bg-white p-5 sm:p-6 rounded-xl border border-gray-200 shadow-sm space-y-7 lg:space-y-8">
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
              Categories
            </h4>
            <div className="space-y-2 text-xs">
              <button
                onClick={() => setSelectedCategory("All")}
                className={`block w-full text-left py-2 px-2 rounded ${
                  selectedCategory === "All"
                    ? "bg-amber-50 text-amber-900 font-semibold"
                    : "text-gray-600 hover:text-black"
                }`}
              >
                All Categories
              </button>
              {categoriesList.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`block w-full text-left py-2 px-2 rounded ${
                    selectedCategory === cat
                      ? "bg-amber-50 text-amber-900 font-semibold"
                      : "text-gray-600 hover:text-black"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
              Sizes
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {sizesList.map((sz) => (
                <button
                  key={sz}
                  onClick={() => {
                    if (selectedSizes.includes(sz)) {
                      setSelectedSizes(
                        selectedSizes.filter((s) => s !== sz)
                      );
                    } else {
                      setSelectedSizes([...selectedSizes, sz]);
                    }
                  }}
                  className={`py-2 text-[10px] font-semibold uppercase tracking-wider rounded border ${
                    selectedSizes.includes(sz)
                      ? "bg-black text-white border-black"
                      : "border-gray-200 text-gray-700 hover:border-black"
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
              Colors
            </h4>
            <div className="flex flex-wrap gap-3 items-center">
              {colorsList.map((colClass, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedColor(colClass)}
                  className={`w-6 h-6 rounded-full ${colClass} ${
                    selectedColor === colClass
                      ? "ring-2 ring-black scale-110"
                      : "opacity-80 hover:opacity-100"
                  }`}
                />
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
              Price Range
            </h4>
            <div className="space-y-2 text-xs text-gray-700">
              {[
                "Under ₹5,000",
                "₹5,000 - ₹10,000",
                "₹10,000 - ₹20,000",
                "Over ₹20,000",
              ].map((range) => (
                <label key={range} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="price"
                    checked={priceRange === range}
                    onChange={() => setPriceRange(range)}
                    className="accent-black"
                  />
                  {range}
                </label>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
              Availability
            </h4>
            <div className="space-y-2 text-xs text-gray-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={() => setInStockOnly(!inStockOnly)}
                  className="accent-black"
                />
                In Stock
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={customStitching}
                  onChange={() => setCustomStitching(!customStitching)}
                  className="accent-black"
                />
                Custom Stitching Available
              </label>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => {
                setSelectedCategory("All");
                setSelectedSizes([]);
                setSelectedColor("");
                setPriceRange("");
                setInStockOnly(false);
                setCustomStitching(false);
                setSearchText("");
                setAppliedFilters({
                  category: "All",
                  sizes: [],
                  color: "",
                  priceRange: "",
                  inStockOnly: false,
                  customStitching: false,
                });
                showToast("Filters cleared");
              }}
              className="w-full border border-gray-300 py-2.5 text-[10px] uppercase tracking-wider rounded font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              Clear All
            </button>
            <button
              onClick={() => {
                setAppliedFilters({
                  category: selectedCategory,
                  sizes: [...selectedSizes],
                  color: selectedColor,
                  priceRange: priceRange,
                  inStockOnly: inStockOnly,
                  customStitching: customStitching,
                });
                showToast("Filters applied!");
              }}
              className="w-full bg-black text-white py-2.5 text-[10px] uppercase tracking-wider rounded font-semibold hover:bg-gray-800 cursor-pointer"
            >
              Apply Now
            </button>
          </div>
        </aside>

        {/* ===================================================
            PRODUCT CATALOGUE
        ==================================================== */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm gap-4">
            <span className="text-xs text-gray-500">
              Showing <strong>{paginatedProducts.length}</strong> of{" "}
              <strong>{filteredProducts.length}</strong> items for "
              <strong>{appliedFilters.category}</strong>"
            </span>
            <div className="flex items-center gap-2 text-xs w-full sm:w-auto">
              <span className="text-gray-400 whitespace-nowrap">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-50 border border-gray-200 px-3 py-2 rounded text-gray-800 font-semibold focus:outline-none w-full sm:w-auto cursor-pointer"
              >
                <option>Featured Highlights</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest Arrivals</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20 text-xs uppercase tracking-widest text-gray-500 animate-pulse">
              Loading database items...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 py-20 px-6 text-center">
              <p className="font-serif text-lg text-gray-800 mb-2">No products found</p>
              <p className="text-xs text-gray-500">Try changing your filters or selecting another category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {paginatedProducts.map((p) => (
                <div
                  key={p.id}
                  className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 flex flex-col"
                >
                  <div className="relative h-72 sm:h-80 bg-gray-100 overflow-hidden">
                    <span className="absolute top-3 left-3 z-10 bg-black/80 text-white text-[9px] uppercase px-2.5 py-1 tracking-widest">
                      {p.tag || p.category}
                    </span>
                    <button
                      onClick={() => handleAddToWishlist(p)}
                      className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white text-rose-700 shadow cursor-pointer transition-transform active:scale-95 z-10"
                      title="Save to Wishlist"
                    >
                      <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                    </button>
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>

                  <div className="p-4 flex flex-col flex-grow justify-between">
                    <div>
                      <h3 className="font-serif text-sm font-medium mb-1">{p.name}</h3>
                      <p className="text-xs font-bold text-gray-900">
                        {p.price}
                        {p.old_price && (
                          <span className="text-gray-400 line-through font-normal ml-2">
                            {p.old_price}
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-gray-100">
                      <Link
                        to={`/product/${p.id}`}
                        className="text-[10px] uppercase tracking-wider py-2 border border-gray-300 text-gray-800 hover:bg-gray-50 text-center rounded"
                      >
                        Quick View
                      </Link>
                      <button
                        onClick={() => handleAddToCart(p)}
                        className="text-[10px] uppercase tracking-wider py-2 bg-black text-white hover:bg-gray-800 flex items-center justify-center gap-1 rounded cursor-pointer"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        Add to Bag
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-8">
              {Array.from({ length: totalPages }, (_, index) => {
                const pageNum = index + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => {
                      setCurrentPage(pageNum);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`w-9 h-9 rounded-lg border text-xs flex items-center justify-center font-semibold transition-all cursor-pointer ${
                      currentPage === pageNum
                        ? "bg-black text-white border-black"
                        : "border-gray-200 bg-white text-gray-700 hover:border-black"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
          FOOTER
      ====================================================== */}
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
              <li><Link to="/shop" className="hover:text-black">Sarees</Link></li>
              <li><Link to="/shop" className="hover:text-black">Lehengas</Link></li>
              <li><Link to="/shop" className="hover:text-black">Dresses</Link></li>
              <li><Link to="/shop" className="hover:text-black">Kurtis</Link></li>
              <li><Link to="/shop" className="hover:text-black">Co-Ord Sets</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-900 mb-4">Concierge Care</h4>
            <ul className="space-y-2 text-xs text-gray-600">
              <li><Link to="/support" className="hover:text-black">Help Center</Link></li>
              <li><Link to="/orders" className="hover:text-black">Order Tracking</Link></li>
              <li><Link to="/support" className="hover:text-black">Returns & Adjustments</Link></li>
              <li><Link to="/support" className="hover:text-black">Shipping Policy</Link></li>
              <li><Link to="/support" className="hover:text-black">Fabric Quality Guide</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-900 mb-4">Account</h4>
            <ul className="space-y-2 text-xs text-gray-600">
              <li><Link to="/profile" className="hover:text-black">Sign In</Link></li>
              <li><Link to="/profile" className="hover:text-black">Register Membership</Link></li>
              <li><Link to="/dashboard" className="hover:text-black">Order History</Link></li>
              <li><Link to="/measurements" className="hover:text-black">My Bespoke Fit</Link></li>
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
