import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Layers, XCircle, ShieldCheck, Lock, Mail, KeyRound, Loader2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "https://weftin-project.onrender.com";

export default function Admin_HomeCMS_Page() {
  const navigate = useNavigate();

  const [toastMessage, setToastMessage] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Admin Login Prompt States
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminEmailInput, setAdminEmailInput] = useState("");
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [authenticating, setAuthenticating] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 3000);
  };

  // Check if session is already authenticated as admin ID 10
  useEffect(() => {
    const sessionAuth = sessionStorage.getItem("weftin_admin_auth");
    const storedUser = JSON.parse(localStorage.getItem("weftin_user") || "null");

    if (sessionAuth === "true" && storedUser?.id === 10) {
      setIsAdminAuthenticated(true);
      fetchProducts();
    } else {
      setLoading(false);
    }
  }, []);

  // Handle Admin Credential Submission & ID 10 Verification
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!adminEmailInput.trim() || !adminPasswordInput.trim()) {
      showToast("Please enter both admin email and password.");
      return;
    }

    setAuthenticating(true);

    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: adminEmailInput.trim().toLowerCase(),
          password: adminPasswordInput
        })
      });

      const data = await res.json();

      if (res.ok && data?.user) {
        // Explicitly verify ID 10 and target admin email
        const userId = Number(data.user.id || data.user.user_id);
        const userEmail = String(data.user.email || "").trim().toLowerCase();

        if (userId === 10 && userEmail === "weftin.admin891@gmail.com") {
          sessionStorage.setItem("weftin_admin_auth", "true");
          setIsAdminAuthenticated(true);
          showToast("Admin credentials verified successfully (ID: 10).");
          fetchProducts();
        } else {
          showToast("Access denied. Account does not match authorized admin ID (10).");
        }
      } else {
        showToast(data.detail || "Invalid admin credentials.");
      }
    } catch (err) {
      console.error("Admin login error:", err);
      showToast("Backend connection error during authentication.");
    } finally {
      setAuthenticating(false);
    }
  };

  // ============================================================
  // FETCH ALL PRODUCTS FROM SHOP
  // ============================================================
  const fetchProducts = async () => {
    const token = localStorage.getItem("weftin_token");

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/admin/home-products`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      if (!res.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching Home CMS products:", err);
      showToast("Failed to load Shop products.");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // CHANGE HOME SECTION
  // ============================================================
  const handlePlacementChange = async (productId, newPlacement) => {
    const token = localStorage.getItem("weftin_token");

    try {
      const res = await fetch(
        `${API_URL}/api/admin/home-products/${productId}/placement`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            section_placement: newPlacement
          })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to update placement.");
      }

      showToast(
        newPlacement === "Not on Home"
          ? "Product removed from Home page."
          : `Product assigned to ${newPlacement}.`
      );

      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product.id === productId
            ? { ...product, section_placement: newPlacement }
            : product
        )
      );
    } catch (err) {
      console.error(err);
      showToast(err.message || "Backend connection error.");
    }
  };

  const handleRemoveFromHome = async (productId) => {
    await handlePlacementChange(productId, "Not on Home");
  };

  // ============================================================
  // ADMIN CREDENTIAL GATE MODAL (IF NOT AUTHENTICATED)
  // ============================================================
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] text-gray-900 font-sans flex items-center justify-center p-6 relative">
        
        {/* TOAST */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-[100] bg-gray-900 text-white px-6 py-3 rounded-lg shadow-2xl text-sm flex items-center gap-3 border border-amber-500/30">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            {toastMessage}
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 sm:p-10 max-w-md w-full">
          <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-200">
            <Lock className="w-6 h-6" />
          </div>

          <h2 className="font-serif text-2xl font-light text-center text-gray-900 mb-1">Admin Portal Security</h2>
          <p className="text-xs text-gray-500 text-center mb-8 leading-relaxed">
            Please enter admin credentials (ID: 10) to unlock the Home Page Product CMS.
          </p>

          <form onSubmit={handleAdminLogin} className="space-y-5 text-xs">
            <div>
              <label className="block uppercase tracking-wider text-gray-500 mb-2 font-semibold">ADMIN EMAIL *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="weftin.admin891@gmail.com"
                  value={adminEmailInput}
                  onChange={(e) => setAdminEmailInput(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-gray-200 pl-10 pr-4 py-3 rounded text-gray-800 focus:outline-none focus:border-black"
                />
              </div>
            </div>

            <div>
              <label className="block uppercase tracking-wider text-gray-500 mb-2 font-semibold">ADMIN PASSWORD *</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-gray-200 pl-10 pr-4 py-3 rounded text-gray-800 focus:outline-none focus:border-black"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={authenticating}
              className="w-full py-3.5 bg-black hover:bg-gray-800 text-white rounded text-xs uppercase tracking-[0.2em] font-semibold flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
            >
              {authenticating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying Admin (ID 10)...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  Unlock Admin CMS
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-xs text-gray-500 hover:text-black underline cursor-pointer"
            >
              Return to Member Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN ADMIN CMS INTERFACE (IF AUTHENTICATED AS ID 10)
  // ============================================================
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-gray-900 font-sans p-8 lg:p-12 relative">

      {/* TOAST */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] bg-gray-900 text-white px-6 py-3 rounded-lg shadow-2xl text-sm flex items-center gap-3 border border-amber-500/30">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          {toastMessage}
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-8">

        {/* HEADER */}
        <div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-amber-800 font-semibold mb-2 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Shop / Admin Hub
          </Link>

          <div className="flex justify-between items-center">
            <div>
              <h1 className="font-serif text-3xl font-light text-gray-900">
                Home Page Product CMS (Admin ID: 10)
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Select existing products from your Shop catalog and assign them to Home Page sections. Changes are saved instantly to NeonDB.
              </p>
            </div>
            <button
              onClick={() => {
                sessionStorage.removeItem("weftin_admin_auth");
                setIsAdminAuthenticated(false);
                showToast("Logged out of admin session.");
              }}
              className="text-xs text-rose-700 font-semibold uppercase tracking-wider border border-rose-200 bg-white hover:bg-rose-50 px-4 py-2 rounded-lg cursor-pointer"
            >
              Lock Admin Session
            </button>
          </div>
        </div>

        {/* PRODUCT LIST */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <h3 className="font-serif text-lg font-bold mb-6 flex items-center gap-2 text-gray-950">
            <Layers className="w-5 h-5 text-amber-700" />
            Shop Catalog Products ({products.length})
          </h3>

          {loading ? (
            <div className="text-center py-16">
              <p className="text-xs text-gray-400 uppercase tracking-wider">Loading Shop products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xs text-gray-400 uppercase tracking-wider">No products found in the Shop database.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 gap-5"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-20 object-cover rounded shadow-sm flex-shrink-0"
                    />

                    <div className="min-w-0">
                      <h4 className="font-serif text-sm font-bold text-gray-900">
                        {product.name}
                      </h4>

                      <p className="text-xs text-gray-500 mt-1">
                        {product.price} {" • "} Category: <span className="font-semibold text-gray-700">{product.category}</span>
                      </p>

                      <p className="text-[10px] text-gray-400 mt-1">
                        Shop Product ID: {product.id}
                      </p>

                      <span
                        className={`inline-block mt-2 text-[9px] uppercase font-bold tracking-widest px-2 py-1 rounded ${
                          product.section_placement === "Not on Home"
                            ? "bg-gray-200 text-gray-600"
                            : "bg-amber-100 text-amber-900"
                        }`}
                      >
                        {product.section_placement === "Not on Home"
                          ? "Not on Home"
                          : `Home: ${product.section_placement}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
                    <select
                      value={product.section_placement || "Not on Home"}
                      onChange={(e) =>
                        handlePlacementChange(product.id, e.target.value)
                      }
                      className="bg-white border border-amber-300 text-xs px-4 py-2.5 rounded font-bold text-amber-950 focus:outline-none focus:border-black shadow-sm cursor-pointer"
                    >
                      <option value="Not on Home">Not on Home</option>
                      <option value="Featured">Featured Collection</option>
                      <option value="Best Seller">Best Seller</option>
                      <option value="Trending">Trending Now</option>
                    </select>

                    {product.section_placement !== "Not on Home" && (
                      <button
                        onClick={() => handleRemoveFromHome(product.id)}
                        className="p-2.5 bg-rose-50 text-rose-700 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer"
                        title="Remove from Home page"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
