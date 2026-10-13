import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  Tag, 
  Bell, 
  Scissors, 
  Shirt, 
  Layers, 
  Sliders, 
  Truck, 
  UsersRound, 
  Boxes, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  Search, 
  Plus, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ShoppingCart, 
  Filter, 
  Download, 
  X, 
  Calendar
} from 'lucide-react';

export default function Admin_Dashboard_Page() {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [salesPeriod, setSalesPeriod] = useState('weekly');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [modalState, setModalState] = useState({ isOpen: false, type: '', data: null });
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [storefrontOpen, setStorefrontOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const modulesData = {
    orders: {
      title: 'Orders Management',
      subtitle: 'Active client purchase orders and atelier processing queue.',
      stats: { total: '3,284', pending: '9' },
      headers: ['Order ID', 'Customer', 'Items', 'Total Amount', 'Status', 'Action'],
      rows: [
        ['C0-2026-1842', 'Aarav S.', 'Royal Banarasi Silk', '₹48,500', 'Action Needed', 'Review'],
        ['C0-2026-1841', 'Meera K.', 'Mughal Velvet Lehenga', '₹1,24,000', 'Verification', 'Verify'],
        ['C0-2026-1839', 'Rohan M.', 'Kashmir Tilla Sherwani', '₹89,000', 'Fabric Pending', 'Details'],
        ['C0-2026-1837', 'Diya M.', 'Handloom Chanderi Suit', '₹28,500', 'Tailor Assign', 'Assign'],
      ]
    },
    customers: {
      title: 'Customers Directory',
      subtitle: 'Registered bespoke patrons, VIP clients, and measurement profiles.',
      stats: { total: '1,420', pending: '12' },
      headers: ['Customer Name', 'Contact', 'Tier', 'Total Orders', 'Lifetime Value', 'Action'],
      rows: [
        ['Meera Kapoor', '+91 98234 XXXXX', 'VIP Bespoke', '14', '₹8,40,000', 'View Profile'],
        ['Aarav Singhania', '+91 97112 XXXXX', 'Atelier Club', '8', '₹4,20,000', 'View Profile'],
        ['Diya Malhotra', '+91 99001 XXXXX', 'Standard', '3', '₹95,000', 'View Profile'],
      ]
    },
    'discount-codes': {
      title: 'Discount & Voucher Codes',
      subtitle: 'Manage promotional vouchers and exclusive seasonal access codes.',
      stats: { total: '8', pending: '2' },
      headers: ['Voucher Code', 'Type', 'Value', 'Valid Until', 'Usage Limit', 'Status'],
      rows: [
        ['ROYAL26', 'Percentage', '20% Off', 'June 30, 2026', '142 / 200', 'Active'],
        ['ATELIERVIP', 'Flat Rate', '₹5,000 Off', 'July 15, 2026', '45 / 50', 'Active'],
        ['MONSOON26', 'Percentage', '15% Off', 'August 31, 2026', '12 / 100', 'Scheduled'],
      ]
    },
    'stock-interest': {
      title: 'Stock Interest Requests',
      subtitle: 'Clients waiting for out-of-stock luxury fabrics and limited editions.',
      stats: { total: '64', pending: '5' },
      headers: ['Item Code', 'Fabric / Product', 'Interested Patrons', 'Restock ETA', 'Priority', 'Action'],
      rows: [
        ['SILK-IV-02', 'Premium Silk – Ivory Mist', '18 Patrons', '3 Days', 'High', 'Notify Patrons'],
        ['LIN-BK-01', 'Linen – Midnight Black', '14 Patrons', '5 Days', 'High', 'Notify Patrons'],
      ]
    },
    'custom-orders': {
      title: 'Custom Orders & Atelier Pipeline',
      subtitle: 'Track bespoke garments through request, quotation, tailoring, and dispatch.',
      stats: { total: '106', pending: '38' },
      headers: ['Request ID', 'Patron', 'Design Specification', 'Stage', 'Tailor Assigned', 'Action'],
      rows: [
        ['C-9012', 'Kavya Reddy', 'Custom Silk Lehenga', 'Production', 'Master Khaja', 'Manage'],
        ['C-9011', 'Nisha Sharma', 'Evening Gown', 'Quality Check', 'Artisan Ravi', 'Manage'],
        ['C-9010', 'Zoya Akhtar', 'Bridal Dupatta', 'Tailor Assigned', 'Master Salim', 'Manage'],
      ]
    },
    products: {
      title: 'Catalogue Products',
      subtitle: 'Manage all luxury ready-to-wear and bespoke product items.',
      stats: { total: '104', pending: '0' },
      headers: ['Product Code', 'Title', 'Collection', 'Price', 'Stock Status', 'Action'],
      rows: [
        ['PRD-8821', 'Royal Heritage Silk Saree', 'Royal Heritage \'26', '₹45,000', 'In Stock', 'Edit'],
        ['PRD-8822', 'Mughal Velvet Lehenga', 'Mughal Garden \'26', '₹1,15,000', 'In Stock', 'Edit'],
        ['PRD-8823', 'Kashmir Crewel Tilla Kurti', 'Kashmir Meadows \'26', '₹22,000', 'Low Stock', 'Edit'],
      ]
    },
    categories: {
      title: 'Catalogue Categories',
      subtitle: 'Organize collections, seasonal lookbooks, and product classifications.',
      stats: { total: '12', pending: '0' },
      headers: ['Category Name', 'Collection Group', 'Active Items', 'Atelier Speed', 'Status', 'Action'],
      rows: [
        ['Bridal Wear', 'Royal Heritage \'26', '32 Products', '18-24 Days', 'Active', 'Configure'],
        ['Silk Sarees', 'Royal Heritage \'26', '42 Products', '14-18 Days', 'Active', 'Configure'],
        ['Velvet Lehengas', 'Mughal Garden \'26', '34 Products', '24-30 Days', 'Active', 'Configure'],
      ]
    },
    customizations: {
      title: 'Bespoke Customizations',
      subtitle: 'Define measurement parameters, monogramming styles, and fabric add-ons.',
      stats: { total: '24', pending: '3' },
      headers: ['Customization Item', 'Type', 'Options Count', 'Additional Fee', 'Status', 'Action'],
      rows: [
        ['Gold Zari Monogram', 'Embroidery', '12 Fonts', '₹1,500', 'Active', 'Edit'],
        ['Custom Blouse Fitting', 'Measurement', 'Standard / Bespoke', 'Included', 'Active', 'Edit'],
      ]
    },
    vendors: {
      title: 'Atelier Vendors & Suppliers',
      subtitle: 'Fabric mills, handloom weavers, and raw material partners.',
      stats: { total: '18', pending: '2' },
      headers: ['Vendor Name', 'Specialty', 'Lead Time', 'Quality Rating', 'Status', 'Action'],
      rows: [
        ['Varanasi Silk Weavers Co.', 'Pure Zari & Brocade', '14 Days', '4.9 / 5.0', 'Verified', 'Contact'],
        ['Kashmir Crewel Guild', 'Tilla Embroidery', '21 Days', '4.8 / 5.0', 'Verified', 'Contact'],
      ]
    },
    tailors: {
      title: 'Master Tailors & Artisans',
      subtitle: 'In-house and contracted master craftsmen assigned to bespoke orders.',
      stats: { total: '26', pending: '4' },
      headers: ['Tailor Name', 'Specialization', 'Active Workload', 'Rating', 'Status', 'Action'],
      rows: [
        ['Master Khaja', 'Bridal Lehengas & Sherwanis', '4 Orders', '5.0 / 5.0', 'Available', 'Assign'],
        ['Master Salim', 'Silk Sarees & Blouses', '6 Orders', '4.9 / 5.0', 'Busy', 'Assign'],
        ['Artisan Ravi', 'Crewel & Tilla Stitching', '3 Orders', '4.8 / 5.0', 'Available', 'Assign'],
      ]
    },
    inventory: {
      title: 'Atelier Inventory & Stock',
      subtitle: 'Live stock tracking for silks, velvets, threads, and packaging.',
      stats: { total: '342 items', pending: '5 low' },
      headers: ['Item Code', 'Material Name', 'Current Stock', 'Reorder Level', 'Supplier', 'Action'],
      rows: [
        ['SILK-IV-02', 'Premium Silk – Ivory Mist', '2.5m', '10m', 'Varanasi Silk Co.', 'Reorder'],
        ['LIN-BK-01', 'Linen – Midnight Black', '1.2m', '8m', 'Kashmir Guild', 'Reorder'],
        ['WOL-NV-03', 'Wool – Navy Blue', '3.0m', '12m', 'Bikaner Weavers', 'Reorder'],
        ['CASH-BX-01', 'Cashmere – Bordeaux', '1.8m', '6m', 'Himalayan Mills', 'Reorder'],
      ]
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAF8F5] font-sans text-[#1C1A17] select-none">
      
      {/* SIDEBAR */}
      <aside className={`${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-[#141311] text-white flex flex-col justify-between transition-all duration-300 z-30 flex-shrink-0`}>
        <div>
          <div className="h-20 flex items-center justify-between px-6 border-b border-white/10">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveNav('dashboard')}>
              <div className="w-9 h-9 rounded-full bg-[#B89768] flex items-center justify-center font-bold text-black text-lg tracking-widest shadow-md font-serif">W</div>
              {!isSidebarCollapsed && <span className="font-serif tracking-widest text-xl font-bold">WEFT IN</span>}
            </div>
            <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="text-white/60 hover:text-white transition">
              <ChevronLeft className={`w-4 h-4 transition-transform ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className="px-4 py-6 space-y-6 overflow-y-auto max-h-[calc(100vh-160px)]">
            <div>
              <div 
                onClick={() => setActiveNav('dashboard')}
                className={`flex items-center px-4 py-3 rounded-xl cursor-pointer transition ${activeNav === 'dashboard' ? 'bg-[#B89768] text-black font-semibold shadow-sm' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}
              >
                <LayoutDashboard className="w-5 h-5 mr-3 flex-shrink-0" />
                {!isSidebarCollapsed && <span className="text-sm">Dashboard</span>}
              </div>
            </div>

            {/* Sales Group */}
            <div>
              {!isSidebarCollapsed && <p className="px-4 text-[11px] font-semibold tracking-wider text-[#B89768] uppercase mb-2">Sales</p>}
              <div className="space-y-1">
                {[
                  { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: '9' },
                  { id: 'customers', label: 'Customers', icon: Users },
                  { id: 'discount-codes', label: 'Discount Codes', icon: Tag },
                  { id: 'stock-interest', label: 'Stock Interest', icon: Bell },
                  { id: 'custom-orders', label: 'Custom Orders', icon: Scissors, badge: '5' }
                ].map(item => {
                  const Icon = item.icon;
                  const isActive = activeNav === item.id;
                  return (
                    <div 
                      key={item.id}
                      onClick={() => setActiveNav(item.id)}
                      className={`flex items-center justify-between px-4 py-2.5 rounded-xl cursor-pointer transition ${isActive ? 'bg-[#B89768] text-black font-semibold shadow-sm' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}
                    >
                      <div className="flex items-center">
                        <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                        {!isSidebarCollapsed && <span className="text-sm">{item.label}</span>}
                      </div>
                      {!isSidebarCollapsed && item.badge && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-black text-white' : 'bg-[#B89768] text-black'}`}>{item.badge}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Catalogue Group */}
            <div>
              {!isSidebarCollapsed && <p className="px-4 text-[11px] font-semibold tracking-wider text-[#B89768] uppercase mb-2">Catalogue</p>}
              <div className="space-y-1">
                {[
                  { id: 'products', label: 'Products', icon: Shirt },
                  { id: 'categories', label: 'Categories', icon: Layers },
                  { id: 'customizations', label: 'Customizations', icon: Sliders }
                ].map(item => {
                  const Icon = item.icon;
                  const isActive = activeNav === item.id;
                  return (
                    <div 
                      key={item.id}
                      onClick={() => setActiveNav(item.id)}
                      className={`flex items-center px-4 py-2.5 rounded-xl cursor-pointer transition ${isActive ? 'bg-[#B89768] text-black font-semibold shadow-sm' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}
                    >
                      <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                      {!isSidebarCollapsed && <span className="text-sm">{item.label}</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Production Group */}
            <div>
              {!isSidebarCollapsed && <p className="px-4 text-[11px] font-semibold tracking-wider text-[#B89768] uppercase mb-2">Production</p>}
              <div className="space-y-1">
                {[
                  { id: 'vendors', label: 'Vendors', icon: Truck },
                  { id: 'tailors', label: 'Tailors', icon: UsersRound },
                  { id: 'inventory', label: 'Inventory', icon: Boxes }
                ].map(item => {
                  const Icon = item.icon;
                  const isActive = activeNav === item.id;
                  return (
                    <div 
                      key={item.id}
                      onClick={() => setActiveNav(item.id)}
                      className={`flex items-center px-4 py-2.5 rounded-xl cursor-pointer transition ${isActive ? 'bg-[#B89768] text-black font-semibold shadow-sm' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}
                    >
                      <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                      {!isSidebarCollapsed && <span className="text-sm">{item.label}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-white/10 space-y-3 bg-[#0E0D0C]">
          <button 
            onClick={() => setStorefrontOpen(true)}
            className="w-full bg-[#1C1A17] hover:bg-white/10 text-[#B89768] text-xs font-semibold py-2.5 px-3 rounded-xl border border-[#B89768]/30 transition flex items-center justify-center space-x-2"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            {!isSidebarCollapsed && <span>VIEW STOREFRONT</span>}
          </button>
          {!isSidebarCollapsed && (
            <div className="text-center">
              <p className="text-[9px] text-white/40 tracking-widest font-mono">WEFT IN ATELIER SUITE</p>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* TOP HEADER */}
        <header className="h-20 bg-white border-b border-[#EFECE6] flex items-center justify-between px-8 flex-shrink-0 z-20">
          <div className="flex items-center space-x-4">
            <h1 className="font-serif text-lg font-bold text-[#1C1A17] tracking-wide">WEFTIN Atelier Workspace</h1>
            <span className="text-[#EFECE6]">|</span>
            <div className="flex items-center space-x-2 text-sm text-[#78716C] bg-[#FAF8F5] px-3 py-1.5 rounded-lg border border-[#EFECE6]">
              <Calendar className="w-4 h-4 text-[#B89768]" />
              <span className="font-medium text-[#1C1A17]">June 15, 2026 (Mon)</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button 
              onClick={() => showToast('Bespoke Control Console session active.')}
              className="bg-[#FAF8F5] hover:bg-[#F3EFEA] text-[#1C1A17] text-xs font-semibold px-4 py-2 rounded-full border border-[#EFECE6] transition shadow-sm"
            >
              Bespoke Control Console
            </button>

            <button 
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="relative w-10 h-10 rounded-full bg-[#FAF8F5] hover:bg-[#F3EFEA] flex items-center justify-center border border-[#EFECE6] text-[#1C1A17] transition"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full"></span>
            </button>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center space-x-3 bg-[#FAF8F5] hover:bg-[#F3EFEA] pl-2 pr-4 py-1.5 rounded-full border border-[#EFECE6] transition"
              >
                <div className="w-8 h-8 rounded-full bg-[#B89768] text-black font-bold flex items-center justify-center text-xs shadow-sm">KH</div>
                <span className="text-sm font-semibold text-[#1C1A17]">Khaja H.</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#78716C]" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-[#EFECE6] py-2 z-50">
                  <a href="#profile" onClick={(e) => { e.preventDefault(); showToast('Profile settings'); setUserDropdownOpen(false); }} className="block px-4 py-2 text-sm text-[#1C1A17] hover:bg-[#FAF8F5]">Profile Settings</a>
                  <a href="#workspace" onClick={(e) => { e.preventDefault(); showToast('Workspace settings'); setUserDropdownOpen(false); }} className="block px-4 py-2 text-sm text-[#1C1A17] hover:bg-[#FAF8F5]">Switch Workspace</a>
                  <div className="border-t border-[#EFECE6] my-1"></div>
                  <a href="#logout" onClick={(e) => { e.preventDefault(); showToast('Session secured'); setUserDropdownOpen(false); }} className="block px-4 py-2 text-sm text-red-600 font-medium hover:bg-red-50">Secure Logout</a>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* NOTIFICATION DRAWER */}
        {notificationOpen && (
          <div className="absolute top-24 right-8 w-80 bg-white rounded-2xl shadow-2xl border border-[#EFECE6] p-5 z-50 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#EFECE6]">
              <h4 className="font-serif font-bold text-sm text-[#1C1A17]">Atelier Notifications</h4>
              <button onClick={() => setNotificationOpen(false)} className="text-gray-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="py-3 space-y-3">
              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EFECE6]">
                <p className="text-xs font-semibold text-[#1C1A17]">Urgent artisan allocation needed</p>
                <p className="text-[11px] text-[#78716C] mt-0.5">5 custom orders lack tailor assignment.</p>
              </div>
              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EFECE6]">
                <p className="text-xs font-semibold text-[#1C1A17]">Low stock alert: Ivory Mist Silk</p>
                <p className="text-[11px] text-[#78716C] mt-0.5">Stock below 2.5m reorder limit.</p>
              </div>
            </div>
            <button onClick={() => setNotificationOpen(false)} className="w-full bg-[#1C1A17] text-white py-2 rounded-xl text-xs font-bold">CLOSE</button>
          </div>
        )}

        {/* WORKSPACE CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">

          {activeNav === 'dashboard' ? (
            /* ================= DASHBOARD VIEW ================= */
            <div className="space-y-8">
              
              {/* Top Header & Search Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-3xl font-bold text-[#1C1A17]">Dashboard</h2>
                  <p className="text-sm text-[#78716C] mt-1">Track sales, operations, and atelier workflow at a glance.</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78716C]" />
                    <input 
                      type="text" 
                      placeholder="Search orders, customers, product..." 
                      className="bg-white border border-[#EFECE6] pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#B89768] w-72 shadow-sm"
                    />
                  </div>
                  <div className="relative">
                    <select className="bg-white border border-[#EFECE6] px-4 py-2.5 rounded-xl text-sm font-medium text-[#1C1A17] focus:outline-none focus:border-[#B89768] shadow-sm appearance-none pr-10">
                      <option>This Month</option>
                      <option>Last Month</option>
                      <option>Year to Date</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#78716C] pointer-events-none" />
                  </div>
                  <button 
                    onClick={() => setAddProductOpen(true)}
                    className="bg-[#1C1A17] hover:bg-black text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md flex items-center space-x-2 transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>ADD PRODUCT</span>
                  </button>
                </div>
              </div>

              {/* Urgent Action Banner */}
              <div className="bg-white rounded-2xl border border-[#EFECE6] p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center flex-shrink-0 text-xl shadow-sm">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#1C1A17]">12 orders need action today</h3>
                    <p className="text-sm text-[#78716C] mt-0.5">Urgent custom stitches lack artisan allocation and standard bounds require verification.</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-6 lg:gap-8 border-t lg:border-t-0 lg:border-l border-[#EFECE6] pt-4 lg:pt-0 lg:pl-8">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-serif text-2xl font-bold text-[#1C1A17]">5</span>
                      <span className="text-xs font-semibold text-[#78716C] uppercase">Artisan Allocation Pending</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-serif text-2xl font-bold text-[#1C1A17]">4</span>
                      <span className="text-xs font-semibold text-[#78716C] uppercase">Standard Bounds To Verify</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-serif text-2xl font-bold text-[#1C1A17]">3</span>
                      <span className="text-xs font-semibold text-[#78716C] uppercase">Urgent Deliveries Due Soon</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveNav('orders')}
                    className="bg-[#B89768] hover:bg-[#A38255] text-black px-6 py-3 rounded-xl text-xs font-bold tracking-wider uppercase shadow-sm transition"
                  >
                    REVIEW NOW
                  </button>
                </div>
              </div>

              {/* 4 Metric Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { title: 'REVENUE', val: '₹4.8L', trend: '+18% from last month', target: 'Target ₹5.5L', pct: '87%', icon: TrendingUp },
                  { title: 'ORDERS', val: '3,284', trend: '+12% from last month', target: 'Completed 2,891', pct: '88%', icon: ShoppingBag },
                  { title: 'PENDING ORDERS', val: '3', trend: 'Requires custom handling', status: 'High priority', icon: Clock },
                  { title: 'LOW STOCK', val: '5', trend: 'Needs immediate replenishment', status: 'Out of stock risk', icon: Boxes }
                ].map((card, idx) => {
                  const Icon = card.icon;
                  return (
                    <div key={idx} className="bg-white rounded-2xl border border-[#EFECE6] p-6 shadow-sm flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#78716C]">{card.title}</span>
                        <div className="w-8 h-8 rounded-lg bg-[#FAF8F5] flex items-center justify-center text-[#B89768]">
                          <Icon className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="my-4">
                        <h3 className="font-serif text-3xl font-bold text-[#1C1A17]">{card.val}</h3>
                        <div className={`flex items-center space-x-1.5 text-xs font-semibold mt-1 ${idx < 2 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {idx < 2 ? <TrendingUp className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                          <span>{card.trend}</span>
                        </div>
                      </div>
                      {card.pct ? (
                        <div>
                          <div className="flex justify-between text-xs text-[#78716C] mb-1.5 font-medium">
                            <span>{card.target}</span>
                            <span>{card.pct}</span>
                          </div>
                          <div className="w-full bg-[#FAF8F5] rounded-full h-2 overflow-hidden border border-[#EFECE6]/50">
                            <div className="bg-[#B89768] h-full rounded-full" style={{ width: card.pct }}></div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between pt-2 border-t border-[#EFECE6] text-xs">
                          <span className="text-[#78716C]">Status</span>
                          <span className="font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-md">{card.status}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Seasonal Atelier Lookbook & Active Workloads */}
              <div className="bg-white rounded-2xl border border-[#EFECE6] p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] flex items-center justify-center text-[#B89768] text-lg">
                      <Shirt className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif text-xl font-bold text-[#1C1A17]">Seasonal Atelier Lookbook & Active Workloads</h3>
                      <p className="text-xs text-[#78716C]">High-fashion visual identity catalogs showing active artisan allocations.</p>
                    </div>
                  </div>
                  <button onClick={() => showToast('Opening catalog manager...')} className="text-xs font-bold text-[#B89768] hover:text-[#A38255] transition flex items-center space-x-1">
                    <span>MANAGE CATALOG IMAGES</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { tag: 'BEST SELLER', title: 'Royal Heritage \'26 Collection', desc: 'Varanasi brocade silk sarees featuring hand-woven gold zari borders and crimson floral motifs.', slots: '42 Products', speed: '18-24 Days', img: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop' },
                    { tag: 'LIMITED EDITION', title: 'Mughal Garden \'26 Collection', desc: 'Opulent velvet lehengas adorned with birds & blossom patterns and handloom panel lining.', slots: '34 Products', speed: '24-30 Days', img: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800&auto=format&fit=crop' },
                    { tag: 'NEW ARRIVAL', title: 'Kashmir Meadows \'26 Collection', desc: 'Pure silks and premium linens detailed in exquisite Kashmir Tilla lock-stitch crewel embroidery.', slots: '28 Products', speed: '10-14 Days', img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop' }
                  ].map((look, i) => (
                    <div key={i} className="rounded-2xl border border-[#EFECE6] overflow-hidden bg-[#FAF8F5] flex flex-col shadow-sm group hover:shadow-md transition">
                      <div className="relative h-64 overflow-hidden">
                        <img src={look.img} alt={look.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                        <span className="absolute top-4 left-4 bg-white text-black text-[10px] font-bold px-3 py-1 rounded-md tracking-wider uppercase shadow-sm">{look.tag}</span>
                        <div className="absolute bottom-4 left-4 right-4 text-white">
                          <h4 className="font-serif text-xl font-bold">{look.title}</h4>
                        </div>
                      </div>
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <p className="text-xs text-[#78716C] leading-relaxed">{look.desc}</p>
                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#EFECE6]">
                          <div className="bg-white p-2.5 rounded-xl border border-[#EFECE6] text-center">
                            <p className="text-[10px] font-bold text-[#78716C] uppercase">Active Slots</p>
                            <p className="text-sm font-bold text-[#1C1A17] mt-0.5">{look.slots}</p>
                          </div>
                          <div className="bg-white p-2.5 rounded-xl border border-[#EFECE6] text-center">
                            <p className="text-[10px] font-bold text-[#78716C] uppercase">Atelier Speed</p>
                            <p className="text-sm font-bold text-[#B89768] mt-0.5">{look.speed}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sales Overview & Custom Order Progress */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Sales Overview */}
                <div className="lg:col-span-8 bg-white rounded-2xl border border-[#EFECE6] p-8 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="font-serif text-xl font-bold text-[#1C1A17]">Sales Overview</h3>
                        <p className="text-xs text-[#78716C] mt-0.5">Revenue and orders performance overview</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="inline-flex bg-[#FAF8F5] p-1 rounded-xl border border-[#EFECE6]">
                          <button onClick={() => setSalesPeriod('weekly')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${salesPeriod === 'weekly' ? 'bg-white text-[#1C1A17] shadow-sm' : 'text-[#78716C]'}`}>WEEKLY</button>
                          <button onClick={() => setSalesPeriod('monthly')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${salesPeriod === 'monthly' ? 'bg-white text-[#1C1A17] shadow-sm' : 'text-[#78716C]'}`}>MONTHLY</button>
                        </div>
                        <div className="relative">
                          <select className="bg-[#FAF8F5] border border-[#EFECE6] px-3 py-1.5 rounded-xl text-xs font-medium text-[#1C1A17] focus:outline-none focus:border-[#B89768] appearance-none pr-8">
                            <option>All Channels</option>
                            <option>Bespoke Online</option>
                            <option>Atelier Boutique</option>
                          </select>
                          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#78716C] pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#FAF8F5] rounded-2xl p-6 border border-[#EFECE6] relative">
                      <div className="flex justify-between text-[11px] text-[#78716C] font-bold mb-4">
                        <span>REVENUE (₹)</span>
                        <span>ORDERS (Qty)</span>
                      </div>
                      <div className="h-48 w-full relative flex items-end">
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-2">
                          <div className="border-b border-dashed border-[#1C1A17] w-full"></div>
                          <div className="border-b border-dashed border-[#1C1A17] w-full"></div>
                          <div className="border-b border-dashed border-[#1C1A17] w-full"></div>
                        </div>
                        <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 600 160">
                          <path d="M 30 130 L 130 90 L 230 115 L 330 75 L 430 95 L 530 40" fill="none" stroke="#B89768" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M 30 140 L 130 105 L 230 125 L 330 90 L 430 105 L 530 55" fill="none" stroke="#1C1A17" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round"/>
                          <circle cx="30" cy="130" r="5" fill="#B89768" stroke="#fff" strokeWidth="2"/>
                          <circle cx="130" cy="90" r="5" fill="#B89768" stroke="#fff" strokeWidth="2"/>
                          <circle cx="230" cy="115" r="5" fill="#B89768" stroke="#fff" strokeWidth="2"/>
                          <circle cx="330" cy="75" r="5" fill="#B89768" stroke="#fff" strokeWidth="2"/>
                          <circle cx="430" cy="95" r="5" fill="#B89768" stroke="#fff" strokeWidth="2"/>
                          <circle cx="530" cy="40" r="6" fill="#B89768" stroke="#fff" strokeWidth="2"/>
                        </svg>
                      </div>
                      <div className="flex justify-between text-xs text-[#78716C] font-medium mt-4 pt-3 border-t border-[#EFECE6]/60">
                        <span>May 10</span><span>May 17</span><span>May 24</span><span>May 31</span><span>Jun 07</span><span>Jun 14</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-6 mt-6 border-t border-[#EFECE6]">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#78716C]">TOTAL REVENUE</p>
                      <div className="flex items-baseline space-x-2 mt-1">
                        <span className="font-serif text-xl font-bold text-[#1C1A17]">₹4,82,310</span>
                        <span className="text-xs text-emerald-600 font-semibold">+18%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#78716C]">TOTAL ORDERS</p>
                      <div className="flex items-baseline space-x-2 mt-1">
                        <span className="font-serif text-xl font-bold text-[#1C1A17]">3,284</span>
                        <span className="text-xs text-emerald-600 font-semibold">+12%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#78716C]">AVG ORDER VALUE</p>
                      <div className="flex items-baseline space-x-2 mt-1">
                        <span className="font-serif text-xl font-bold text-[#1C1A17]">₹1,468</span>
                        <span className="text-xs text-emerald-600 font-semibold">+6%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Custom Order Progress */}
                <div className="lg:col-span-4 bg-white rounded-2xl border border-[#EFECE6] p-8 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-serif text-xl font-bold text-[#1C1A17]">Custom Order Progress</h3>
                      <button onClick={() => setActiveNav('custom-orders')} className="text-xs font-bold text-[#B89768] hover:text-[#A38255] transition flex items-center">VIEW ALL <ChevronRight className="w-3 h-3 ml-0.5" /></button>
                    </div>
                    <p className="text-xs text-[#78716C] mb-6">Track live atelier orders from request to dispatch.</p>

                    <div className="flex items-center space-x-2 mb-6">
                      <span className="bg-[#FAF8F5] border border-[#EFECE6] text-[#1C1A17] text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center space-x-1.5">
                        <Scissors className="w-3.5 h-3.5 text-[#B89768]" />
                        <span>Active Custom Orders: <strong>106</strong></span>
                      </span>
                      <span className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Delayed: <strong>4</strong></span>
                      </span>
                    </div>

                    <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-[#EFECE6] mb-6">
                      <div className="flex items-center space-x-2 text-emerald-700 text-xs font-semibold mb-3">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Ready for Dispatch: <strong>7 orders</strong></span>
                      </div>

                      <div className="grid grid-cols-6 gap-2 text-center pt-2">
                        {[
                          { step: '01', title: 'Requests Received', val: '38', pct: '100%' },
                          { step: '02', title: 'Quotation', val: '26', pct: '68%' },
                          { step: '03', title: 'Tailor Assigned', val: '19', pct: '50%' },
                          { step: '04', title: 'Production', val: '12', pct: '32%' },
                          { step: '05', title: 'Quality Check', val: '7', pct: '19%' },
                          { step: '06', title: 'Dispatch', val: '4', pct: '11%' }
                        ].map((s, idx) => (
                          <div key={idx}>
                            <div className={`w-8 h-8 rounded-full bg-white border ${idx === 0 ? 'border-[#B89768] text-[#B89768]' : 'border-[#EFECE6] text-[#1C1A17]'} flex items-center justify-center mx-auto text-xs font-bold shadow-sm`}>{s.step}</div>
                            <span className="text-[9px] font-bold text-[#78716C] block mt-1.5 leading-tight">{s.title}</span>
                            <span className="text-xs font-bold text-[#1C1A17] block mt-1">{s.val}</span>
                            <span className="text-[9px] text-[#78716C] block">{s.pct}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0" />
                      <span className="text-xs font-medium text-[#1C1A17]">4 custom orders are delayed and need review.</span>
                    </div>
                    <button onClick={() => setActiveNav('custom-orders')} className="bg-white hover:bg-amber-100 text-[#1C1A17] text-xs font-bold px-3 py-2 rounded-lg border border-amber-300 transition shadow-sm whitespace-nowrap">
                      VIEW PRODUCTION BOARD
                    </button>
                  </div>
                </div>

              </div>

              {/* Orders Requiring Attention & Low Stock Alerts */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Orders Requiring Attention */}
                <div className="lg:col-span-7 bg-white rounded-2xl border border-[#EFECE6] p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-serif text-xl font-bold text-[#1C1A17]">Orders Requiring Attention</h3>
                      <p className="text-xs text-[#78716C] mt-0.5">High priority orders that need immediate action</p>
                    </div>
                    <button onClick={() => setActiveNav('orders')} className="text-xs font-bold text-[#B89768] hover:text-[#A38255] transition flex items-center">View All <ChevronRight className="w-3 h-3 ml-0.5" /></button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#EFECE6] text-[11px] font-bold text-[#78716C] uppercase tracking-wider">
                          <th className="py-3 px-2">Order ID</th>
                          <th className="py-3 px-2">Customer</th>
                          <th className="py-3 px-2">Issue</th>
                          <th className="py-3 px-2">Status</th>
                          <th className="py-3 px-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EFECE6] text-sm">
                        {[
                          { id: 'C0-2026-1842', cust: 'Aarav S.', issue: 'Artisan allocation pending', status: 'HIGH', badge: 'bg-red-50 text-red-700 border-red-200', btn: 'REVIEW' },
                          { id: 'C0-2026-1841', cust: 'Meera K.', issue: 'Bounds verification', status: 'HIGH', badge: 'bg-red-50 text-red-700 border-red-200', btn: 'VERIFY' },
                          { id: 'C0-2026-1839', cust: 'Rohan M.', issue: 'Fabric approval pending', status: 'MEDIUM', badge: 'bg-amber-50 text-amber-800 border-amber-200', btn: 'FOLLOW UP' },
                          { id: 'C0-2026-1837', cust: 'Diya M.', issue: 'Tailor assign pending', status: 'MEDIUM', badge: 'bg-amber-50 text-amber-800 border-amber-200', btn: 'ASSIGN' },
                          { id: 'C0-2026-1835', cust: 'Kunal B.', issue: 'Delivery confirm', status: 'LOW', badge: 'bg-emerald-50 text-emerald-800 border-emerald-200', btn: 'CONFIRM' }
                        ].map((row, idx) => (
                          <tr key={idx} className="hover:bg-[#FAF8F5]/60 transition">
                            <td className="py-3.5 px-2 font-mono font-bold text-xs text-[#1C1A17]">{row.id}</td>
                            <td className="py-3.5 px-2 font-semibold text-[#1C1A17]">{row.cust}</td>
                            <td className="py-3.5 px-2 text-xs text-[#78716C]">{row.issue}</td>
                            <td className="py-3.5 px-2"><span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${row.badge}`}>{row.status}</span></td>
                            <td className="py-3.5 px-2 text-right">
                              <button onClick={() => setModalState({ isOpen: true, type: 'action', data: row })} className="bg-black hover:bg-[#B89768] text-white hover:text-black text-xs font-bold px-3 py-1.5 rounded-lg transition shadow-sm">{row.btn}</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Low Stock Alerts */}
                <div className="lg:col-span-5 bg-white rounded-2xl border border-[#EFECE6] p-8 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="font-serif text-xl font-bold text-[#1C1A17]">Low Stock Alerts</h3>
                        <p className="text-xs text-[#78716C] mt-0.5">Items below recommended stock level</p>
                      </div>
                      <button onClick={() => setActiveNav('inventory')} className="text-xs font-bold text-[#B89768] hover:text-[#A38255] transition flex items-center">View All <ChevronRight className="w-3 h-3 ml-0.5" /></button>
                    </div>

                    <div className="space-y-3">
                      {[
                        { title: 'Premium Silk – Ivory Mist', code: 'SILK-IV-02', stock: '2.5m', reorder: '10m', color: 'bg-[#FAF0E6]', textCol: 'text-red-600' },
                        { title: 'Linen – Midnight Black', code: 'LIN-BK-01', stock: '1.2m', reorder: '8m', color: 'bg-[#24221F]', textCol: 'text-red-600' },
                        { title: 'Wool – Navy Blue', code: 'WOL-NV-03', stock: '3.0m', reorder: '12m', color: 'bg-[#1B263B]', textCol: 'text-amber-600' },
                        { title: 'Cashmere – Bordeaux', code: 'CASH-BX-01', stock: '1.8m', reorder: '6m', color: 'bg-[#4A1525]', textCol: 'text-red-600' }
                      ].map((item, idx) => (
                        <div key={idx} className="bg-[#FAF8F5] rounded-xl p-3.5 border border-[#EFECE6] flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-lg ${item.color} border border-[#EFECE6] flex items-center justify-center flex-shrink-0 text-white font-bold text-xs`}>
                              {item.code.slice(0,2)}
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-[#1C1A17]">{item.title}</h4>
                              <p className="text-[10px] text-[#78716C] font-mono">{item.code}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="text-[9px] font-bold text-[#78716C] uppercase">STOCK</p>
                              <p className={`text-xs font-bold ${item.textCol}`}>{item.stock}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[9px] font-bold text-[#78716C] uppercase">REORDER</p>
                              <p className="text-xs font-bold text-[#1C1A17]">{item.reorder}</p>
                            </div>
                            <button onClick={() => showToast(`Reorder placed for ${item.title}`)} className="w-8 h-8 rounded-lg bg-white border border-[#EFECE6] flex items-center justify-center hover:bg-[#B89768] hover:text-white transition shadow-sm">
                              <ShoppingCart className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* Recent Customer Enquiries */}
              <div className="bg-white rounded-2xl border border-[#EFECE6] p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-[#1C1A17]">Recent Customer Enquiries</h3>
                    <p className="text-xs text-[#78716C] mt-0.5">Latest customer requests that may need follow-up or review.</p>
                  </div>
                  <button onClick={() => setActiveNav('customers')} className="text-xs font-bold text-[#B89768] hover:text-[#A38255] transition flex items-center">View All Enquiries <ChevronRight className="w-3 h-3 ml-0.5" /></button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#EFECE6] text-[11px] font-bold text-[#78716C] uppercase tracking-wider">
                        <th className="py-3 px-3">Customer Name</th>
                        <th className="py-3 px-3">Request Type</th>
                        <th className="py-3 px-3">Preferred Category</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFECE6] text-sm">
                      {[
                        { name: 'Meera Kapoor', req: 'Custom Lehenga', cat: 'Bridal Wear', status: 'Quotation Pending', badge: 'bg-amber-50 text-amber-800 border-amber-200', btn: 'REVIEW' },
                        { name: 'Aarav Singhania', req: 'Saree Enquiry', cat: 'Silk Saree', status: 'Follow-up Needed', badge: 'bg-red-50 text-red-700 border-red-200', btn: 'CALL' },
                        { name: 'Diya Malhotra', req: 'Measurement Update', cat: 'Custom Kurti', status: 'Pending', badge: 'bg-blue-50 text-blue-700 border-blue-200', btn: 'UPDATE' },
                        { name: 'Kavya Reddy', req: 'Fabric Selection', cat: 'Festival Collection', status: 'Awaiting Response', badge: 'bg-purple-50 text-purple-700 border-purple-200', btn: 'FOLLOW UP' },
                        { name: 'Nisha Sharma', req: 'Custom Gown', cat: 'Evening Wear', status: 'Design Review', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', btn: 'VIEW' }
                      ].map((row, idx) => (
                        <tr key={idx} className="hover:bg-[#FAF8F5]/60 transition">
                          <td className="py-4 px-3 font-semibold text-[#1C1A17]">{row.name}</td>
                          <td className="py-4 px-3 text-[#78716C]">{row.req}</td>
                          <td className="py-4 px-3 text-[#1C1A17] font-medium">{row.cat}</td>
                          <td className="py-4 px-3"><span className={`text-xs font-bold px-3 py-1 rounded-md border ${row.badge}`}>{row.status}</span></td>
                          <td className="py-4 px-3 text-right">
                            <button onClick={() => setModalState({ isOpen: true, type: 'enquiry', data: row })} className="bg-[#FAF8F5] hover:bg-black hover:text-white text-[#1C1A17] text-xs font-bold px-4 py-2 rounded-xl border border-[#EFECE6] transition shadow-sm">{row.btn}</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          ) : (
            /* ================= DYNAMIC MODULE VIEW ================= */
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-3xl font-bold text-[#1C1A17]">{modulesData[activeNav]?.title}</h2>
                  <p className="text-sm text-[#78716C] mt-1">{modulesData[activeNav]?.subtitle}</p>
                </div>
                <button onClick={() => setAddProductOpen(true)} className="bg-[#1C1A17] hover:bg-black text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md flex items-center space-x-2 transition">
                  <Plus className="w-4 h-4" />
                  <span>ADD NEW RECORD</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl border border-[#EFECE6] p-6 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#78716C]">TOTAL RECORDS</p>
                  <h3 className="font-serif text-3xl font-bold text-[#1C1A17] mt-2">{modulesData[activeNav]?.stats.total}</h3>
                  <p className="text-xs text-emerald-600 font-semibold mt-1"><TrendingUp className="w-3.5 h-3.5 inline mr-1" /> Active synchronization</p>
                </div>
                <div className="bg-white rounded-2xl border border-[#EFECE6] p-6 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#78716C]">PENDING ACTIONS</p>
                  <h3 className="font-serif text-3xl font-bold text-[#1C1A17] mt-2">{modulesData[activeNav]?.stats.pending}</h3>
                  <p className="text-xs text-amber-700 font-semibold mt-1"><Clock className="w-3.5 h-3.5 inline mr-1" /> Requires review</p>
                </div>
                <div className="bg-white rounded-2xl border border-[#EFECE6] p-6 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#78716C]">COMPLIANCE / HEALTH</p>
                  <h3 className="font-serif text-3xl font-bold text-[#1C1A17] mt-2">99.4%</h3>
                  <p className="text-xs text-emerald-600 font-semibold mt-1"><CheckCircle2 className="w-3.5 h-3.5 inline mr-1" /> Atelier standards met</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#EFECE6] p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="relative w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78716C]" />
                    <input type="text" placeholder="Search records..." className="bg-[#FAF8F5] border border-[#EFECE6] pl-10 pr-4 py-2 rounded-xl text-sm focus:outline-none focus:border-[#B89768] w-full" />
                  </div>
                  <div className="flex items-center space-x-3">
                    <button onClick={() => showToast('Filters applied')} className="bg-[#FAF8F5] border border-[#EFECE6] text-[#1C1A17] px-4 py-2 rounded-xl text-xs font-semibold hover:bg-[#F3EFEA] transition flex items-center">
                      <Filter className="w-3.5 h-3.5 mr-1.5 text-[#B89768]" /> Filter
                    </button>
                    <button onClick={() => showToast('Exporting report')} className="bg-[#FAF8F5] border border-[#EFECE6] text-[#1C1A17] px-4 py-2 rounded-xl text-xs font-semibold hover:bg-[#F3EFEA] transition flex items-center">
                      <Download className="w-3.5 h-3.5 mr-1.5 text-[#B89768]" /> Export
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#EFECE6] text-[11px] font-bold text-[#78716C] uppercase tracking-wider">
                        {modulesData[activeNav]?.headers.map((h, i) => (
                          <th key={i} className="py-3 px-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFECE6] text-sm">
                      {modulesData[activeNav]?.rows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-[#FAF8F5]/60 transition">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="py-4 px-3 text-[#1C1A17]">
                              {cIdx === row.length - 1 ? (
                                <button onClick={() => showToast(`Executing action: ${cell}`)} className="bg-black hover:bg-[#B89768] text-white hover:text-black text-xs px-3 py-1.5 rounded-lg font-bold transition">
                                  {cell}
                                </button>
                              ) : cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ================= MODALS ================= */}

      {/* Action / Review Modal */}
      {modalState.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 border border-[#EFECE6] shadow-2xl space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF8F5] flex items-center justify-center text-[#B89768] text-xl border border-[#EFECE6]">
                <Scissors className="w-6 h-6" />
              </div>
              <button onClick={() => setModalState({ isOpen: false, type: '', data: null })} className="w-8 h-8 rounded-full bg-[#FAF8F5] hover:bg-[#F3EFEA] text-[#78716C] flex items-center justify-center transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h3 className="font-serif text-2xl font-bold text-[#1C1A17]">Review Request</h3>
              <p className="text-sm text-[#78716C] mt-1">Secure processing under WEFTIN Atelier protocols.</p>
            </div>
            <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-[#EFECE6] space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-[#78716C]">Assigned Lead:</span>
                <span className="font-bold text-[#1C1A17]">Master Artisan Khaja</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#78716C]">Security Clearance:</span>
                <span className="font-bold text-emerald-600">Level 4 Verified</span>
              </div>
              <div className="pt-2 border-t border-[#EFECE6]">
                <label className="block text-[11px] font-bold text-[#78716C] uppercase mb-1">Atelier Audit Log Notes</label>
                <textarea rows="2" className="w-full bg-white border border-[#EFECE6] rounded-xl p-3 text-xs focus:outline-none focus:border-[#B89768]" placeholder="Type instructions..."></textarea>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button onClick={() => setModalState({ isOpen: false, type: '', data: null })} className="flex-1 bg-[#FAF8F5] hover:bg-[#F3EFEA] text-[#1C1A17] py-3 rounded-xl text-xs font-bold transition border border-[#EFECE6]">CANCEL</button>
              <button onClick={() => { setModalState({ isOpen: false, type: '', data: null }); showToast('Action logged and secured.'); }} className="flex-1 bg-[#1C1A17] hover:bg-black text-white py-3 rounded-xl text-xs font-bold transition shadow-md">CONFIRM ACTION</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {addProductOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 border border-[#EFECE6] shadow-2xl space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-2xl font-bold text-[#1C1A17]">Add New Atelier Product</h3>
              <button onClick={() => setAddProductOpen(false)} className="w-8 h-8 rounded-full bg-[#FAF8F5] hover:bg-[#F3EFEA] text-[#78716C] flex items-center justify-center transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#78716C] uppercase mb-1">Product Title</label>
                <input type="text" placeholder="e.g. Royal Banarasi Silk Saree" className="w-full bg-[#FAF8F5] border border-[#EFECE6] rounded-xl p-3 text-sm focus:outline-none focus:border-[#B89768]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#78716C] uppercase mb-1">Category</label>
                  <select className="w-full bg-[#FAF8F5] border border-[#EFECE6] rounded-xl p-3 text-sm focus:outline-none focus:border-[#B89768]">
                    <option>Bridal Wear</option>
                    <option>Silk Saree</option>
                    <option>Festival Collection</option>
                    <option>Evening Wear</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#78716C] uppercase mb-1">Atelier Speed</label>
                  <input type="text" placeholder="e.g. 14-21 Days" className="w-full bg-[#FAF8F5] border border-[#EFECE6] rounded-xl p-3 text-sm focus:outline-none focus:border-[#B89768]" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#78716C] uppercase mb-1">Description</label>
                <textarea rows="3" placeholder="Handwoven zari details..." className="w-full bg-[#FAF8F5] border border-[#EFECE6] rounded-xl p-3 text-sm focus:outline-none focus:border-[#B89768]"></textarea>
              </div>
            </div>
            <div className="flex items-center space-x-3 pt-2">
              <button onClick={() => setAddProductOpen(false)} className="flex-1 bg-[#FAF8F5] hover:bg-[#F3EFEA] text-[#1C1A17] py-3 rounded-xl text-xs font-bold transition border border-[#EFECE6]">CANCEL</button>
              <button onClick={() => { setAddProductOpen(false); showToast('Product successfully added to catalogue!'); }} className="flex-1 bg-[#1C1A17] hover:bg-black text-white py-3 rounded-xl text-xs font-bold transition shadow-md">SAVE PRODUCT</button>
            </div>
          </div>
        </div>
      )}

      {/* Storefront Modal */}
      {storefrontOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 border border-[#EFECE6] shadow-2xl space-y-6 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 rounded-full bg-[#B89768] text-black flex items-center justify-center text-2xl mx-auto font-serif font-bold shadow-md">W</div>
            <div>
              <h3 className="font-serif text-2xl font-bold text-[#1C1A17]">WEFTIN Atelier Storefront Preview</h3>
              <p className="text-sm text-[#78716C] mt-1">You are currently viewing the secured admin control console. Storefront client portal is locked under private access.</p>
            </div>
            <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-[#EFECE6] text-left space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#78716C]">Domain:</span>
                <span className="font-mono font-bold text-[#1C1A17]">atelier.weftin.com</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#78716C]">Status:</span>
                <span className="text-emerald-600 font-bold">Live Luxury Catalog</span>
              </div>
            </div>
            <button onClick={() => setStorefrontOpen(false)} className="w-full bg-[#1C1A17] hover:bg-black text-white py-3 rounded-xl text-xs font-bold transition shadow-md">RETURN TO ADMIN DASHBOARD</button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-[#141311] text-white px-6 py-4 rounded-2xl shadow-2xl border border-white/10 z-50 flex items-center space-x-3 animate-in slide-in-from-bottom duration-300">
          <div className="w-8 h-8 rounded-full bg-[#B89768] text-black flex items-center justify-center font-bold text-sm">
            <CheckCircle2 className="w-4 h-4 text-black" />
          </div>
          <div>
            <p className="text-xs font-bold tracking-wider text-[#B89768] uppercase">WEFTIN SECURED CONSOLE</p>
            <p className="text-sm font-medium text-white/90">{toastMessage}</p>
          </div>
        </div>
      )}

    </div>
  );
}
