import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, Package, Scissors, Ruler, Heart, MapPin, 
  User, Bell, Headphones, LogOut, ShoppingBag, Sparkles, 
  X, Menu, ChevronRight, Settings, Search, Mail, CheckCircle2, 
  ChevronDown, ChevronUp, Loader2 
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://weftin-project.onrender.com";

export default function Support_Page() {
  const navigate = useNavigate();

  // ==================================================
  // USER
  // ==================================================
  const [currentUser, setCurrentUser] = useState(null);
  const [userAvatar, setUserAvatar] = useState("");

  // ==================================================
  // SUPPORT FORM & FAQS
  // ==================================================
  const [subject, setSubject] = useState('Size alteration support request');
  const [concerns, setConcerns] = useState('');
  const [openFaq, setOpenFaq] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingHelpdesk, setIsSendingHelpdesk] = useState(false);

  // ==================================================
  // NOTIFICATIONS
  // ==================================================
  const [unreadCount, setUnreadCount] = useState(0);

  // ==================================================
  // MOBILE MENU & SEARCH
  // ==================================================
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const closeMobileMenu = () => setMobileMenuOpen(false);

  // ==================================================
  // TOAST
  // ==================================================
  const [toastMessage, setToastMessage] = useState("");

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage("");
    }, 4000);
  }, []);

  // ==================================================
  // LOAD USER & AVATAR
  // ==================================================
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("weftin_user");
      if (!storedUser) {
        navigate("/login");
        return;
      }
      const savedUser = JSON.parse(storedUser);
      if (!savedUser?.email) {
        navigate("/login");
        return;
      }

      setCurrentUser(savedUser);
      if (savedUser?.avatar) {
        setUserAvatar(savedUser.avatar);
      }

      // Fetch latest profile avatar from DB
      fetch(`${API_BASE_URL}/api/user/${encodeURIComponent(savedUser.email)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.avatar) {
            setUserAvatar(data.avatar);
          }
        })
        .catch((err) => console.error("Avatar sync error:", err));

    } catch (error) {
      console.error("Unable to read user:", error);
      navigate("/login");
    }
  }, [navigate]);

  const userEmail = currentUser?.email || "customer@weftin.com";
  const userName = currentUser?.name || currentUser?.full_name || currentUser?.username || "WEFTIN Member";
  const userInitial = userName.charAt(0).toUpperCase() || "W";

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
        `${API_BASE_URL}/api/notifications/unread-count/${encodeURIComponent(userEmail)}`
      );
      if (!response.ok) return;
      const data = await response.json();
      setUnreadCount(Number(data?.count || 0));
    } catch (error) {
      console.error("Unread notification count error:", error);
    }
  }, [userEmail]);

  useEffect(() => {
    if (!userEmail) return;
    loadUnreadCount();
  }, [userEmail, loadUnreadCount]);

  // ==================================================
  // ACTIONS / HELPERS
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

  // Direct backend dispatch for Helpdesk Email
  const handleEmailHelpdesk = async () => {
    setIsSendingHelpdesk(true);
    const token = localStorage.getItem("weftin_token");

    try {
      const response = await fetch(`${API_BASE_URL}/api/support/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          recipient: "chbharath0779@gmail.com",
          subject: `Support Inquiry from WEFTIN Member: ${userName}`,
          message: `User Name: ${userName}\nUser Email: ${userEmail}\n\nUser requested direct helpdesk assistance.`,
          user_email: userEmail
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.detail || "Failed to send email to helpdesk.");
      }

      showToast("Email dispatched successfully to chbharath0779@gmail.com!");
    } catch (error) {
      console.error("Helpdesk email error:", error);
      showToast(error?.message || "Failed to dispatch email.");
    } finally {
      setIsSendingHelpdesk(false);
    }
  };

  // Direct backend dispatch for Tailoring Ticket
  const handleFileTicket = async (e) => {
    e.preventDefault();
    if (!concerns.trim()) {
      showToast('Please elaborate your concerns.');
      return;
    }

    setIsSubmitting(true);
    const token = localStorage.getItem("weftin_token");

    try {
      const payload = {
        recipient: "chbharath0779@gmail.com",
        subject: subject,
        concerns: concerns,
        user_name: userName,
        user_email: userEmail
      };

      console.log("Submitting tailoring ticket payload:", payload);

      const response = await fetch(`${API_BASE_URL}/api/support/ticket`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonErr) {
        console.error("Failed to parse backend response as JSON:", jsonErr);
        throw new Error("Server returned an invalid response format.");
      }

      if (!response.ok) {
        throw new Error(data?.detail || "Failed to file tailoring ticket on server.");
      }

      showToast('Ticket filed successfully & email sent to chbharath0779@gmail.com!');
      setConcerns('');
    } catch (error) {
      console.error("Tailoring ticket submission error:", error);
      showToast(error?.message || "Unable to submit ticket right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const NotificationBadge = () => {
    if (unreadCount <= 0) return null;
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

  const faqs = [
    {
      q: "Can I get my sleeves or neckline customized after receiving standard sizes?",
      a: "Yes. Every WEFTIN garment is designed with standard internal seam margins up to 2 inches. As a Gold Member, you can request free doorstep pickup and custom master alteration within 10 days of cargo delivery."
    },
    {
      q: "How long does a Custom Bridal Lehenga request take to build?",
      a: "Custom bridal lehengas typically require 15 to 25 business days due to intricate hand-weaving, raw silk sourcing, and multiple digital measurement alignments."
    },
    {
      q: "What secures my customized package during domestic transit?",
      a: "All atelier parcels are shipped in high-fidelity tamper-evident velvet boxing with full DHL and Blue Dart insurance coverage requiring signature validation upon arrival."
    },
    {
      q: "Can I cancel a custom design tailoring assignment midway?",
      a: "Once fabric is cut and Zari embroidery has begun in our Varanasi or Kancheepuram loom workshops, assignments cannot be cancelled, but design adjustments can be reviewed via the workspace chat."
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-gray-900 font-sans relative">

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] bg-gray-900 text-white px-6 py-3 rounded-lg shadow-2xl text-sm flex items-center gap-3 border border-amber-500/35">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0"></span>
          <span className="flex-1">{toastMessage}</span>
          <button onClick={() => setToastMessage("")} className="text-gray-400 hover:text-white cursor-pointer">
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
              <Heart className="w-5 h-5 text-gray-700 hover:fill-amber-700" />
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
            <Link to="/support" onClick={closeMobileMenu} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-amber-100/60 text-amber-900 font-semibold group">
              <span className="flex items-center gap-3"><Headphones className="w-4 h-4 text-amber-700" />Concierge Support</span>
              <ChevronRight className="w-3.5 h-3.5 text-amber-700" />
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
      <main className="p-4 sm:p-6 lg:p-8 xl:p-12 max-w-7xl mx-auto w-full space-y-8">
        
        {/* TITLE HEADER */}
        <div>
          <div className="flex items-center gap-2 text-amber-700 mb-1">
            <Headphones className="w-5 h-5 text-amber-700" />
            <h2 className="text-2xl sm:text-3xl font-serif text-gray-900">
              Secured Designer Assistance Desk
            </h2>
          </div>
          <p className="text-xs text-gray-500">
            Contact senior atelier designers directly via backend secure dispatch or structured support tickets.
          </p>
        </div>

        {/* MAILING SUPPORT CARD */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 shadow-sm">
          <span className="bg-rose-100 text-rose-800 text-[9px] uppercase font-bold px-2.5 py-0.5 rounded tracking-wider">
            MAILING SUPPORT
          </span>
          <h3 className="font-serif text-lg font-medium text-gray-900 mt-2 mb-1">Escalate Fits Concern</h3>
          <p className="text-xs text-gray-500 mb-4">
            Directly dispatch inquiries to our helpdesk at <strong className="text-gray-800">chbharath0779@gmail.com</strong> with one click.
          </p>
          <button 
            onClick={handleEmailHelpdesk} 
            disabled={isSendingHelpdesk}
            className="border border-gray-300 hover:border-black text-gray-800 px-5 py-2.5 rounded text-xs uppercase tracking-wider font-semibold bg-white flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
          >
            {isSendingHelpdesk ? <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-700" /> : <Mail className="w-3.5 h-3.5 text-amber-700" />}
            {isSendingHelpdesk ? "Dispatching..." : "Email Helpdesk"}
          </button>
        </div>

        {/* GRID LAYOUT: CREATE TICKET + FAQS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: CREATE TAILORING TICKET */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="font-serif text-xl font-bold text-gray-900 pb-3 border-b border-gray-100">CREATE TAILORING TICKET</h3>

            <form onSubmit={handleFileTicket} className="space-y-6 text-xs">
              <div>
                <label className="block uppercase tracking-wider text-gray-500 mb-2 font-semibold">Ticket Subject</label>
                <input 
                  type="text" 
                  value={subject} 
                  onChange={(e) => setSubject(e.target.value)} 
                  className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded text-gray-800 font-medium focus:outline-none focus:border-black" 
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider text-gray-500 mb-2 font-semibold">Elaborate Concerns</label>
                <textarea 
                  rows="4" 
                  placeholder="Please write detail measurements issues, order numbers WF-2026-X, or alteration specifications..." 
                  value={concerns}
                  onChange={(e) => setConcerns(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 p-4 rounded text-gray-800 focus:outline-none focus:border-black"
                />
              </div>

              <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/80 flex items-center gap-3 text-emerald-900">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 flex-shrink-0" />
                <span>Ticket is transmitted securely to chbharath0779@gmail.com and invokes dedicated Senior Master lookup within 2 working hours.</span>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-[#1C1816] hover:bg-black text-white py-4 rounded-lg text-xs uppercase tracking-[0.2em] font-semibold shadow-lg cursor-pointer transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSubmitting ? "Filing Ticket..." : "File Secure Ticket"}
              </button>
            </form>
          </div>

          {/* RIGHT: FREQUENTLY ASKED INQUIRIES */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="font-serif text-xl font-bold text-gray-900 pb-3 border-b border-gray-100 flex items-center gap-2">
              <span>❓</span> Frequently Asked Inquiries
            </h3>

            <div className="space-y-4 text-xs">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border-b border-gray-100 pb-4">
                  <button 
                    type="button"
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)} 
                    className="flex justify-between items-center w-full font-serif font-semibold text-sm text-gray-900 text-left py-1 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {openFaq === idx ? <ChevronUp className="w-4 h-4 text-amber-700 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                  </button>
                  {openFaq === idx && (
                    <p className="mt-2 text-gray-600 leading-relaxed pl-1">{faq.a}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* CONSULTATION BANNER */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs mt-8">
          <Sparkles className="w-8 h-8 text-amber-700 flex-shrink-0" />
          <div>
            <strong className="text-gray-900 font-serif block mb-1">
              DEDICATED ATELIER CONCIERGE ASSURANCE
            </strong>
            <p className="text-gray-500">
              Need immediate assistance on custom hand-embroidery or urgent delivery status? Our master tailors are available for direct secure consultations during business hours.
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}
