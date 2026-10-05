import React, { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { LayoutDashboard, Package, Scissors, Ruler, Heart, MapPin, User, Bell, Headphones, LogOut, ArrowLeft, Download, Check, ShieldCheck, RefreshCw, XCircle } from "lucide-react";

export default function TrackOrder_Page() {
  const { id } = useParams();
  const location = useLocation();
  const orderData = location.state?.order || {
    id: id || "WF-2026-1042",
    name: "Handwoven Silk Saree",
    category: "SAREE",
    date: "June 18, 2026",
    arrival: "June 22, 2026",
    status: "SHIPPED",
    price: "₹8,999",
    image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=300"
  };

  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const milestones = [
    { title: "Order Placed", desc: "Payment validated successfully via secured Visa pipeline.", date: "June 18, 2026", completed: true },
    { title: "Design & Layout Verified", desc: 'Craft specialists configured fabric alignment check against measurements profile "Meera Kapoor - Self".', date: "June 18, 2026", completed: true },
    { title: "Weaving & Inspection", desc: "Outfit hand finished, pressed, and delicate gold tags applied.", date: "June 18, 2026", completed: true },
    { title: "Shipped via Air Cargo", desc: "Handled by Bluedart Premium Logistics. Air Waybill: AWB-3912952A.", date: "June 18, 2026", completed: true },
    { title: "Delivered Successfully", desc: "Hand delivered with protective luxury box. Returns/Alteration requests are eligible for 10 days.", date: "Expected June 22, 2026", completed: false }
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-gray-900 font-sans flex">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-2xl text-sm flex items-center gap-3 border border-amber-500/30">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          {toastMessage}
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between hidden md:flex sticky top-0 h-screen">
        <div>
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <div className="bg-black text-[#E5D5BC] w-8 h-8 rounded flex items-center justify-center font-serif font-bold">W</div>
            <div>
              <h1 className="font-serif text-sm tracking-[0.2em] font-bold text-gray-900">WEFTIN</h1>
              <span className="text-[9px] uppercase tracking-[0.2em] text-gray-400 block">ATELIER TAILORS</span>
            </div>
          </div>

          <div className="m-4 p-3 bg-amber-50/60 rounded-xl border border-amber-200/60 flex items-center gap-3">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100" alt="Meera Kapoor" className="w-10 h-10 rounded-full object-cover border" />
            <div>
              <h4 className="text-xs font-bold text-gray-900">Meera Kapoor</h4>
              <span className="text-[9px] uppercase font-bold tracking-widest text-amber-800">GOLD MEMBER</span>
            </div>
          </div>

          <nav className="p-4 space-y-1 text-xs font-medium text-gray-600">
            <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700">
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </Link>
            <Link to="/orders" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-100/60 text-amber-900 font-semibold border-l-4 border-amber-700">
              <Package className="w-4 h-4" /> My Orders
            </Link>
            <Link to="/custom-designs" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700">
              <Scissors className="w-4 h-4" /> Custom Designs
            </Link>
            <Link to="/measurements" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700">
              <Ruler className="w-4 h-4" /> Measurements
            </Link>
            <Link to="/wishlist" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700">
              <Heart className="w-4 h-4" /> Wishlist
            </Link>
            <Link to="/addresses" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700">
              <MapPin className="w-4 h-4" /> Addresses
            </Link>
            <Link to="/profile" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700">
              <User className="w-4 h-4" /> Profile
            </Link>
            <Link to="/notifications" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700 justify-between">
              <span className="flex items-center gap-3"><Bell className="w-4 h-4" /> Notifications</span>
              <span className="bg-rose-700 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">2</span>
            </Link>
            <Link to="/support" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700">
              <Headphones className="w-4 h-4" /> Support
            </Link>
          </nav>
        </div>

        <div className="p-4 border-t border-gray-100">
          <Link to="/" className="flex items-center gap-3 px-4 py-2 text-xs text-rose-700 font-semibold hover:bg-rose-50 rounded-lg">
            <LogOut className="w-4 h-4" /> Log out
          </Link>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
          <div className="text-xs text-gray-400">
            Portfolio <span className="mx-2">&gt;</span> <Link to="/orders" className="hover:underline">MY ORDERS</Link> <span className="mx-2">&gt;</span> <span className="text-gray-900 font-semibold font-mono">{orderData.id}</span>
          </div>
          <div className="flex items-center gap-4">
            <Bell className="w-5 h-5 text-gray-600 cursor-pointer" />
            <div className="flex items-center gap-2 border-l pl-4 border-gray-200">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100" alt="Meera Kapoor" className="w-8 h-8 rounded-full object-cover border" />
              <span className="text-xs font-semibold text-gray-800">Meera Kapoor</span>
            </div>
          </div>
        </header>

        <main className="p-8 lg:p-12 max-w-7xl w-full space-y-6">
          
          <Link to="/orders" className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-amber-800 font-semibold hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Orders List
          </Link>

          {/* Header Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold block mb-1">ORDER TRACKING • <span className="font-mono">{orderData.id}</span></span>
              <h2 className="text-3xl font-serif font-light text-gray-900">{orderData.name}</h2>
              <p className="text-xs text-gray-500 mt-1">Ordered on {orderData.date} • Estimated Arrival: <strong className="text-amber-800">{orderData.arrival}</strong></p>
            </div>
            <button onClick={() => showToast('Downloading secure invoice PDF...')} className="bg-white border border-gray-300 hover:border-black text-gray-800 px-5 py-3 rounded-lg text-xs uppercase tracking-wider font-semibold flex items-center gap-2 shadow-sm">
              <Download className="w-4 h-4 text-amber-700" /> Download Invoice Receipt
            </button>
          </div>

          {/* Grid: Timeline + Order Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Milestones Timeline */}
            <div className="lg:col-span-7 bg-white rounded-xl border border-gray-200 p-8 shadow-sm space-y-6">
              <h3 className="font-serif text-lg font-bold text-gray-900 pb-3 border-b border-gray-100">DETAILED TRACKING MILESTONES</h3>

              <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                {milestones.map((m, idx) => (
                  <div key={idx} className="relative flex items-start gap-4">
                    <span className={`absolute -left-6 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${m.completed ? 'border-amber-700 bg-amber-700 text-white' : 'border-gray-300'}`}>
                      {m.completed && <Check className="w-2.5 h-2.5" />}
                    </span>
                    <div>
                      <h4 className="font-serif text-sm font-semibold text-gray-900">{m.title}</h4>
                      <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{m.desc}</p>
                      <span className="text-[10px] text-gray-400 mt-1 block font-mono">{m.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Order Summary & Actions */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm space-y-6">
                <h3 className="font-serif text-lg font-bold text-gray-900 pb-3 border-b border-gray-100">ORDER INFORMATION</h3>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Status</span>
                    <span className="bg-sky-100 text-sky-800 font-bold px-2.5 py-0.5 rounded text-[10px] uppercase tracking-wider">{orderData.status}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Payment Status</span>
                    <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px] flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Paid
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600 pt-2 border-t border-gray-100">
                    <span>Product Price</span>
                    <span className="font-semibold text-gray-900">{orderData.price}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Premium Wrapping</span>
                    <span className="text-emerald-700 font-semibold">Complimentary</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Cargo Alteration Insurance</span>
                    <span className="font-semibold text-gray-900">Active</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 flex justify-between items-baseline">
                  <span className="font-serif font-bold text-base">Grand Total</span>
                  <span className="text-2xl font-serif font-bold text-gray-950">{orderData.price}</span>
                </div>
              </div>

              {/* Guarantee Notice */}
              <div className="bg-amber-50/50 p-6 rounded-xl border border-amber-200/80 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-serif font-bold text-amber-900 text-sm">
                  <ShieldCheck className="w-4 h-4 text-amber-700" /> WEFTIN Guarantee Policy
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Custom designs and premium standard sarees include our 10-day complimentary physical fitting correction option. Our tailor will contact you directly to align if required.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button onClick={() => showToast('Order cancellation request submitted')} className="w-full bg-white border border-gray-300 hover:border-rose-600 text-rose-700 py-3 rounded-lg text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 shadow-sm">
                  <XCircle className="w-4 h-4" /> Cancel This Luxury Order
                </button>
                <button onClick={() => showToast('Adding items back to bag for instant reorder')} className="w-full bg-[#1C1816] hover:bg-black text-white py-3.5 rounded-lg text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 shadow-sm">
                  <RefreshCw className="w-4 h-4 text-amber-400" /> Instant Reorder Products
                </button>
              </div>

            </div>

          </div>

        </main>
      </div>

    </div>
  );
}