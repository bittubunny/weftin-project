import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingBag, Heart, User, Loader2 } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://weftin-project.onrender.com";

export default function Register_Page() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    showToast("Creating your secure atelier membership...");

    try {
      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
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
        showToast(data.detail || "Registration failed.");
      }
    } catch (err) {
      console.error("Register connection error:", err);
      showToast("Backend connection error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col justify-between">
      
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-2xl text-sm flex items-center gap-3 border border-amber-500/30">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          {toastMessage}
        </div>
      )}

      {/* TOP ANNOUNCEMENT BAR */}
      <div className="bg-[#1C1816] text-[#E5D5BC] text-xs py-2 text-center tracking-[0.2em] uppercase font-medium flex justify-between px-6">
        <span>&larr;</span>
        <span>LIMITED FESTIVE EDIT — 20% OFF SELECTED COUTURE PIECES</span>
        <span>&rarr;</span>
      </div>

      {/* NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-6 lg:px-12 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="hidden lg:flex items-center bg-gray-50 rounded-full px-4 py-2 w-64 border border-gray-200">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input type="text" placeholder="Search anything..." className="bg-transparent text-xs text-gray-800 focus:outline-none w-full" />
          </div>

          <div className="text-center flex flex-col items-center">
            <Link to="/" className="border border-black px-2 py-1 font-serif font-bold text-sm tracking-widest">WEFTIN</Link>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-xs font-medium text-gray-700 cursor-pointer">INR &or;</span>
            <Link to="/wishlist" className="text-gray-800 hover:text-black"><Heart className="w-5 h-5" /></Link>
            <Link to="/login" className="text-gray-800 hover:text-black"><User className="w-5 h-5" /></Link>
            <Link to="/cart" className="text-gray-800 hover:text-black"><ShoppingBag className="w-5 h-5" /></Link>
          </div>
        </div>

        <nav className="hidden md:flex justify-center items-center gap-8 mt-4 pt-3 border-t border-gray-100 text-xs tracking-[0.15em] uppercase text-gray-700 font-medium">
          <Link to="/" className="hover:text-black">Home</Link>
          <Link to="/shop" className="hover:text-black">Shop</Link>
          <a href="#" className="hover:text-black">Collections</a>
          <Link to="/custom-designs" className="hover:text-black">Custom Design</Link>
          <Link to="/lookbook" className="hover:text-black">Lookbook</Link>
          <Link to="/limited" className="hover:text-black">Limited Edition</Link>
        </nav>
      </header>

      {/* REGISTER CARD SECTION */}
      <main className="flex-1 flex items-center justify-center py-16 px-6">
        <div className="w-full max-w-md bg-white p-10 rounded-2xl border border-gray-200 shadow-sm text-center">
          <h2 className="font-serif text-3xl font-light text-gray-900 mb-2">Register Membership</h2>
          <p className="text-xs text-gray-500 mb-8 leading-relaxed">Create your private atelier account to access bespoke requests and measurements.</p>

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
              className={`w-full py-4 rounded text-xs uppercase tracking-[0.2em] font-semibold shadow-lg flex items-center justify-center gap-2 transition ${
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
