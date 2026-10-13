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
  Calendar,
  DollarSign,
  BarChart2,
  Globe,
  Settings
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
    },
    expenses: {
      title: 'Expenses Management',
      subtitle: 'Track atelier operating costs, raw material procurement, and overheads.',
      stats: { total: '₹1.2L', pending: '3' },
      headers: ['Expense ID', 'Category', 'Vendor / Payee', 'Amount', 'Date', 'Status'],
      rows: [
        ['EXP-901', 'Raw Material', 'Varanasi Silk Co.', '₹45,000', 'June 12, 2026', 'Paid'],
        ['EXP-902', 'Atelier Utilities', 'Hyderabad Grid', '₹12,500', 'June 10, 2026', 'Pending'],
      ]
    },
    analytics: {
      title: 'Business Analytics & Reports',
      subtitle: 'Deep-dive metrics into high-performing garments and customer acquisition.',
      stats: { total: '24 Reports', pending: '0' },
      headers: ['Report Name', 'Generated On', 'Category', 'Format', 'Size', 'Action'],
      rows: [
        ['Q2 Luxury Sales Summary', 'June 01, 2026', 'Sales', 'PDF / Excel', '2.4 MB', 'Download'],
        ['Atelier Master Utilization', 'May 31, 2026', 'Production', 'PDF', '1.1 MB', 'Download'],
      ]
    },
    shipping: {
      title: 'Shipping & Logistics',
      subtitle: 'Dispatch partners, local courier tracking, and insured transit logs.',
      stats: { total: '48 Shipments', pending: '4' },
      headers: ['Tracking ID', 'Patron', 'Courier Service', 'Destination', 'Status', 'Action'],
      rows: [
        ['TRK-8812', 'Meera Kapoor', 'Bluedart Secure', 'Mumbai, MH', 'In Transit', 'Track'],
        ['TRK-8811', 'Aarav Singhania', 'DHL Express', 'Delhi, DL', 'Dispatched', 'Track'],
      ]
    },
    seo: {
      title: 'SEO & Metadata Management',
      subtitle: 'Manage search engine descriptions, keywords, and OpenGraph sharing tags.',
      stats: { total: '18 Pages', pending: '1' },
      headers: ['Page / Route', 'Meta Title', 'Keywords', 'Index Status', 'Action'],
      rows: [
        ['/collection/royal-heritage', 'Royal Heritage Silk Sarees | WEFTIN', 'silk sarees, zari, bridal', 'Indexed', 'Edit'],
        ['/collection/mughal-garden', 'Mughal Velvet Lehengas | WEFTIN', 'velvet lehenga, bridal wear', 'Indexed', 'Edit'],
      ]
    },
    settings: {
      title: 'Atelier Settings',
      subtitle: 'Configure store preferences, taxes, staff permissions, and currency.',
      stats: { total: '12 Options', pending: '0' },
      headers: ['Configuration Key', 'Scope', 'Current Value', 'Status', 'Action'],
      rows: [
        ['Primary Currency', 'Global', 'INR (₹)', 'Locked', 'Configure'],
        ['GST Tax Slab', 'Invoicing', '12% Luxury Apparels', 'Active', 'Configure'],
        ['Default Atelier Lead', 'Production', 'Master Khaja', 'Active', 'Configure']
      ]
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAF8F5] font-sans text-[#1C1A17] select-none">
      
      {/* LIGHT SIDEBAR (Matches Figma design) */}
      <aside className={`${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-[#FAF8F5] border-r border-[#EFECE6] text-[#1C1A17] flex flex-col justify-between transition-all duration-300 z-30 flex-shrink-0`}>
        <div>
          {/* Logo Header */}
          <div className="h-20 flex items-center justify-between px-6 border-b border-[#EFECE6]">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveNav('dashboard')}>
              <div className="w-9 h-9 rounded-full bg-[#1C1A17] flex items-center justify-center font-bold text-white text-lg tracking-widest shadow-md font-serif">W</div>
              {!isSidebarCollapsed && <span className="font-serif tracking-widest text-xl font-bold text-[#1C1A17]">WEFT IN</span>}
            </div>
            <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="text-[#78716C] hover:text-[#1C1A17] transition">
              <ChevronLeft className={`w-4 h-4 transition-transform ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="px-4 py-6 space-y-6 overflow-y-auto max-h-[calc(100vh-280px)]">
            <div>
              <div 
                onClick={() => setActiveNav('dashboard')}
                className={`flex items-center px-4 py-3 rounded-xl cursor-pointer transition ${activeNav === 'dashboard' ? 'bg-[#1C1A17] text-white font-semibold shadow-sm' : 'text-[#78716C] hover:bg-[#F3EFEA] hover:text-[#1C1A17]'}`}
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
                      className={`flex items-center justify-between px-4 py-2.5 rounded-xl cursor-pointer transition ${isActive ? 'bg-[#1C1A17] text-white font-semibold shadow-sm' : 'text-[#78716C] hover:bg-[#F3EFEA] hover:text-[#1C1A17]'}`}
                    >
                      <div className="flex items-center">
                        <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                        {!isSidebarCollapsed && <span className="text-sm">{item.label}</span>}
                      </div>
                      {!isSidebarCollapsed && item.badge && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-[#B89768] text-black' : 'bg-amber-100 text-amber-800'}`}>{item.badge}</span>
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
                      className={`flex items-center px-4 py-2.5 rounded-xl cursor-pointer transition ${isActive ? 'bg-[#1C1A17] text-white font-semibold shadow-sm' : 'text-[#78716C] hover:bg-[#F3EFEA] hover:text-[#1C1A17]'}`}
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
                      className={`flex items-center px-4 py-2.5 rounded-xl cursor-pointer transition ${isActive ? 'bg-[#1C1A17] text-white font-semibold shadow-sm' : 'text-[#78716C] hover:bg-[#F3EFEA] hover:text-[#1C1A17]'}`}
                    >
                      <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                      {!isSidebarCollapsed && <span className="text-sm">{item.label}</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Finance Group */}
            <div>
              {!isSidebarCollapsed && <p className="px-4 text-[11px] font-semibold tracking-wider text-[#B89768] uppercase mb-2">Finance</p>}
              <div className="space-y-1">
                {[
                  { id: 'expenses', label: 'Expenses', icon: DollarSign },
                  { id: 'analytics', label: 'Analytics', icon: BarChart2 }
                ].map(item => {
                  const Icon = item.icon;
                  const isActive = activeNav === item.id;
                  return (
                    <div 
                      key={item.id}
                      onClick={() => setActiveNav(item.id)}
                      className={`flex items-center px-4 py-2.5 rounded-xl cursor-pointer transition ${isActive ? 'bg-[#1C1A17] text-white font-semibold shadow-sm' : 'text-[#78716C] hover:bg-[#F3EFEA] hover:text-[#1C1A17]'}`}
                    >
                      <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                      {!isSidebarCollapsed && <span className="text-sm">{item.label}</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Config Group */}
            <div>
              {!isSidebarCollapsed && <p className="px-4 text-[11px] font-semibold tracking-wider text-[#B89768] uppercase mb-2">Config</p>}
              <div className="space-y-1">
                {[
                  { id: 'shipping', label: 'Shipping', icon: Truck },
                  { id: 'seo', label: 'SEO', icon: Globe },
                  { id: 'settings', label: 'Settings', icon: Settings }
                ].map(item => {
                  const Icon = item.icon;
                  const isActive = activeNav === item.id;
                  return (
                    <div 
                      key={item.id}
                      onClick={() => setActiveNav(item.id)}
                      className={`flex items-center px-4 py-2.5 rounded-xl cursor-pointer transition ${isActive ? 'bg-[#1C1A17] text-white font-semibold shadow-sm' : 'text-[#78716C] hover:bg-[#F3EFEA] hover:text-[#1C1A17]'}`}
                    >
                      <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                      {!isSidebarCollapsed && <span className="text-sm">{item.label}</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Atelier Hub Card Widget */}
            {!isSidebarCollapsed && (
              <div className="mx-2 bg-white rounded-2xl border border-[#EFECE6] p-4 shadow-sm space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-md bg-[#B89768]/20 flex items-center justify-center text-[#B89768] font-bold text-xs">O</div>
                  <div>
                    <p className="text-[10px] font-bold text-[#B89768] tracking-wider uppercase">ATELIER HUB</p>
                    <h5 className="font-serif font-bold text-xs text-[#1C1A17]">Command Center V2</h5>
                  </div>
                </div>
                <div className="space-y-1.5 pt-1 text-[11px] border-t border-[#EFECE6]">
                  <div className="flex justify-between items-center">
                    <span className="text-[#78716C]">🚨 TODAY URGENT Orders</span>
                    <span className="font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">3 Pending</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#78716C]">📈 REVENUE Performance</span>
                    <span className="font-bold text-emerald-600">₹1.84L Today</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#78716C]">✂️ CUSTOM Tailor Work</span>
                    <span className="font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">5 Pending</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#78716C]">📦 LOW Stock items</span>
                    <span className="font-bold text-orange-600">2 products</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* View Storefront Footer */}
        <div className="p-4 border-t border-[#EFECE6] space-y-3 bg-[#F3EFEA]">
          <button 
            onClick={() => setStorefrontOpen(true)}
            className="w-full bg-white hover:bg-[#1C1A17] text-[#1C1A17] hover:text-white text-xs font-semibold py-2.5 px-3 rounded-xl border border-[#EFECE6] transition flex items-center justify-center space-x-2 shadow-sm"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            {!isSidebarCollapsed && <span>VIEW STOREFRONT</span>}
          </button>
          {!isSidebarCollapsed && (
            <div className="text-center">
              <p className="text-[9px] text-[#78716C] tracking-widest font-mono">WEFT IN ATELIER SUITE</p>
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
