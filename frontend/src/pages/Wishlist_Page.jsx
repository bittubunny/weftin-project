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
  ShoppingBag,
  Trash2,
  Sparkles,
  X,
  Menu,
  ChevronRight,
  Settings,
  Search
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://weftin-project.onrender.com";

export default function Wishlist_Page() {
  const navigate = useNavigate();

  // ==================================================
  // USER
  // ==================================================

  const [currentUser, setCurrentUser] =
    useState(null);
  const [userAvatar, setUserAvatar] = useState("");

  // ==================================================
  // WISHLIST
  // ==================================================

  const [wishlist, setWishlist] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  // ==================================================
  // NOTIFICATIONS
  // ==================================================

  const [unreadCount, setUnreadCount] =
    useState(0);

  // ==================================================
  // MOBILE MENU & SEARCH
  // ==================================================

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);
  const [searchText, setSearchText] = useState("");

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // ==================================================
  // TOAST
  // ==================================================

  const [toastMessage, setToastMessage] =
    useState("");

  const showToast = useCallback((msg) => {
    setToastMessage(msg);

    window.setTimeout(() => {
      setToastMessage("");
    }, 3000);
  }, []);

  // ==================================================
  // LOAD USER & AVATAR
  // ==================================================

  useEffect(() => {
    try {
      const storedUser =
        localStorage.getItem("weftin_user");

      if (!storedUser) {
        navigate("/login");
        return;
      }

      const savedUser =
        JSON.parse(storedUser);

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
      console.error(
        "Unable to read user:",
        error
      );

      navigate("/login");
    }
  }, [navigate]);

  // ==================================================
  // USER EMAIL
  // ==================================================

  const userEmail =
    currentUser?.email || "";

  // ==================================================
  // FETCH WISHLIST
  // ==================================================

  const fetchWishlist =
    useCallback(async (email) => {
      if (!email) {
        return;
      }

      const token = localStorage.getItem("weftin_token");

      try {
        setLoading(true);

        const response =
          await fetch(
            `${API_BASE_URL}/api/wishlist/${encodeURIComponent(
              email
            )}`,
            {
              headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {})
              }
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.detail ||
              "Failed to load wishlist."
          );
        }

        setWishlist(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.error(
          "Error fetching wishlist:",
          error
        );

        setWishlist([]);

        showToast(
          error?.message ||
            "Unable to load wishlist."
        );
      } finally {
        setLoading(false);
      }
    }, [showToast]);

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
        const response =
          await fetch(
            `${API_BASE_URL}/api/notifications/unread-count/${encodeURIComponent(
              userEmail
            )}`
          );

        if (!response.ok) {
          return;
        }

        const data =
          await response.json();

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
      return;
    }

    fetchWishlist(userEmail);
    loadUnreadCount();
  }, [
    userEmail,
    fetchWishlist,
    loadUnreadCount
  ]);

  // ==================================================
  // REMOVE WISHLIST ITEM
  // ==================================================

  const removeItem = async (
    wishlistId
  ) => {
    const token = localStorage.getItem("weftin_token");

    try {
      const response =
        await fetch(
          `${API_BASE_URL}/api/wishlist/${wishlistId}?user_email=${encodeURIComponent(
            userEmail
          )}`,
          {
            method: "DELETE",
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {})
            }
          }
        );

      if (!response.ok) {
        let errorMessage =
          "Failed to remove item.";

        try {
          const data =
            await response.json();

          errorMessage =
            data?.detail ||
            errorMessage;
        } catch {
          // Ignore JSON parsing error
        }

        throw new Error(
          errorMessage
        );
      }

      setWishlist((previousWishlist) =>
        previousWishlist.filter(
          (item) =>
            item.id !== wishlistId
        )
      );

      showToast(
        "Removed item from wishlist."
      );
    } catch (error) {
      console.error(
        "Remove wishlist error:",
        error
      );

      showToast(
        error?.message ||
          "Backend connection error."
      );
    }
  };

  // ==================================================
  // MOVE TO CART
  // ==================================================

  const moveToCart = (item) => {
    try {
      const cart =
        JSON.parse(
          localStorage.getItem(
            "weftin_cart"
          )
        ) || [];

      const existingIndex =
        cart.findIndex(
          (cartItem) =>
            Number(
              cartItem.product_id ||
                cartItem.productId ||
                cartItem.id
            ) ===
            Number(item.product_id)
        );

      if (existingIndex !== -1) {
        cart[existingIndex] = {
          ...cart[existingIndex],
          qty:
            Number(
              cart[existingIndex].qty || 1
            ) + 1
        };
      } else {
        cart.push({
          id: item.product_id,
          product_id: item.product_id,
          name: item.name,
          price: item.price,
          qty: 1,
          image: item.image,
          category:
            item.category || "",
          tag:
            item.tag || "ATELIER"
        });
      }

      localStorage.setItem(
        "weftin_cart",
        JSON.stringify(cart)
      );

      removeItem(item.id);

      showToast(
        `${item.name} moved to Shopping Cart.`
      );
    } catch (error) {
      console.error(
        "Move to cart error:",
        error
      );

      showToast(
        "Unable to move item to cart."
      );
    }
  };

  // ==================================================
  // LOGOUT
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

  // ==================================================
  // USER DISPLAY HELPERS
  // ==================================================

  const userName =
    currentUser?.name ||
    currentUser?.full_name ||
    currentUser?.username ||
    "WEFTIN Member";

  const userInitial =
    userName
      .charAt(0)
      .toUpperCase() || "W";

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

  // ==================================================
  // MAIN
  // ==================================================

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-gray-900 font-sans relative">

      {/* ==================================================
          TOAST
      ================================================== */}

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] bg-gray-900 text-white px-6 py-3 rounded-lg shadow-2xl text-sm flex items-center gap-3 border border-amber-500/30">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0"></span>
          <span className="flex-1">
            {toastMessage}
          </span>
          <button
            onClick={() =>
              setToastMessage("")
            }
            className="text-gray-400 hover:text-white cursor-pointer"
          >
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
              <Heart className="w-5 h-5 fill-amber-700 text-amber-700" />
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
            <Link to="/wishlist" onClick={closeMobileMenu} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-amber-100/60 text-amber-900 font-semibold group">
              <span className="flex items-center gap-3"><Heart className="w-4 h-4 text-amber-700" />Saved Wishlist</span>
              <ChevronRight className="w-3.5 h-3.5 text-amber-700" />
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

      {/* =================================================*
          MAIN CONTENT AREA
      ================================================== */}

      <main className="p-4 sm:p-6 lg:p-8 xl:p-12 max-w-7xl mx-auto w-full">

        {/* TITLE */}

        <div className="mb-8">

          <div className="flex items-center gap-2 text-amber-700 mb-1">

            <Heart className="w-5 h-5 fill-amber-700 text-amber-700" />

            <h2 className="text-2xl sm:text-3xl font-serif text-gray-900">
              My Luxury Wishlist
            </h2>

          </div>

          <p className="text-xs text-gray-500">
            View saved products and securely
            transfer items to your shopping cart.
          </p>

        </div>

        {/* ==================================================
            LOADING
        ================================================== */}

        {loading ? (

          <div className="text-center py-20 text-gray-400 text-xs uppercase tracking-widest animate-pulse">
            Loading your saved luxury items...
          </div>

        ) : wishlist.length === 0 ? (

          /* ==================================================
              EMPTY WISHLIST
          ================================================== */

          <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-16 text-center shadow-sm">

            <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />

            <h3 className="font-serif text-lg font-bold text-gray-800 mb-2">
              Your Wishlist is Empty
            </h3>

            <p className="text-xs text-gray-500 mb-6">
              Explore our atelier collections and
              tap the heart icon on any product to
              save it here.
            </p>

            <Link
              to="/shop"
              className="inline-block bg-black text-white px-6 py-3 rounded uppercase text-xs font-bold tracking-widest hover:bg-gray-800 cursor-pointer"
            >
              Explore Shop Catalog
            </Link>

          </div>

        ) : (

          /* ==================================================
              WISHLIST GRID
          ================================================== */

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

            {wishlist.map((item) => (

              <div
                key={item.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm flex flex-col justify-between group"
              >

                <div>

                  {/* IMAGE */}

                  <div className="relative h-72 bg-gray-100 overflow-hidden">

                    <span className="absolute top-3 left-3 z-10 text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded bg-amber-100 text-amber-900">
                      {item.tag ||
                        "ATELIER"}
                    </span>

                    <button
                      onClick={() =>
                        removeItem(
                          item.id
                        )
                      }
                      className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white text-rose-700 shadow cursor-pointer z-10"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {item.image ? (

                      <img
                        src={item.image}
                        alt={
                          item.name ||
                          "Wishlist item"
                        }
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />

                    ) : (

                      <div className="w-full h-full flex items-center justify-center">
                        <Heart className="w-10 h-10 text-gray-300" />
                      </div>

                    )}

                  </div>

                  {/* PRODUCT DETAILS */}

                  <div className="p-4">

                    <span className="text-[10px] text-amber-800 font-semibold block mb-1">
                      ★ 4.9 Expert Atelier Approved
                    </span>

                    <h3 className="font-serif text-sm font-medium text-gray-900 mb-2">
                      {item.name}
                    </h3>

                    <p className="text-xs font-bold text-gray-950">
                      {item.price}
                    </p>

                  </div>

                </div>

                {/* MOVE TO CART */}

                <div className="p-4 pt-0">

                  <button
                    onClick={() =>
                      moveToCart(item)
                    }
                    className="w-full py-2.5 bg-[#1C1816] hover:bg-black text-white text-[10px] uppercase tracking-wider rounded font-semibold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >

                    <ShoppingBag className="w-3.5 h-3.5" />

                    Move to Shopping Cart

                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

        {/* =================================================*
            CONSULTATION BANNER
        ================================================== */}

        <div className="bg-white p-5 sm:p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs mt-8">

          <Sparkles className="w-8 h-8 text-amber-700 flex-shrink-0" />

          <div>

            <strong className="text-gray-900 font-serif block mb-1">
              TAILORS WISHLIST CONSULTATION OPTION
            </strong>

            <p className="text-gray-500">
              Curious about physical draping volume
              or how a particular saree matches your
              measurements profile? Open live support
              and select "Consult Wishlist Items".
            </p>

          </div>

        </div>

      </main>

    </div>
  );
}
