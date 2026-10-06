import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Loader2,
  Menu,
  X,
  LayoutDashboard,
  Package,
  Scissors,
  Ruler,
  MapPin,
  Bell,
  Headphones,
  LogOut,
  ChevronRight,
  Settings
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://weftin-project.onrender.com";

export default function Register_Page() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  useEffect(() => {
    try {
      const savedCart = JSON.parse(localStorage.getItem("weftin_cart")) || [];
      const total = savedCart.reduce((acc, item) => acc + (Number(item.qty) || 0), 0);
      setCartCount(total);
    } catch (e) {
      setCartCount(0);
    }
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!email.trim() || !password.trim()) {
      showToast("Please provide both email and password.");
      return;
    }

    setIsSubmitting(true);
    showToast("Verifying credentials and creating membership...");

    try {
      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email: email.trim().toLowerCase(), password })
      });
      
      const data = await response.json();

      if (response.ok && data?.user) {
        localStorage.setItem('weftin_user', JSON.stringify(data.user));
        if (data.access_token) {
          localStorage.setItem('weftin_token', data.access_token);
        }
        showToast("Account created successfully! Redirecting...");
        setTimeout(() => navigate('/'), 1000);
      } else {
        // Handle duplicate email/password error cases explicitly
        const errorMsg = data.detail || "Registration failed. Email or password may already exist in the system.";
        if (errorMsg.toLowerCase().includes("exist") || errorMsg.toLowerCase().includes("duplicate")) {
          showToast("This email or password is already registered. Please use a different one or sign in.");
        } else {
          showToast(errorMsg);
        }
      }
    } catch (err) {
      console.error("Register connection error:", err);
      showToast("Backend connection error. Please try again.");
    } finally {
      setIsSubmitting(false);
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

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col justify-between relative">
      
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
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 lg:px-12 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <form onSubmit={handleSearch} className="hidden lg:flex items-center bg-gray-50 rounded-full px-4 py-2 w-64 border border-gray-200">
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

            <Link to="/login" className="text-gray-800 hover:text-black">
              <User className="w-5 h-5" />
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
        <nav className="hidden md:flex justify-center items-center gap-6 lg:gap-8 mt-4 pt-3 border-t border-gray-100 text-[10px] lg:text-xs tracking-[0.15em] uppercase text-gray-700 font-medium">
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

          <nav className="p-4 space-y-1 text-xs font-medium text-gray-700 overflow-y-auto max-h-[calc(100vh-150px)]">
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

            <div className="pt-3 pb-1 px-3 text-[10px] uppercase tracking-widest text-amber-800 font-bold border-t border-gray-100 mt-2">Member Portal</div>
            <Link to="/login" onClick={closeMobileMenu} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-amber-50 hover:text-amber-900 transition-colors group">
              <span className="flex items-center gap-3"><User className="w-4 h-4 text-gray-700" />Sign In</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/register" onClick={closeMobileMenu} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-amber-100/60 text-amber-900 font-semibold group">
              <span className="flex items-center gap-3"><User className="w-4 h-4 text-amber-700" />Register Membership</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </nav>
        </div>
      </aside>

      {/* REGISTER CARD SECTION */}
      <main className="flex-1 flex items-center justify-center py-16 px-6">
        <div className="w-full max-w-md bg-white p-10 rounded-2xl border border-gray-200 shadow-sm text-center">
          <h2 className="font-serif text-3xl font-light text-gray-900 mb-2">Register Membership</h2>
          <p className="text-xs text-gray-500 mb-8 leading-relaxed">Create your private atelier account. Duplicate emails and existing passwords are strictly prevented.</p>

          <form onSubmit={handleRegister} className="space-y-6 text-left text-xs">
            <div>
              <label className="block uppercase tracking-wider text-gray-500 mb-2 font-semibold">FULL NAME *</label>
              <input 
                type="text" 
                required 
                placeholder="Meera Kapoor" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-gray-200 px-4 py-3.5 rounded text-gray-800 focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block uppercase tracking-wider text-gray-500 mb-2 font-semibold">EMAIL ADDRESS *</label>
              <input 
                type="email" 
                required 
                placeholder="name@luxury.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-gray-200 px-4 py-3.5 rounded text-gray-800 focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block uppercase tracking-wider text-gray-500 mb-2 font-semibold">CREATE PASSWORD *</label>
              <input 
                type="password" 
                required 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-gray-200 px-4 py-3.5 rounded text-gray-800 focus:outline-none focus:border-black"
              />
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`w-full py-4 rounded text-xs uppercase tracking-[0.2em] font-semibold shadow-lg flex items-center justify-center gap-2 transition cursor-pointer ${
                isSubmitting ? "bg-gray-500 cursor-not-allowed" : "bg-[#1C1816] hover:bg-black text-white"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Atelier Membership"
              )}
            </button>
          </form>

          <div className="mt-6 text-xs text-gray-500">
            Already have an account? <Link to="/login" className="text-black font-semibold underline">Sign In</Link>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#FAF6F0] text-gray-800 pt-16 pb-12 px-6 lg:px-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-gray-200">
          <div className="md:col-span-2">
            <h3 className="font-serif text-xl tracking-[0.2em] font-bold mb-4">weftin</h3>
            <p className="text-xs text-gray-600 leading-relaxed mb-4">
              A digital high-fashion atelier marrying heritage luxury craftsmanship with modern silhouettes.
            </p>
            <p className="text-[11px] text-gray-600"><strong>Concierge:</strong> concierge@weftin.com</p>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-900 mb-4">Collections</h4>
            <ul className="space-y-2 text-xs text-gray-600">
              <li><Link to="/shop" className="hover:text-black">Sarees</Link></li>
              <li><Link to="/shop" className="hover:text-black">Lehengas</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-900 mb-4">Concierge Care</h4>
            <ul className="space-y-2 text-xs text-gray-600">
              <li><Link to="/support" className="hover:text-black">Help Center</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-900 mb-4">Account</h4>
            <ul className="space-y-2 text-xs text-gray-600">
              <li><Link to="/login" className="hover:text-black">Sign In</Link></li>
              <li><Link to="/register" className="hover:text-black">Register Membership</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto flex justify-between items-center pt-8 text-[11px] text-gray-500">
          <p>© 2026 WEFTIN Atelier. All Rights Reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-black">Privacy Policy</a>
            <a href="#" className="hover:text-black">Terms of Service</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
