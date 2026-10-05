import React, { useState } from "react";
import { Link } from "react-router-dom";
import { LayoutDashboard, Package, Scissors, Ruler, Heart, MapPin, User, Bell, Headphones, LogOut, Mail, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";

export default function Support_Page() {
  const [subject, setSubject] = useState('Size alteration support request');
  const [concerns, setConcerns] = useState('');
  const [openFaq, setOpenFaq] = useState(0);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleFileTicket = (e) => {
    e.preventDefault();
    if (!concerns.trim()) {
      showToast('Please elaborate your concerns.');
      return;
    }
    showToast('Ticket filed successfully! Master lookup initiated.');
    setConcerns('');
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

          <nav className="p-4 space-y-1 text-xs font-medium text-gray-600">
            <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700">
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </Link>
            <Link to="/orders" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700">
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
            <Link to="/support" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-100/60 text-amber-900 font-semibold border-l-4 border-amber-700">
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
            Portfolio <span className="mx-2">&gt;</span> <span className="text-gray-900 font-semibold uppercase tracking-wider">SUPPORT</span>
          </div>
          <div className="flex items-center gap-4">
            <Bell className="w-5 h-5 text-gray-600 cursor-pointer" />
            <div className="flex items-center gap-2 border-l pl-4 border-gray-200">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100" alt="Meera Kapoor" className="w-8 h-8 rounded-full object-cover border" />
              <span className="text-xs font-semibold text-gray-800">Meera Kapoor</span>
            </div>
          </div>
        </header>

        <main className="p-8 lg:p-12 max-w-7xl w-full space-y-8">
          <div className="mb-2">
            <div className="flex items-center gap-2 text-amber-700 mb-1">
              <Headphones className="w-5 h-5" />
              <h2 className="text-3xl font-serif text-gray-900">Secured Designer Assistance Desk</h2>
            </div>
            <p className="text-xs text-gray-500">Contact senior atelier designers directly via secured phone lines or structured support tickets.</p>
          </div>

          {/* Mailing Support Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <span className="bg-rose-100 text-rose-800 text-[9px] uppercase font-bold px-2.5 py-0.5 rounded tracking-wider">
              MAILING SUPPORT
            </span>
            <h3 className="font-serif text-lg font-medium text-gray-900 mt-2 mb-1">Escalate Fits Concern</h3>
            <p className="text-xs text-gray-500 mb-4">Mail master invoices or customized references files directly to our luxury headquarters at Nariman Point.</p>
            <button onClick={() => showToast('Opening mail client to concierge@weftin.com')} className="border border-gray-300 hover:border-black text-gray-800 px-5 py-2.5 rounded text-xs uppercase tracking-wider font-semibold bg-white flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-amber-700" /> Email Helpdesk
            </button>
          </div>

          {/* Grid Layout: Create Ticket + FAQs */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Create Tailoring Ticket */}
            <div className="lg:col-span-7 bg-white rounded-xl border border-gray-200 p-8 shadow-sm space-y-6">
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
                  <span>Ticket invokes dedicated Senior Master lookup within 2 working hours. Backed by WEFTIN Luxury Guarantee.</span>
                </div>

                <button type="submit" className="w-full bg-[#1C1816] hover:bg-black text-white py-4 rounded-lg text-xs uppercase tracking-[0.2em] font-semibold shadow-lg">
                  File Secure Ticket
                </button>
              </form>
            </div>

            {/* Right: Frequently Asked Inquiries */}
            <div className="lg:col-span-5 bg-white rounded-xl border border-gray-200 p-8 shadow-sm space-y-6">
              <h3 className="font-serif text-xl font-bold text-gray-900 pb-3 border-b border-gray-100 flex items-center gap-2">
                <span>❓</span> Frequently Asked Inquiries
              </h3>

              <div className="space-y-4 text-xs">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="border-b border-gray-100 pb-4">
                    <button 
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)} 
                      className="flex justify-between items-center w-full font-serif font-semibold text-sm text-gray-900 text-left py-1"
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
        </main>
      </div>
    </div>
  );
}