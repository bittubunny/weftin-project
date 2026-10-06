import React, { useState, useEffect, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Star,
  ChevronDown,
  ChevronUp,
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

export default function Product_Overview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('Standard Length');
  const [selectedColor, setSelectedColor] = useState('gold');
  const [quantity, setQuantity] = useState(1);
  const [cartCount, setCartCount] = useState(0);
  const [toastMessage, setToastMessage] = useState('');
  
  const [currentUser, setCurrentUser] = useState(null);
  const [userAvatar, setUserAvatar] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const [descOpen, setDescOpen] = useState(true);
  const [materialOpen, setMaterialOpen] = useState(false);
  const [shippingOpen, setShippingOpen] = useState(false);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  }, []);

  const userName = currentUser?.name || currentUser?.full_name || currentUser?.username || "WEFTIN Member";
  const userEmail = currentUser?.email || "";
  const userInitial = userName.charAt(0).toUpperCase() || "W";

  // Load User & Product Data
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("weftin_user");
      if (storedUser) {
        const savedUser = JSON.parse(storedUser);
        setCurrentUser(savedUser);
        if (savedUser?.avatar) setUserAvatar(savedUser.avatar);
      }
    } catch (error) {
      console.error("Unable to load user:", error);
    }

    setLoading(true);
    fetch(`${API_BASE_URL}/api/products`)
      .then(res => res.json())
      .then(data => {
        const found = data.find(item => item.id.toString() === id) || data[0];
        setProduct(found);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading product overview:", err);
        setLoading(false);
      });

    // Update initial cart count
    try {
      const existingCart = JSON.parse(localStorage.getItem('weftin_cart')) || [];
      setCartCount(existingCart.reduce((acc, i) => acc + (Number(i.qty) || 0), 0));
    } catch (e) {
      setCartCount(0);
    }
  }, [id]);

  // Load unread notifications
  useEffect(() => {
    if (!userEmail) return;
    fetch(`${API_BASE_URL}/api/notifications/unread-count/${encodeURIComponent(userEmail)}`)
      .then(res => res.json())
      .then(data => {
        if (data?.count) setUnreadCount(Number(data.count));
      })
      .catch(err => console.error("Unread count error:", err));
  }, [userEmail]);

  if (loading || !product) {
    return <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center text-xs uppercase tracking-widest text-gray-500">Loading product overview...</div>;
  }

  const productImages = [
    product.image,
    product.image2 || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800",
    product.image3 || "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800",
    product.image4 || "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=800"
  ].filter(Boolean);

  const relatedMasterpieces = [
    { id: 1, name: 'Midnight Indigo Silk Saree', price: '₹12,250', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=500' },
    { id: 2, name: 'Crimson Velvet Bridal Lehenga', price: '₹24,800', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=500' },
  ];

  const handleAddToBag = () => {
    try {
      const existingCart = JSON.parse(localStorage.getItem('weftin_cart')) || [];
      const numericId = Number(product.id);
      
      const existingIndex = existingCart.findIndex(item => Number(item.id || item.product_id) === numericId && item.size === selectedSize && item.shade === selectedColor);
      
      if (existingIndex > -1) {
        existingCart[existingIndex].qty += quantity;
      } else {
        existingCart.push({
          id: numericId,
          product_id: numericId,
          name: product.name,
          category: product.category,
          price: product.price,
          size: selectedSize,
          shade: selectedColor,
          qty: quantity,
          image: product.image,
          tag: product.tag || 'ATELIER'
        });
      }

      localStorage.setItem('weftin_cart', JSON.stringify(existingCart));
      setCartCount(existingCart.reduce((acc, i) => acc + (Number(i.qty) || 0), 0));
      showToast(`Added ${quantity}x ${product.name} to Luxury Bag!`);
    } catch (error) {
      console.error("Add to bag error:", error);
      showToast("Unable to add item to luxury bag.");
    }
  };

  const handleBuyItNow = () => {
    handleAddToBag();
    setTimeout(() => {
      navigate("/cart");
    }, 400);
  };

  const handleBespokeCustomDesign = async () => {
    const savedUser = JSON.parse(localStorage.getItem("weftin_user"));
    const token = localStorage.getItem("weftin_token");

    if (!savedUser?.email) {
      showToast("Please sign in before creating a custom design.");
      setTimeout(() => navigate("/login"), 1000);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/custom-designs`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            user_email: savedUser.email,
            product_id: Number(product.id),
            product_name: product.name,
            product_category: product.category,
            product_price: product.price,
            product_image: product.image
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to create custom design");
      }

      showToast("Bespoke custom design request created!");

      setTimeout(() => {
        navigate("/custom-designs");
      }, 500);

    } catch (error) {
      console.error("Custom design error:", error);
      showToast("Unable to create custom design request.");
    }
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

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("weftin_user");
    localStorage.removeItem("weftin_token");
    setMobileMenuOpen(false);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-gray-900 font-sans relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-2xl text-sm animate-fade-in flex items-center gap-3 border border-amber-500/30">
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
              {cartCount > 0 && <span className="absolute -top-1 -right-2 bg-amber-700 text-white text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center">{cartCount}</span>}
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

      {/* BREADCRUMB */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4 text-xs text-gray-500">
        <Link to="/" className="hover:underline">Home</Link> <span className="mx-2">/</span> 
        <Link to="/shop" className="hover:underline">Shop</Link> <span className="mx-2">/</span> 
        <span className="text-gray-800">{product.category}</span> <span className="mx-2">/</span> 
        <span className="text-gray-900 font-semibold">{product.name}</span>
      </div>

      {/* PRODUCT OVERVIEW SECTION */}
      <main className="max-w-7xl mx-auto px-6 lg:px-12 pb-24">
        <div className="bg-white p-8 lg:p-12 rounded-2xl border border-gray-200 shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Left: Thumbnail Selector + Main Image */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex sm:flex-col gap-3 order-2 sm:order-1 overflow-x-auto">
              {productImages.map((img, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-24 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${selectedImage === idx ? 'border-amber-700 shadow-md scale-105' : 'border-gray-200 opacity-70 hover:opacity-100'}`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            <div className="relative flex-1 h-[520px] rounded-xl overflow-hidden bg-gray-100 order-1 sm:order-2">
              <span className="absolute top-3 left-3 z-10 bg-[#D4AF37] text-black text-[9px] uppercase tracking-widest px-3 py-1 font-bold">
                {product.tag || 'ATELIER DROP'}
              </span>
              <img src={productImages[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Right: Product Details & Purchase Panel */}
          <div>
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">{product.category} • SKU: {product.sku || 'WFT-SR-1042'}</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full">In Stock & Ready</span>
            </div>

            <h2 className="text-3xl lg:text-4xl font-serif font-light text-gray-900 mb-3">{product.name}</h2>
            
            <div className="flex items-center gap-2 mb-6">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-500" />)}
              </div>
              <span className="text-xs text-gray-500">(24 verified reviews)</span>
            </div>

            <div className="flex items-baseline gap-4 mb-6 pb-6 border-b border-gray-100">
              <span className="text-3xl font-bold text-gray-950">{product.price}</span>
              {product.old_price && <span className="text-sm text-gray-400 line-through">{product.old_price}</span>}
            </div>

            <p className="text-xs text-gray-600 leading-relaxed mb-8">
              {product.description || 'Woven with pure gold-coated zari thread and premium mulberry silk, this magnificent masterpiece encapsulates heritage Indian craftsmanship in a rich, breathtaking drape.'}
            </p>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs uppercase tracking-wider text-gray-600 font-semibold">Select Tailoring Size</label>
                <button onClick={() => showToast('Opening size chart...')} className="text-xs text-amber-700 underline font-medium">Size Chart & Guide</button>
              </div>
              <div className="flex gap-3">
                {['S', 'M', 'L', 'Standard Length'].map(sz => (
                  <button 
                    key={sz} 
                    onClick={() => setSelectedSize(sz)}
                    className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded border transition-all ${selectedSize === sz ? 'bg-black text-white border-black' : 'border-gray-300 text-gray-700 hover:border-black'}`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs uppercase tracking-wider text-gray-600 font-semibold mb-2">Color Palette</label>
              <div className="flex gap-3 items-center">
                {[
                  { name: 'gold', bg: 'bg-amber-600' },
                  { name: 'ruby', bg: 'bg-rose-900' },
                  { name: 'emerald', bg: 'bg-emerald-800' }
                ].map(c => (
                  <button 
                    key={c.name}
                    onClick={() => setSelectedColor(c.name)}
                    className={`w-8 h-8 rounded-full ${c.bg} transition-transform ${selectedColor === c.name ? 'ring-4 ring-black scale-110' : 'opacity-70 hover:opacity-100'}`}
                  />
                ))}
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-xs uppercase tracking-wider text-gray-600 font-semibold mb-2">Quantity</label>
              <div className="flex items-center w-32 border border-gray-300 rounded bg-gray-50">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-2 text-gray-600 hover:text-black font-bold">-</button>
                <span className="flex-1 text-center text-sm font-semibold">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="px-3 py-2 text-gray-600 hover:text-black font-bold">+</button>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              <button 
                onClick={handleAddToBag} 
                className="w-full bg-[#1C1816] hover:bg-black text-white py-4 rounded text-xs uppercase tracking-[0.2em] font-semibold shadow-lg cursor-pointer"
              >
                Add To Luxury Bag
              </button>
              <button 
                onClick={handleBuyItNow} 
                className="w-full border-2 border-black text-black py-3.5 rounded text-xs uppercase tracking-[0.2em] font-semibold hover:bg-black hover:text-white transition-colors cursor-pointer"
              >
                Buy It Now
              </button>
              <button 
                onClick={handleBespokeCustomDesign}
                className="w-full bg-amber-50 border border-amber-300 text-amber-900 py-3 rounded text-xs uppercase tracking-[0.15em] font-semibold hover:bg-amber-100 transition-colors cursor-pointer"
              >
                Bespoke Custom Design
              </button>
            </div>

            <div className="border-t border-gray-200 divide-y divide-gray-200 text-xs">
              <div className="py-4">
                <button onClick={() => setDescOpen(!descOpen)} className="flex justify-between items-center w-full font-serif font-bold text-sm text-gray-900 cursor-pointer">
                  Product Description {descOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {descOpen && (
                  <p className="mt-3 text-gray-600 leading-relaxed">
                    {product.description || 'Hand-loomed piece featuring intricate temple borders and exquisite draping.'}
                  </p>
                )}
              </div>

              <div className="py-4">
                <button onClick={() => setMaterialOpen(!materialOpen)} className="flex justify-between items-center w-full font-serif font-bold text-sm text-gray-900 cursor-pointer">
                  Material & Care {materialOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {materialOpen && (
                  <p className="mt-3 text-gray-600 leading-relaxed">
                    {product.material_care || '100% Pure Mulberry Silk with Gold Zari Threads. Dry clean only.'}
                  </p>
                )}
              </div>

              <div className="py-4">
                <button onClick={() => setShippingOpen(!shippingOpen)} className="flex justify-between items-center w-full font-serif font-bold text-sm text-gray-900 cursor-pointer">
                  Shipping & Returns {shippingOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {shippingOpen && (
                  <p className="mt-3 text-gray-600 leading-relaxed">
                    Free worldwide express shipping with full DHL insurance coverage. 14-day return policy for unused items in original atelier packaging.
                  </p>
                )}
              </div>
            </div>

          </div>

        </div>

        <div className="mt-24">
          <h3 className="font-serif text-2xl font-light text-gray-900 mb-8">Related Masterpieces</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl">
            {relatedMasterpieces.map((rel) => (
              <div key={rel.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200/60 flex flex-col group">
                <div className="relative h-85 bg-gray-100 overflow-hidden">
                  <img src={rel.image} alt={rel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="p-4 flex flex-col flex-grow justify-between">
                  <div>
                    <h4 className="font-serif text-sm font-medium mb-1">{rel.name}</h4>
                    <p className="text-xs font-bold text-gray-900">{rel.price}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

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
