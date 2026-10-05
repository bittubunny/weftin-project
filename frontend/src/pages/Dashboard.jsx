import React, { useState } from "react";
import { Link } from "react-router-dom";
import { LayoutDashboard, User, ShoppingBag, Bell, LogOut, CheckCircle, Clock, Truck, FileText, ChevronRight, MessageSquare, Tag, Sparkles, Ruler } from "lucide-react";

export default function Dashboard() {
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const recentOrders = [
    { id: 'WF-2026-1842', name: 'Handwoven Silk Saree', date: 'June 18, 2026', price: '₹8,999', status: 'SHIPPED', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=300' },
    { id: 'WF-2026-1038', name: 'Premium Kurti Set', date: 'June 10, 2026', price: '₹3,499', status: 'DELIVERED', image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=300' },
    { id: 'WF-2026-1029', name: 'Festive Co-Ord Set', date: 'May 28, 2026', price: '₹4,299', status: 'DELIVERED', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=300' },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-gray-900 font-sans flex">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-2xl text-sm animate-fade-in flex items-center gap-3 border border-amber-500/30">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          {toastMessage}
        </div>
      )}

      {/* LEFT SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between hidden md:flex">
        <div>
          {/* Logo Brand Header */}
          <div className="p-6 border-b border-gray-100">
            <h1 className="font-serif text-xl tracking-[0.2em] font-bold text-gray-900">WEFTIN</h1>
            <span className="text-[9px] uppercase tracking-[0.25em] text-gray-500">Atelier Tailors</span>
          </div>

          {/* Navigation Menu */}
          <nav className="p-4 space-y-1">
            <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-wider bg-amber-50 text-amber-900 font-semibold rounded-lg border border-amber-200/60">
              <LayoutDashboard className="w-4 h-4 text-amber-700" /> Dashboard
            </Link>
            <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-wider text-gray-700 hover:bg-gray-50 rounded-lg">
              <User className="w-4 h-4" /> Profile
            </Link>
          </nav>
        </div>

        {/* Logout Section */}
        <div className="p-6 border-t border-gray-100">
          <button onClick={() => showToast('Logged out securely.')} className="flex items-center gap-3 text-xs uppercase tracking-wider text-rose-700 hover:text-rose-900 font-medium">
            <LogOut className="w-4 h-4" /> Log Out
          </button>
          <span className="block text-[10px] text-gray-400 mt-4">© 2026 WEFTIN Luxury Ltd.</span>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-h-screen">
        
        {/* TOP BAR */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
          <div className="text-xs uppercase tracking-widest text-gray-500">
            Portfolio <span className="mx-2">/</span> <span className="text-gray-900 font-semibold">Dashboard</span>
          </div>
          <div className="flex items-center gap-6">
           <Link to="/cart" className="relative text-gray-600 hover:text-black transition-colors">
  <ShoppingBag className="w-5 h-5" />
  <span className="absolute -top-1 -right-2 bg-amber-700 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
    4
  </span>
</Link>
            <button onClick={() => showToast('2 unread alerts')} className="relative text-gray-600 hover:text-black">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-2 bg-rose-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">2</span>
            </button>
            <Link to="/profile" className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250" alt="Meera Kapoor" className="w-9 h-9 rounded-full object-cover border border-amber-500" />
              <span className="text-xs font-semibold text-gray-800">Meera Kapoor</span>
            </Link>
          </div>
        </header>

        {/* DASHBOARD BODY */}
        <div className="p-8 lg:p-12 max-w-7xl mx-auto w-full space-y-10">
          
          {/* WELCOME BANNER WITH ACTIVE ORDER */}
          <div className="bg-[#5C1D24] text-white rounded-2xl p-8 shadow-xl relative overflow-hidden flex flex-col lg:flex-row justify-between items-center gap-8">
            <div className="max-w-xl">
              <span className="text-xs uppercase tracking-[0.3em] text-amber-300 font-semibold mb-2 block">WELCOME BACK, MEERA KAPOOR</span>
              <h2 className="text-3xl font-serif font-light mb-2">WEFTIN GOLD MEMBER</h2>
              <p className="text-gray-200 text-xs mb-6 leading-relaxed">
                Your luxury personal atelier book is active + Free alterations insurance enabled.
              </p>
              
              <div className="bg-black/30 p-4 rounded-xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                <div>
                  <span className="inline-block bg-amber-700/80 text-white px-2 py-0.5 rounded text-[10px] uppercase font-semibold mb-1">Status: Shipped</span>
                  <span className="block text-amber-300 font-semibold">Current Order: WF-2020-1042 — Expected Arrival: June 22, 2026</span>
                  <p className="text-gray-300 text-[11px]">Your Silk Saree is On The Way.</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => showToast('Tracking live status...')} className="bg-white text-gray-900 px-4 py-2 font-semibold uppercase tracking-wider rounded text-[10px]">
                    Track Order
                  </button>
                  <button onClick={() => showToast('Redirecting to shop...')} className="border border-white/40 text-white px-4 py-2 font-semibold uppercase tracking-wider rounded text-[10px] hover:bg-white/10">
                    Continue Shopping
                  </button>
                </div>
              </div>

              {/* Stat Counters */}
              <div className="flex gap-4 mt-6">
                <span className="text-xs bg-black/20 px-3 py-1.5 rounded border border-white/10">Total Orders: <strong>8</strong></span>
                <span className="text-xs bg-black/20 px-3 py-1.5 rounded border border-white/10">Wishlist Items: <strong>14</strong></span>
                <span className="text-xs bg-black/20 px-3 py-1.5 rounded border border-white/10">Saved Fits: <strong>3</strong></span>
              </div>
            </div>

            <div className="w-56 h-64 rounded-xl overflow-hidden shadow-2xl flex-shrink-0 border border-white/20 relative">
              <span className="absolute top-2 left-2 z-10 bg-amber-600 text-white text-[9px] uppercase px-2 py-0.5 rounded">Atelier</span>
              <img src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=500" alt="Active Garment" className="w-full h-full object-cover" />
              <div className="absolute bottom-2 left-2 right-2 text-center bg-black/60 backdrop-blur-sm py-1 rounded text-[11px] text-amber-300 font-bold">
                ₹8,999
              </div>
            </div>
          </div>

          {/* BOUTIQUE WORKSPACE ACTIONS */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {[
              { label: 'Track Order', sub: 'Sync live progress', icon: Truck },
              { label: 'Start Custom Design', sub: 'Personalized design request', icon: Sparkles },
              { label: 'Fit Profiles', sub: 'Digital measurement book', icon: Ruler },
              { label: 'View Wishlist', sub: 'Explore 14 saved items', icon: ShoppingBag },
              { label: 'Manage Address', sub: 'Edit delivery locations', icon: User },
              { label: 'Contact Support', sub: 'Premium concierge advisories', icon: MessageSquare }
            ].map((action, i) => {
              const IconComp = action.icon;
              return (
                <div key={i} onClick={() => showToast(`Opening ${action.label}...`)} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:border-amber-600 transition-colors flex flex-col justify-between">
                  <IconComp className="w-5 h-5 text-amber-700 mb-3" />
                  <div>
                    <h4 className="font-serif text-xs font-bold text-gray-900 mb-1">{action.label}</h4>
                    <p className="text-[10px] text-gray-400">{action.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CURRENT ORDER LIVE TIMELINE */}
          <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-gray-100 pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-amber-700 font-semibold block mb-1">CURRENT ORDER LIVE TIMELINE</span>
                <h3 className="font-serif text-lg text-gray-900">ORDER ID: WF-2026-1042 • SECURE COUTURE PACKAGE</h3>
              </div>
              <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-lg text-xs">
                <span className="text-gray-500">Current Status:</span> <strong className="text-amber-900">SHIPPED</strong>
                <span className="block text-[10px] text-gray-500">Estimated Delivery: <strong>June 22, 2026</strong></span>
              </div>
            </div>

            {/* Timeline Steps */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center mb-8">
              {[
                { title: 'Order Placed', time: 'June 18, 10:50 AM', done: true },
                { title: 'Confirmed', time: 'June 19, 09:15 AM', done: true },
                { title: 'Packed', time: 'June 19, 04:00 PM', done: true },
                { title: 'Shipped', time: 'June 20, 11:30 AM', done: true },
                { title: 'Out for Delivery', time: 'Pending', done: false },
                { title: 'Delivered', time: 'Expected June 22', done: false }
              ].map((step, idx) => (
                <div key={idx} className="relative flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-2 ${step.done ? 'bg-amber-700 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    {step.done ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span className="text-[11px] font-semibold text-gray-800">{step.title}</span>
                  <span className="text-[9px] text-gray-400 mt-0.5">{step.time}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-gray-100 text-xs text-gray-500 gap-4">
              <span><strong>Carrier:</strong> Delhivery Express Premium • <strong>Waybill:</strong> #WF-DEL-5819741</span>
              <div className="flex gap-3">
                <button onClick={() => showToast('Tracking package live')} className="bg-black text-white px-4 py-2 rounded text-[10px] uppercase tracking-wider font-semibold">Track Order</button>
                <button onClick={() => showToast('Viewing order details')} className="border border-gray-300 px-4 py-2 rounded text-[10px] uppercase tracking-wider font-semibold">View Details</button>
                <button onClick={() => showToast('Downloading invoice PDF')} className="border border-gray-300 px-4 py-2 rounded text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" /> Download Invoice
                </button>
              </div>
            </div>
          </div>

          {/* ATELIER CUSTOM TAILORING REQUEST */}
          <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-amber-700 font-semibold block mb-1">ATELIER CUSTOM TAILORING REQUEST</span>
                <h3 className="font-serif text-lg text-gray-900">REQUEST REFERENCE: CD-2026-214 • BRIDAL CRIMSON LEHENGA</h3>
              </div>
              <span className="bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Quotation Pending</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center mb-8">
              <div className="lg:col-span-2">
                <h4 className="font-serif text-base font-bold mb-1">Bridal Crimson Lehenga (Zari & Kasab Embroideries)</h4>
                <p className="text-xs text-gray-500 mb-4">Occasion: Wedding Celebration • Date Submitted: June 14, 2026 | Looking for matching hand embroidery on raw silk base with gold zari work and custom waist latkan.</p>
                <div className="flex gap-4">
                  <img src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=200" alt="Ref 1" className="w-20 h-24 object-cover rounded border" />
                  <img src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=200" alt="Ref 2" className="w-20 h-24 object-cover rounded border" />
                  <div className="flex items-center text-xs text-gray-400 font-medium">+ 2 technical blueprints attached</div>
                </div>
              </div>

              {/* Designer Note Box */}
              <div className="bg-amber-50/60 p-5 rounded-xl border border-amber-200/60">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-amber-700 text-white flex items-center justify-center font-bold text-xs">DS</div>
                  <div>
                    <h5 className="text-xs font-bold text-gray-900">Devansh S.</h5>
                    <span className="text-[10px] text-gray-500">Atelier Master Designer</span>
                  </div>
                </div>
                <p className="text-xs text-gray-700 italic">"Namaste! We mapped your Bridal Lehenga sketches to verified mulberry silk threadings. Review the estimated yarn quotation below."</p>
                <button onClick={() => showToast('Opening chat with designer...')} className="mt-4 w-full bg-black text-white py-2 rounded text-[10px] uppercase tracking-wider font-semibold">
                  Chat with Consultant
                </button>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs text-amber-900 mb-6 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse"></span>
              Quotation approval is required before production starts. Zari gold threads and Premium Silk yarn allocations will begin immediately upon approval.
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-gray-100 gap-4">
              <span className="text-xs"><strong>Estimated Base Quote:</strong> ₹95,000 (Inclusive of weaving labors)</span>
              <div className="flex gap-3">
                <button onClick={() => showToast('Opening detailed quote review...')} className="bg-black text-white px-6 py-2.5 rounded text-xs uppercase tracking-wider font-semibold">Review Request Details</button>
                <button onClick={() => showToast('Uploading new reference blueprint...')} className="border border-gray-300 px-6 py-2.5 rounded text-xs uppercase tracking-wider font-semibold">Upload New Reference</button>
              </div>
            </div>
          </div>

          {/* PERSONALIZED CURATIONS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-amber-700 font-semibold block mb-1">SAVE ₹1,500</span>
                <div className="relative h-48 rounded-lg overflow-hidden mb-4">
                  <img src="https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=400" alt="" className="w-full h-full object-cover" />
                </div>
                <h4 className="font-serif text-base font-bold mb-1">Embroidered Anarkali Set</h4>
                <p className="text-xs text-gray-500 mb-2">Royal Blue Velvet luxury bridal fabric set.</p>
                <div className="flex items-baseline gap-3">
                  <span className="text-lg font-bold text-gray-900">₹5,499</span>
                  <span className="text-xs text-gray-400 line-through">₹6,999</span>
                </div>
              </div>
              <button onClick={() => showToast('Moved to shopping cart!')} className="mt-6 w-full bg-black text-white py-2.5 rounded text-xs uppercase tracking-wider font-semibold">
                Move to Cart
              </button>
            </div>

            {/* Coupon Card */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-amber-700 font-semibold block mb-1">MEMBERS EXCLUSIVE</span>
                <div className="bg-[#FAF8F5] border-2 border-dashed border-amber-300 p-6 rounded-xl text-center my-4">
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 block mb-1">FESTIVE LOYALTY COUPON</span>
                  <h3 className="font-serif text-2xl font-bold tracking-wider text-amber-900 mb-2">WEFTIN15</h3>
                  <span className="text-xs font-semibold text-emerald-700">15% OFF BESPOKE EDITIONS</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  15% off on custom cataloging. Applicable for direct custom tailoring bookings, sarees, and festive kids wedding outfits. Valid till June 30, 2026.
                </p>
              </div>
              <button onClick={() => { navigator.clipboard?.writeText('WEFTIN15'); showToast('Copied coupon WEFTIN15!'); }} className="mt-6 w-full border border-gray-300 hover:border-black text-gray-900 py-2.5 rounded text-xs uppercase tracking-wider font-semibold">
                Copy Code
              </button>
            </div>

            {/* Curated For You */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] uppercase tracking-widest text-amber-700 font-semibold">CURATED FOR YOU</span>
                  <span className="text-[10px] text-gray-400">Festive Edit</span>
                </div>
                <div className="space-y-3">
                  {[
                    { name: 'Pure Silk Saree', price: '₹12,499' },
                    { name: 'Festive Kurti Set', price: '₹3,499' },
                    { name: 'Designer Lehenga', price: '₹45,000' }
                  ].map((cur, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div>
                        <h5 className="text-xs font-bold text-gray-900">{cur.name}</h5>
                        <span className="text-[11px] text-gray-600">{cur.price}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={() => showToast('Examining full curation list...')} className="mt-6 w-full border border-gray-300 py-2.5 rounded text-xs uppercase tracking-wider font-semibold">
                Examine All Curations
              </button>
            </div>
          </div>

          {/* SAVED MEASUREMENTS PREVIEW */}
          <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-amber-700 font-semibold block mb-1">SAVED MEASUREMENTS PREVIEW</span>
                <h3 className="font-serif text-lg text-gray-900">Accurate measurements help us deliver a better fit. Select, review, or quick-adjust files.</h3>
              </div>
              <button onClick={() => showToast('Opening fit manager')} className="bg-amber-700 text-white px-4 py-2 rounded text-xs uppercase tracking-wider font-semibold">Manage All Fit Profiles</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#FAF8F5] p-6 rounded-xl border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-serif text-sm font-bold">Meera Kapoor <span className="text-[10px] font-normal text-gray-500 block">TYPE: SELF + DEFAULT FIT PROFILE</span></h4>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full">Complete</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center text-xs bg-white p-4 rounded-lg border border-gray-200 mb-4">
                  <div><span className="text-[10px] text-gray-400 block">BUST</span><strong>36"</strong></div>
                  <div><span className="text-[10px] text-gray-400 block">WAIST</span><strong>28"</strong></div>
                  <div><span className="text-[10px] text-gray-400 block">HIPS</span><strong>38"</strong></div>
                  <div><span className="text-[10px] text-gray-400 block">SHOULDER</span><strong>14.5"</strong></div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => showToast('Viewing measurements')} className="py-2 bg-black text-white text-[10px] uppercase tracking-wider rounded">View Details</button>
                  <button onClick={() => showToast('Editing profile')} className="py-2 border border-gray-300 text-gray-700 text-[10px] uppercase tracking-wider rounded">Edit</button>
                  <button onClick={() => showToast('Set as custom fit')} className="py-2 border border-gray-300 text-gray-700 text-[10px] uppercase tracking-wider rounded">Use for custom</button>
                </div>
              </div>

              <div className="bg-[#FAF8F5] p-6 rounded-xl border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-serif text-sm font-bold">Bridal Lehenga Fit <span className="text-[10px] font-normal text-gray-500 block">TYPE: EVENT + WEDDING OUTFIT</span></h4>
                  <span className="bg-amber-100 text-amber-900 text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full">Needs Review</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center text-xs bg-white p-4 rounded-lg border border-gray-200 mb-4">
                  <div><span className="text-[10px] text-gray-400 block">BUST</span><strong>35.5"</strong></div>
                  <div><span className="text-[10px] text-gray-400 block">WAIST</span><strong>27.5"</strong></div>
                  <div><span className="text-[10px] text-gray-400 block">HIPS</span><strong>39.5"</strong></div>
                  <div><span className="text-[10px] text-gray-400 block">SHOULDER</span><strong>14.7"</strong></div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => showToast('Viewing bridal fit')} className="py-2 bg-black text-white text-[10px] uppercase tracking-wider rounded">View</button>
                  <button onClick={() => showToast('Editing bridal fit')} className="py-2 border border-gray-300 text-gray-700 text-[10px] uppercase tracking-wider rounded">Edit</button>
                  <button onClick={() => showToast('Updating bridal fit')} className="py-2 border border-gray-300 text-gray-700 text-[10px] uppercase tracking-wider rounded">Update</button>
                </div>
              </div>
            </div>
          </div>

          {/* RECENT ORDERS LEDGER TABLE */}
          <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif text-lg text-gray-900">Recent Orders Ledger</h3>
              <Link to="/profile" className="text-xs text-amber-700 uppercase tracking-widest font-semibold hover:underline">
                See All Orders →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 uppercase tracking-wider">
                    <th className="pb-3">Order ID</th>
                    <th className="pb-3">Product Information</th>
                    <th className="pb-3">Order Date</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-gray-50">
                      <td className="py-4 font-semibold text-gray-900">{ord.id}</td>
                      <td className="py-4 flex items-center gap-3">
                        <img src={ord.image} alt="" className="w-8 h-10 object-cover rounded" />
                        {ord.name}
                      </td>
                      <td className="py-4">{ord.date}</td>
                      <td className="py-4 font-semibold">{ord.price}</td>
                      <td className="py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${ord.status === 'SHIPPED' ? 'bg-sky-100 text-sky-800' : 'bg-emerald-100 text-emerald-800'}`}>
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <button onClick={() => showToast(`Tracking order ${ord.id}`)} className="bg-black text-white px-3 py-1.5 rounded uppercase text-[10px]">
                          {ord.status === 'SHIPPED' ? 'Track' : 'View'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SUPPORT & LOGGING STREAM GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-serif text-lg text-gray-900 mb-1">Premium Atelier Support Desk</h3>
                <p className="text-xs text-gray-500 mb-6">Need immediate help with custom thread sizes or weavings? Our dedicated advisors are live.</p>
              </div>
              <div className="space-y-3">
                <button onClick={() => showToast('Connecting to WhatsApp...')} className="w-full bg-black text-white py-3 rounded text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-400" /> Connect on WhatsApp
                </button>
                <button onClick={() => showToast('Rapid callback requested!')} className="w-full border border-gray-300 py-3 rounded text-xs uppercase tracking-wider font-semibold">
                  Request Rapid Callback
                </button>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="font-serif text-lg text-gray-900 mb-1">Atelier Logging Stream</h3>
              <p className="text-xs text-gray-500 mb-6">Real-time status operations ledger</p>
              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
                  <span className="w-2 h-2 rounded-full bg-sky-500 mt-1.5"></span>
                  <div>
                    <strong className="text-gray-900 block">Order WF-2026-1042 Shipped</strong>
                    <span className="text-[11px] text-gray-500">Secure packaging dispatched via Delivery Express.</span>
                    <span className="text-[9px] text-gray-400 block mt-0.5">Just now</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-rose-600 mt-1.5"></span>
                  <div>
                    <strong className="text-gray-900 block">Quotation Pending on CD-2026-214</strong>
                    <span className="text-[11px] text-gray-500">Atelier designer published raw gold yarn calculations.</span>
                    <span className="text-[9px] text-gray-400 block mt-0.5">2 hours ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

    </div>
  );
}