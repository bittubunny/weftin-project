import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
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

export default function Collections_Page() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("Sarees");
  const [cartCount, setCartCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [userAvatar, setUserAvatar] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);

  const userName = currentUser?.name || currentUser?.full_name || currentUser?.username || "WEFTIN Member";
  const userEmail = currentUser?.email || "";
  const userInitial = userName.charAt(0).toUpperCase() || "W";

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  }, []);

  const getCart = () => {
    try {
      const storedCart = localStorage.getItem("weftin_cart");
      if (!storedCart) return [];
      const parsedCart = JSON.parse(storedCart);
      return Array.isArray(parsedCart) ? parsedCart : [];
    } catch (error) {
      console.error("Unable to read cart:", error);
      return [];
    }
  };

  const updateCartCount = useCallback(() => {
    const cart = getCart();
    const totalQuantity = cart.reduce((total, item) => total + (Number(item.qty) || 0), 0);
    setCartCount(totalQuantity);
  }, []);

  const addProductToCart = useCallback((product) => {
    try {
      const productId = product?.product_id ?? product?.productId ?? product?.id;
      if (!productId) {
        showToast("This product cannot be added to your bag.");
        return;
      }
      const numericProductId = Number(productId);
      let cart = getCart();

      const existingIndex = cart.findIndex((item) => {
        const itemProductId = Number(item?.product_id ?? item?.productId ?? item?.id);
        return itemProductId === numericProductId;
      });

      if (existingIndex !== -1) {
        cart[existingIndex] = {
          ...cart[existingIndex],
          qty: Number(cart[existingIndex].qty || 0) + 1
        };
      } else {
        cart.push({
          id: numericProductId,
          product_id: numericProductId,
          name: product?.name || "WEFTIN Product",
          category: product?.category || "",
          image: product?.image || "",
          price: product?.price || "₹0",
          qty: 1,
          tag: product?.tag || "ATELIER"
        });
      }

      localStorage.setItem("weftin_cart", JSON.stringify(cart));
      updateCartCount();
      showToast(`${product?.name || "Item"} added to Bag`);
    } catch (error) {
      console.error("Add to cart error:", error);
      showToast("Unable to add this item to your bag.");
    }
  }, [showToast, updateCartCount]);

  const fetchData = useCallback(() => {
    // Featured Collection
    fetch(`${API_BASE_URL}/api/home-products?section=Featured`)
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setFeaturedProducts(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("Featured fetch error:", err);
        setFeaturedProducts([]);
      });

    // Best Sellers
    fetch(`${API_BASE_URL}/api/home-products?section=Best+Seller`)
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setBestSellers(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("Best seller fetch error:", err);
        setBestSellers([]);
      });
  }, []);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("weftin_user");
      if (storedUser) {
        const savedUser = JSON.parse(storedUser);
        setCurrentUser(savedUser);
        if (savedUser?.avatar) setUserAvatar(savedUser.avatar);

        fetch(`${API_BASE_URL}/api/user/${encodeURIComponent(savedUser.email)}`)
          .then((res) => res.json())
          .then((data) => {
            if (data?.avatar) setUserAvatar(data.avatar);
          })
          .catch((err) => console.error("Avatar fetch error:", err));

        fetch(`${API_BASE_URL}/api/notifications/unread-count/${encodeURIComponent(savedUser.email)}`)
          .then((res) => res.json())
          .then((data) => {
            if (data?.count) setUnreadCount(Number(data.count));
          })
          .catch((err) => console.error("Unread count error:", err));
      }
    } catch (error) {
      console.error("User load error:", error);
    }

    fetchData();
    updateCartCount();
  }, [fetchData, updateCartCount]);

  const categories = [
    "Sarees",
    "Lehengas",
    "Dresses",
    "Kurtis",
    "Co-Ord Sets",
    "Kids Wear",
    "Festival Spec"
  ];

  const filteredFeatured = activeTab === "Sarees"
    ? featuredProducts
    : featuredProducts.filter(
        (product) => String(product?.category || "").toLowerCase().trim() === activeTab.toLowerCase().trim()
      );

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchText.trim();
    if (!query) {
      navigate("/shop");
      return;
    }
    navigate(`/shop?search=${encodeURIComponent(query)}`);
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("weftin_user");
    localStorage.removeItem("weftin_token");
    setMobileMenuOpen(false);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-gray-900 font-sans relative">

      {/* TOAST */}
      {toastMessage && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-[100] bg-gray-900 text-white px-6 py-3 rounded-lg shadow-2xl text-sm flex items-center gap-3 border border-amber-500/30">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0"></span>
          <span className="flex-1">{toastMessage}</span>
          <button onClick={() => setToastMessage("")} className="text-gray-400 hover:text-white">
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
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-amber-700 text-white text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Sub Nav Links */}
        <nav className="hidden md:flex justify-center items-center gap-6 lg:gap-8 mt-4 pt-3 border-t border-gray-200/60 text-[10px] lg:text-xs tracking-[0.15em] uppercase text-gray-700 font-medium">
          <Link to="/" className="hover:text-black transition-colors">Home</Link>
          <Link to="/shop" className="hover:text-black transition-colors">Shop</Link>
          <Link to="/collections" className="text-black font-semibold border-b border-black pb-0.5">Collections</Link>
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
            <Link to="/collections" onClick={closeMobileMenu} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-amber-50 text-amber-900 font-semibold group">
              <span className="flex items-center gap-3"><Package className="w-4 h-4 text-amber-700" />Collections</span>
              <ChevronRight className="w-3.5 h-3.5 text-amber-700" />
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

      {/* SECTION 1: FEATURED COLLECTIONS (MATCHING SCREENSHOT 1)[cite: 1] */}
      <section className="py-16 sm:py-24 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-[0.25em] text-amber-700 font-semibold block mb-2">
            HERITAGE SILHOUETTES[cite: 1]
          </span>
          <h2 className="text-3xl lg:text-4xl font-serif font-light text-gray-900 mb-2">
            Featured Collections[cite: 1]
          </h2>
          <p className="text-gray-600 text-xs">
            Meticulously cataloged styles for every bespoke occasion.[cite: 1]
          </p>
        </div>

        {/* CATEGORY TABS[cite: 1] */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-5 py-2 text-xs uppercase tracking-wider transition-all duration-300 rounded-full border cursor-pointer ${
                activeTab === cat
                  ? "bg-[#5C1D24] text-white border-[#5C1D24] shadow-md"
                  : "bg-white text-gray-700 border-gray-300 hover:border-gray-900"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* PRODUCTS GRID[cite: 1] */}
        {filteredFeatured.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredFeatured.map((prod) => (
              <div
                key={prod.id}
                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 flex flex-col"
              >
                <div className="relative h-96 overflow-hidden bg-gray-100">
                  <span className="absolute top-3 left-3 z-10 bg-black/80 text-white text-[9px] tracking-widest px-3 py-1 uppercase">
                    {prod.tag || "FEATURED"}
                  </span>
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>

                <div className="p-5 flex flex-col flex-grow justify-between">
                  <div>
                    <h3 className="font-serif text-base text-gray-900 mb-1">{prod.name}</h3>
                    <p className="text-sm font-bold text-gray-900">{prod.price}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => setQuickViewProduct(prod)}
                      className="text-[11px] uppercase tracking-wider py-2 border border-gray-300 text-gray-800 hover:bg-gray-50 cursor-pointer rounded"
                    >
                      Quick View[cite: 1]
                    </button>
                    <button
                      onClick={() => addProductToCart(prod)}
                      className="text-[11px] uppercase tracking-wider py-2 bg-gray-900 text-white hover:bg-black cursor-pointer rounded"
                    >
                      Add to Bag[cite: 1]
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl py-16 text-center">
            <p className="font-serif text-xl text-gray-900">No {activeTab} available</p>
            <p className="text-xs text-gray-500 mt-2">Please check another collection.</p>
          </div>
        )}
      </section>

      {/* SECTION 2: BEST SELLERS (MATCHING SCREENSHOT 2)[cite: 2] */}
      <section className="py-16 sm:py-24 px-6 lg:px-12 max-w-7xl mx-auto bg-[#FAF2EC] rounded-2xl my-16 border border-amber-900/10">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-[0.25em] text-amber-800 font-semibold block mb-2">
            THE ATELIER FAVORITES[cite: 2]
          </span>
          <h2 className="text-3xl font-serif font-light text-gray-900 mb-1">
            Best Sellers[cite: 2]
          </h2>
          <p className="text-xs text-gray-600">
            The highly popular garments adored by our circle.[cite: 2]
          </p>
        </div>

        {bestSellers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {bestSellers.map((item) => (
              <div
                key={item.id}
                className="group bg-white rounded-xl overflow-hidden shadow-sm border flex flex-col justify-between"
              >
                <div className="relative h-80 bg-gray-100 overflow-hidden">
                  <span className="absolute top-3 left-3 z-10 bg-[#D4AF37] text-black text-[9px] uppercase px-2.5 py-1 font-bold">
                    {item.tag || "BEST SELLER"}
                  </span>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>

                <div className="p-4 flex flex-col flex-grow justify-between">
                  <div>
                    <h3 className="font-serif text-sm font-medium mb-1">{item.name}</h3>
                    <p className="text-xs font-bold text-gray-900 mb-4">{item.price}</p>
                  </div>

                  <button
                    onClick={() => addProductToCart(item)}
                    className="w-full py-2.5 bg-black text-white text-[11px] uppercase tracking-wider hover:bg-gray-900 cursor-pointer rounded"
                  >
                    Add to Bag[cite: 2]
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-sm text-gray-500">
            No best sellers available right now.
          </div>
        )}
      </section>

      {/* FOOTER (MATCHING SCREENSHOT 3)[cite: 3] */}
      <footer className="bg-[#F3EDE2] text-gray-800 pt-16 pb-12 px-6 lg:px-12 border-t border-gray-300">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-gray-300/60">
          <div className="md:col-span-2">
            <h3 className="font-serif text-xl tracking-[0.2em] font-bold mb-4">weftin[cite: 3]</h3>
            <p className="text-xs text-gray-600 leading-relaxed mb-4">
              A digital high-fashion atelier marrying heritage luxury craftsmanship with modern silhouettes. Stitched with unparalleled dedication to structural flow.[cite: 3]
            </p>
            <p className="text-[11px] text-gray-600"><strong>Concierge:</strong> concierge@weftin.com[cite: 3]</p>
            <p className="text-[11px] text-gray-600"><strong>Direct Line:</strong> 1-800-WEFT-LUXE[cite: 3]</p>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-900 mb-4">Collections[cite: 3]</h4>
            <ul className="space-y-2 text-xs text-gray-600">
              <li><Link to="/shop" className="hover:text-black">Sarees[cite: 3]</Link></li>
              <li><Link to="/shop" className="hover:text-black">Lehengas[cite: 3]</Link></li>
              <li><Link to="/shop" className="hover:text-black">Dresses[cite: 3]</Link></li>
              <li><Link to="/shop" className="hover:text-black">Kurtis[cite: 3]</Link></li>
              <li><Link to="/shop" className="hover:text-black">Co-Ord Sets[cite: 3]</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-900 mb-4">Concierge Care[cite: 3]</h4>
            <ul className="space-y-2 text-xs text-gray-600">
              <li><Link to="/support" className="hover:text-black">Help Center[cite: 3]</Link></li>
              <li><Link to="/orders" className="hover:text-black">Order Tracking[cite: 3]</Link></li>
              <li><Link to="/support" className="hover:text-black">Returns & Adjustments[cite: 3]</Link></li>
              <li><Link to="/support" className="hover:text-black">Shipping Policy[cite: 3]</Link></li>
              <li><Link to="/support" className="hover:text-black">Fabric Quality Guide[cite: 3]</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-900 mb-4">Account[cite: 3]</h4>
            <ul className="space-y-2 text-xs text-gray-600">
              <li><Link to="/profile" className="hover:text-black">Sign In[cite: 3]</Link></li>
              <li><Link to="/profile" className="hover:text-black">Register Membership[cite: 3]</Link></li>
              <li><Link to="/dashboard" className="hover:text-black">Order History[cite: 3]</Link></li>
              <li><Link to="/measurements" className="hover:text-black">My Bespoke Fit[cite: 3]</Link></li>
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

      {/* QUICK VIEW MODAL */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-[90] bg-black/60 flex items-center justify-center p-4" onClick={() => setQuickViewProduct(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="grid grid-cols-1 sm:grid-cols-2">
              <div className="h-80 sm:h-[420px] bg-gray-100">
                <img src={quickViewProduct.image} alt={quickViewProduct.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-6 sm:p-8 relative flex flex-col justify-center">
                <button onClick={() => setQuickViewProduct(null)} className="absolute top-4 right-4 p-2 text-gray-500 hover:text-black cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
                <span className="text-[10px] uppercase tracking-[0.2em] text-amber-700 font-semibold mb-3">
                  {quickViewProduct.tag || "ATELIER"}
                </span>
                <h3 className="font-serif text-2xl text-gray-900 mb-3">{quickViewProduct.name}</h3>
                <p className="text-lg font-bold text-gray-900 mb-5">{quickViewProduct.price}</p>
                <button
                  onClick={() => {
                    addProductToCart(quickViewProduct);
                    setQuickViewProduct(null);
                  }}
                  className="w-full bg-black text-white py-3 text-xs uppercase tracking-[0.2em] font-semibold hover:bg-gray-900 cursor-pointer rounded mb-3"
                >
                  Add to Bag
                </button>
                <button
                  onClick={() => setQuickViewProduct(null)}
                  className="w-full border border-gray-300 text-gray-800 py-3 text-xs uppercase tracking-[0.2em] font-semibold hover:bg-gray-50 cursor-pointer rounded"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
