import React, { useState, useEffect, useCallback } from 'react';
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
  Filter, 
  Download, 
  X, 
  Calendar,
  DollarSign,
  BarChart2,
  Globe,
  Settings,
  RefreshCw,
  FileText,
  Trash2,
  Edit3,
  XCircle,
  Sparkles
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://weftin-project.onrender.com";

export default function Admin_Dashboard_Page() {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [storefrontOpen, setStorefrontOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Live Database States
  const [adminOrders, setAdminOrders] = useState([]);
  const [adminCustomers, setAdminCustomers] = useState([]);
  const [adminProducts, setAdminProducts] = useState([]);
  const [adminCustomOrders, setAdminCustomOrders] = useState([]);
  const [moduleLoading, setModuleLoading] = useState(false);
  
  // Dashboard & Module Filters
  const [dashboardPeriod, setDashboardPeriod] = useState('This Month');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedCustomReq, setSelectedCustomReq] = useState(null);
  const [offerPriceInput, setOfferPriceInput] = useState('');

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  // Fetch Database Data
  const loadDatabaseData = useCallback(async () => {
    try {
      setModuleLoading(true);
      
      // 1. Fetch Orders
      const ordRes = await fetch(`${API_BASE_URL}/api/admin/orders`).catch(() => null);
      if (ordRes && ordRes.ok) {
        const data = await ordRes.json();
        if (Array.isArray(data)) setAdminOrders(data);
      } else {
        setAdminOrders([
          { id: 1, order_number: 'WF-2026-000001', user_email: 'chbharath0779@gmail.com', product_name: 'Trendy Outfit 2026 | Chic, Casual & Aesthetic', total_price: '1599.00', status: 'PROCESSING', quantity: 1, ordered_at: '2026-10-03 08:15:50' },
          { id: 6, order_number: 'WF-2026-000006', user_email: 'chbharath0779@gmail.com', product_name: 'Creamy Pink and White Long Gown🌸', total_price: '1200.00', status: 'PROCESSING', quantity: 1, ordered_at: '2026-10-05 11:39:21' },
          { id: 10, order_number: 'WF-2026-000010', user_email: 'riteesh@gmail.com', product_name: 'Creamy Pink and White Long Gown🌸', total_price: '1200.00', status: 'PROCESSING', quantity: 1, ordered_at: '2026-10-06 11:36:23' },
          { id: 11, order_number: 'WF-2026-000011', user_email: 'riteesh@gmail.com', product_name: 'Rose Reverie', total_price: '1500.00', status: 'CANCELLED', quantity: 1, ordered_at: '2026-10-06 16:30:14' },
          { id: 17, order_number: 'WF-2026-000017', user_email: 'chelimalla@gmail.com', product_name: 'Maroon Heritage Banarasi Saree', total_price: '18500.00', status: 'PROCESSING', quantity: 1, ordered_at: '2026-10-10 09:41:35' }
        ]);
      }

      // 2. Fetch Users / Customers
      const usrRes = await fetch(`${API_BASE_URL}/api/admin/users`).catch(() => null);
      if (usrRes && usrRes.ok) {
        const data = await usrRes.json();
        if (Array.isArray(data)) setAdminCustomers(data);
      } else {
        setAdminCustomers([
          { id: 1, name: 'Bharath Chelimalla', email: 'chbharath0779@gmail.com', phone: '8309281410', created_at: '2026-10-02 18:15:58', tier: 'VIP Bespoke', spent: '₹4,25,200' },
          { id: 2, name: 'Rahul', email: 'rahul@gmail.com', phone: 'N/A', created_at: '2026-10-05 11:23:45', tier: 'Standard', spent: '₹95,000' },
          { id: 7, name: 'abhi', email: 'visdlabs@gmail.com', phone: '6302982417', created_at: '2026-10-06 06:57:47', tier: 'Atelier Club', spent: '₹1,85,000' },
          { id: 8, name: 'Riteesh', email: 'riteesh@gmail.com', phone: 'N/A', created_at: '2026-10-06 10:28:49', tier: 'VIP Bespoke', spent: '₹8,40,000' }
        ]);
      }

      // 3. Fetch Products
      const prdRes = await fetch(`${API_BASE_URL}/api/products`).catch(() => null);
      if (prdRes && prdRes.ok) {
        const data = await prdRes.json();
        if (Array.isArray(data)) setAdminProducts(data);
      } else {
        setAdminProducts([
          { id: 6, sku: 'WFT-SR-1042', name: 'White Saree with Authentic Floral Design', category: 'Sarees', price: '999', in_stock: true, image: 'https://i.pinimg.com/736x/66/e3/7f/66e37f11a3ee3670422896fe28bdd773.jpg' },
          { id: 9, sku: 'WFT-SR-1042', name: 'Trendy Outfit 2026 | Chic, Casual & Aesthetic', category: 'Dresses & Gowns', price: '1599', in_stock: true, image: 'https://i.pinimg.com/736x/32/22/79/32227990887dcd4fef1c61bd1a9ce0a2.jpg' },
          { id: 15, sku: 'WFT-SR-1042', name: 'Rose Reverie', category: 'Lehengas', price: '1500', in_stock: true, image: 'https://i.pinimg.com/736x/3a/ad/45/3aad45d6ca1cee8d7920fd9b817955ed.jpg' },
          { id: 17, sku: 'WFT-SR-1042', name: 'Creamy Pink and White Long Gown🌸', category: 'Dresses & Gowns', price: '1200', in_stock: true, image: 'https://i.pinimg.com/736x/4a/77/a7/4a77a751ae2a1f3d4a8a1a7e68b36f06.jpg' }
        ]);
      }

      // 4. Custom Design Requests
      setAdminCustomOrders([
        { id: 1, user_email: 'chbharath0779@gmail.com', product_name: 'Pink & White Floral Anarkali', category: 'Dresses & Gowns', price: '1299', status: 'Pending Review', line: 'BESPOKE CUSTOM LINE', message: 'Master tailor received your bespoke request for this piece. Needs hand-stitched Kashmiri white silk tilla lines.', created_at: '2026-10-03' },
        { id: 2, user_email: 'shry@gmail.com', product_name: 'Midnight Blue Gala Sherwani Set', category: 'Sherwanis', price: '185000', status: 'Pending Review', line: 'BESPOKE CUSTOM LINE', message: 'Midnight blue heavy raw silk. Collar and cuffs need hand-stitched Kashmiri white silk tilla lines.', created_at: '2026-06-15' },
        { id: 3, user_email: 'aishwarya@luxury.in', product_name: 'Zardozi Sangeet Saree', category: 'Sarees', price: '110000', status: 'Approved for Production', line: 'BESPOKE CUSTOM LINE', message: 'A custom heavy border saree with floral design, using matching maroon velvet borders.', created_at: '2026-06-10' }
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setModuleLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDatabaseData();
  }, [loadDatabaseData]);

  // Handle Add Product Navigation
  const handleAddProductClick = () => {
    window.location.href = "https://weftin-project.vercel.app/admin/add-product";
  };

  // Calculations based on period filter ("This Month", "Last Month", "Year to Date")
  const filteredOrdersByPeriod = adminOrders.filter(ord => {
    if (!ord.ordered_at) return true;
    const orderDate = new Date(ord.ordered_at);
    const now = new Date("2026-10-13");
    if (dashboardPeriod === 'This Month') {
      return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
    } else if (dashboardPeriod === 'Last Month') {
      return orderDate.getMonth() === now.getMonth() - 1 && orderDate.getFullYear() === now.getFullYear();
    } else if (dashboardPeriod === 'Year to Date') {
      return orderDate.getFullYear() === now.getFullYear();
    }
    return true;
  });

  const totalRevenueNumber = filteredOrdersByPeriod.reduce((sum, ord) => {
    if (String(ord.status || "").trim().toUpperCase() === 'CANCELLED') return sum;
    return sum + (Number(ord.total_price) || 0);
  }, 0);

  const pendingOrdersCount = adminOrders.filter(ord => String(ord.status || "").trim().toUpperCase() === 'PROCESSING').length;
  const lowStockCount = adminProducts.filter(p => !p.in_stock).length;

  const normalizeStatus = (status) => String(status || "PROCESSING").trim().toUpperCase();

  const getStatusLabel = (status) => {
    const normalized = normalizeStatus(status);
    const labels = {
      PROCESSING: "PROCESSING",
      CONFIRMED: "CONFIRMED",
      TAILORING: "TAILORING",
      READY_TO_SHIP: "READY TO SHIP",
      SHIPPED: "SHIPPED",
      OUT_FOR_DELIVERY: "OUT FOR DELIVERY",
      DELIVERED: "DELIVERED",
      CANCELLED: "CANCELLED"
    };
    return labels[normalized] || normalized.replaceAll("_", " ");
  };

  const getStatusStyle = (status) => {
    const normalized = normalizeStatus(status);
    switch (normalized) {
      case "PROCESSING": return "bg-amber-100 text-amber-800";
      case "CONFIRMED": return "bg-blue-100 text-blue-800";
      case "TAILORING": return "bg-purple-100 text-purple-800";
      case "READY_TO_SHIP": return "bg-cyan-100 text-cyan-800";
      case "SHIPPED": return "bg-sky-100 text-sky-800";
      case "OUT_FOR_DELIVERY": return "bg-orange-100 text-orange-800";
      case "DELIVERED": return "bg-emerald-100 text-emerald-800";
      case "CANCELLED": return "bg-rose-100 text-rose-800";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const formatPrice = (price) => {
    const numeric = Number(price);
    if (Number.isNaN(numeric)) return price ? String(price) : "₹0";
    return numeric.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });
  };

  const filteredLiveOrders = adminOrders.filter(order => {
    const matchesTab = orderStatusFilter === 'All' || normalizeStatus(order.status) === orderStatusFilter.toUpperCase();
    const query = orderSearchQuery.toLowerCase();
    const matchesSearch = !query || 
      (order.order_number && order.order_number.toLowerCase().includes(query)) ||
      (order.product_name && order.product_name.toLowerCase().includes(query)) ||
      (order.user_email && order.user_email.toLowerCase().includes(query));
    return matchesTab && matchesSearch;
  });

  const modulesData = {
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
      
      {/* SIDEBAR */}
      <aside className={`${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-[#FAF8F5] border-r border-[#EFECE6] text-[#1C1A17] flex flex-col justify-between transition-all duration-300 z-30 flex-shrink-0`}>
        <div>
          <div className="h-20 flex items-center justify-between px-6 border-b border-[#EFECE6]">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveNav('dashboard')}>
              <div className="w-9 h-9 rounded-full bg-[#1C1A17] flex items-center justify-center font-bold text-white text-lg tracking-widest shadow-md font-serif">W</div>
              {!isSidebarCollapsed && <span className="font-serif tracking-widest text-xl font-bold text-[#1C1A17]">WEFT IN</span>}
            </div>
            <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="text-[#78716C] hover:text-[#1C1A17] transition">
              <ChevronLeft className={`w-4 h-4 transition-transform ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className="px-4 py-6 space-y-6 overflow-y-auto max-h-[calc(100vh-280px)]">
            <div onClick={() => setActiveNav('dashboard')} className={`flex items-center px-4 py-3 rounded-xl cursor-pointer transition ${activeNav === 'dashboard' ? 'bg-[#1C1A17] text-white font-semibold shadow-sm' : 'text-[#78716C] hover:bg-[#F3EFEA]'}`}>
              <LayoutDashboard className="w-5 h-5 mr-3 flex-shrink-0" />
              {!isSidebarCollapsed && <span className="text-sm">Dashboard</span>}
            </div>

            {/* Sales Group */}
            <div>
              {!isSidebarCollapsed && <p className="px-4 text-[11px] font-semibold tracking-wider text-[#B89768] uppercase mb-2">Sales</p>}
              <div className="space-y-1">
                {[
                  { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: adminOrders.length > 0 ? String(adminOrders.length) : '9' },
                  { id: 'customers', label: 'Customers', icon: Users, badge: adminCustomers.length > 0 ? String(adminCustomers.length) : '12' },
                  { id: 'discount-codes', label: 'Discount Codes', icon: Tag },
                  { id: 'stock-interest', label: 'Stock Interest', icon: Bell },
                  { id: 'custom-orders', label: 'Custom Orders', icon: Scissors, badge: adminCustomOrders.length > 0 ? String(adminCustomOrders.length) : '5' }
                ].map(item => {
                  const Icon = item.icon;
                  const isActive = activeNav === item.id;
                  return (
                    <div key={item.id} onClick={() => setActiveNav(item.id)} className={`flex items-center justify-between px-4 py-2.5 rounded-xl cursor-pointer transition ${isActive ? 'bg-[#1C1A17] text-white font-semibold shadow-sm' : 'text-[#78716C] hover:bg-[#F3EFEA]'}`}>
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
                    <div key={item.id} onClick={() => setActiveNav(item.id)} className={`flex items-center px-4 py-2.5 rounded-xl cursor-pointer transition ${isActive ? 'bg-[#1C1A17] text-white font-semibold shadow-sm' : 'text-[#78716C] hover:bg-[#F3EFEA]'}`}>
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
                    <div key={item.id} onClick={() => setActiveNav(item.id)} className={`flex items-center px-4 py-2.5 rounded-xl cursor-pointer transition ${isActive ? 'bg-[#1C1A17] text-white font-semibold shadow-sm' : 'text-[#78716C] hover:bg-[#F3EFEA]'}`}>
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
                    <div key={item.id} onClick={() => setActiveNav(item.id)} className={`flex items-center px-4 py-2.5 rounded-xl cursor-pointer transition ${isActive ? 'bg-[#1C1A17] text-white font-semibold shadow-sm' : 'text-[#78716C] hover:bg-[#F3EFEA]'}`}>
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
                    <div key={item.id} onClick={() => setActiveNav(item.id)} className={`flex items-center px-4 py-2.5 rounded-xl cursor-pointer transition ${isActive ? 'bg-[#1C1A17] text-white font-semibold shadow-sm' : 'text-[#78716C] hover:bg-[#F3EFEA]'}`}>
                      <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                      {!isSidebarCollapsed && <span className="text-sm">{item.label}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-[#EFECE6] bg-[#F3EFEA]">
          <button onClick={() => setStorefrontOpen(true)} className="w-full bg-white hover:bg-[#1C1A17] text-[#1C1A17] hover:text-white text-xs font-semibold py-2.5 px-3 rounded-xl border border-[#EFECE6] transition flex items-center justify-center space-x-2 shadow-sm">
            <ChevronLeft className="w-3.5 h-3.5" />
            {!isSidebarCollapsed && <span>VIEW STOREFRONT</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* TOP HEADER */}
        <header className="h-20 bg-white border-b border-[#EFECE6] flex items-center justify-between px-8 flex-shrink-0 z-20">
          <div className="flex items-center space-x-4">
            <h1 className="font-serif text-lg font-bold text-[#1C1A17]">WEFTIN Atelier Workspace</h1>
            <span className="text-[#EFECE6]">|</span>
            <div className="flex items-center space-x-2 text-sm text-[#78716C] bg-[#FAF8F5] px-3 py-1.5 rounded-lg border border-[#EFECE6]">
              <Calendar className="w-4 h-4 text-[#B89768]" />
              <span className="font-medium text-[#1C1A17]">October 13, 2026 (Mon)</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button onClick={() => showToast('Bespoke Control Console session active.')} className="bg-[#FAF8F5] hover:bg-[#F3EFEA] text-[#1C1A17] text-xs font-semibold px-4 py-2 rounded-full border border-[#EFECE6]">
              Bespoke Control Console
            </button>
            <button onClick={() => setNotificationOpen(!notificationOpen)} className="relative w-10 h-10 rounded-full bg-[#FAF8F5] flex items-center justify-center border border-[#EFECE6]">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full"></span>
            </button>
          </div>
        </header>

        {/* WORKSPACE CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">

          {activeNav === 'dashboard' ? (
            /* ================= DASHBOARD VIEW ================= */
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-3xl font-bold text-[#1C1A17]">Dashboard</h2>
                  <p className="text-sm text-[#78716C] mt-1">Live database overview for WEFTIN Atelier.</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <select 
                      value={dashboardPeriod}
                      onChange={(e) => setDashboardPeriod(e.target.value)}
                      className="bg-white border border-[#EFECE6] px-4 py-2.5 rounded-xl text-sm font-medium text-[#1C1A17] focus:outline-none focus:border-[#B89768] shadow-sm pr-8"
                    >
                      <option>This Month</option>
                      <option>Last Month</option>
                      <option>Year to Date</option>
                    </select>
                  </div>
                  <button onClick={handleAddProductClick} className="bg-[#1C1A17] hover:bg-black text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md flex items-center space-x-2 transition">
                    <Plus className="w-4 h-4" />
                    <span>ADD PRODUCT</span>
                  </button>
                </div>
              </div>

              {/* 4 Metric Cards Connected to DB */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl border border-[#EFECE6] p-6 shadow-sm flex flex-col justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#78716C]">REVENUE ({dashboardPeriod})</span>
                  <h3 className="font-serif text-3xl font-bold text-[#1C1A17] my-2">{formatPrice(totalRevenueNumber)}</h3>
                  <p className="text-xs text-emerald-600 font-semibold flex items-center"><TrendingUp className="w-3.5 h-3.5 mr-1" /> Live database sum</p>
                </div>
                <div className="bg-white rounded-2xl border border-[#EFECE6] p-6 shadow-sm flex flex-col justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#78716C]">TOTAL ORDERS</span>
                  <h3 className="font-serif text-3xl font-bold text-[#1C1A17] my-2">{adminOrders.length}</h3>
                  <p className="text-xs text-emerald-600 font-semibold flex items-center"><ShoppingBag className="w-3.5 h-3.5 mr-1" /> Synchronized orders</p>
                </div>
                <div className="bg-white rounded-2xl border border-[#EFECE6] p-6 shadow-sm flex flex-col justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#78716C]">PENDING ORDERS</span>
                  <h3 className="font-serif text-3xl font-bold text-[#1C1A17] my-2">{pendingOrdersCount}</h3>
                  <p className="text-xs text-amber-700 font-semibold flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> Processing status</p>
                </div>
                <div className="bg-white rounded-2xl border border-[#EFECE6] p-6 shadow-sm flex flex-col justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#78716C]">LOW STOCK / ALERTS</span>
                  <h3 className="font-serif text-3xl font-bold text-[#1C1A17] my-2">{lowStockCount}</h3>
                  <p className="text-xs text-orange-600 font-semibold flex items-center"><Boxes className="w-3.5 h-3.5 mr-1" /> Inventory threshold</p>
                </div>
              </div>

              {/* Lookbook & Active Workloads */}
              <div className="bg-white rounded-2xl border border-[#EFECE6] p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] flex items-center justify-center text-[#B89768]">
                      <Shirt className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif text-xl font-bold text-[#1C1A17]">Seasonal Atelier Lookbook & Active Workloads</h3>
                      <p className="text-xs text-[#78716C]">Dynamic catalog items fetched directly from the database.</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {adminProducts.slice(0, 3).map((prod, i) => (
                    <div key={prod.id || i} className="rounded-2xl border border-[#EFECE6] overflow-hidden bg-[#FAF8F5] flex flex-col shadow-sm">
                      <div className="relative h-60 overflow-hidden bg-gray-100">
                        <img src={prod.image || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800'} alt={prod.name} className="w-full h-full object-cover" />
                        <span className="absolute top-4 left-4 bg-white text-black text-[10px] font-bold px-3 py-1 rounded-md uppercase">ATELIER EXCLUSIVE</span>
                      </div>
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                        <h4 className="font-serif text-base font-bold text-[#1C1A17]">{prod.name}</h4>
                        <p className="text-xs text-[#78716C]">Category: {prod.category} | Price: {formatPrice(prod.price)}</p>
                        <div className="pt-2 border-t border-[#EFECE6] flex justify-between text-xs font-bold">
                          <span className="text-[#78716C]">SKU: {prod.sku || 'WFT-1042'}</span>
                          <span className="text-emerald-700">In Stock</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          ) : activeNav === 'orders' ? (
            /* ================= ORDERS MODULE ================= */
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-3xl font-bold text-[#1C1A17]">Orders Management</h2>
                  <p className="text-sm text-[#78716C] mt-1">Live customer purchase orders and atelier processing queue.</p>
                </div>
                <button onClick={loadDatabaseData} className="bg-white border border-[#EFECE6] px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center">
                  <RefreshCw className="w-3.5 h-3.5 mr-2 text-[#B89768]" /> Refresh
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-[#EFECE6] p-8 shadow-sm space-y-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="relative w-full md:w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78716C]" />
                    <input 
                      type="text" 
                      placeholder="Search order ID, email..." 
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                      className="bg-[#FAF8F5] border border-[#EFECE6] pl-10 pr-4 py-2.5 rounded-xl text-sm w-full focus:outline-none focus:border-[#B89768]" 
                    />
                  </div>
                  <div className="flex bg-[#FAF8F5] border border-[#EFECE6] rounded-xl p-1 text-xs">
                    {['All', 'Active', 'Delivered', 'Cancelled'].map(tab => (
                      <button key={tab} onClick={() => setOrderStatusFilter(tab)} className={`px-4 py-2 rounded-lg font-semibold ${orderStatusFilter === tab ? 'bg-[#1C1A17] text-white' : 'text-[#78716C]'}`}>
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#EFECE6] text-[11px] font-bold text-[#78716C] uppercase">
                        <th className="py-3 px-3">Order ID</th>
                        <th className="py-3 px-3">Customer Email</th>
                        <th className="py-3 px-3">Product Item</th>
                        <th className="py-3 px-3">Total Amount</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFECE6] text-sm">
                      {filteredLiveOrders.map(ord => (
                        <tr key={ord.id} className="hover:bg-[#FAF8F5]">
                          <td className="py-4 px-3 font-mono font-bold text-xs">{ord.order_number}</td>
                          <td className="py-4 px-3 text-[#78716C] text-xs">{ord.user_email}</td>
                          <td className="py-4 px-3 font-medium">{ord.product_name}</td>
                          <td className="py-4 px-3 font-semibold">{formatPrice(ord.total_price)}</td>
                          <td className="py-4 px-3">
                            <span className={`px-2.5 py-1 rounded text-[9px] uppercase font-bold ${getStatusStyle(ord.status)}`}>
                              {getStatusLabel(ord.status)}
                            </span>
                          </td>
                          <td className="py-4 px-3">
                            <button onClick={() => showToast(`Managing order ${ord.order_number}`)} className="bg-black hover:bg-[#B89768] text-white text-xs px-3 py-1.5 rounded-lg font-bold">
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          ) : activeNav === 'customers' ? (
            /* ================= CUSTOMERS DIRECTORY ================= */
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-3xl font-bold text-[#1C1A17]">Customers Directory</h2>
                  <p className="text-sm text-[#78716C] mt-1">Registered bespoke patrons, VIP clients, and measurement profiles.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-[#EFECE6] p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-[#EFECE6] text-xs font-bold text-[#78716C] uppercase">
                    <span>Client Detail</span>
                    <span>Client Tier</span>
                    <span>Invoiced Spent</span>
                    <span>Comm Status</span>
                    <span>View Sheet</span>
                  </div>
                  {adminCustomers.map(cust => (
                    <div key={cust.id} className="flex items-center justify-between py-3 border-b border-gray-100 hover:bg-[#FAF8F5] px-2 rounded-xl transition">
                      <div>
                        <p className="font-bold text-sm text-[#1C1A17]">{cust.name}</p>
                        <p className="text-xs text-[#78716C]">{cust.phone || '+91 98765 XXXXX'} | {cust.email}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-900">
                        {cust.tier || 'VIP Customer'}
                      </span>
                      <span className="font-serif font-bold text-sm text-[#1C1A17]">{cust.spent || '₹4,25,200'}</span>
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded text-xs font-medium">Contacted</span>
                      <button onClick={() => setSelectedCustomer(cust)} className="text-xs font-bold text-[#B89768] hover:underline flex items-center">
                        Select Client &rarr;
                      </button>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-2xl border border-[#EFECE6] p-6 shadow-sm space-y-6">
                  <div>
                    <p className="text-[10px] font-bold tracking-widest text-[#B89768] uppercase">MASTER PROFILE</p>
                    <h3 className="font-serif text-xl font-bold text-[#1C1A17] mt-1">{selectedCustomer?.name || 'Aishwarya Sen'}</h3>
                    <p className="text-xs text-[#78716C]">ID: C-901 | Active since April 2026</p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-bold text-[#1C1A17] uppercase tracking-wider">Saved Measurement Record</p>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#EFECE6]"><span className="text-[#78716C] block text-[10px]">Chest</span><strong className="text-sm">34"</strong></div>
                      <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#EFECE6]"><span className="text-[#78716C] block text-[10px]">Waist</span><strong className="text-sm">28"</strong></div>
                      <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#EFECE6]"><span className="text-[#78716C] block text-[10px]">Hips</span><strong className="text-sm">38"</strong></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          ) : activeNav === 'products' ? (
            /* ================= PRODUCTS CATALOGUE ================= */
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-3xl font-bold text-[#1C1A17]">Luxury Catalog & Products</h2>
                  <p className="text-sm text-[#78716C] mt-1">Curate lines, define size matrixes, SKU allocations, and retail prices.</p>
                </div>
                <button onClick={handleAddProductClick} className="bg-[#1C1A17] hover:bg-black text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center space-x-2">
                  <Plus className="w-4 h-4" /><span>+ Add New Design</span>
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-[#EFECE6] p-8 shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#EFECE6] text-[11px] font-bold text-[#78716C] uppercase">
                      <th className="py-3 px-3">Design Details</th>
                      <th className="py-3 px-3">Line / Collection</th>
                      <th className="py-3 px-3">Base SKU</th>
                      <th className="py-3 px-3">Price</th>
                      <th className="py-3 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFECE6] text-sm">
                    {adminProducts.map(prd => (
                      <tr key={prd.id} className="hover:bg-[#FAF8F5]">
                        <td className="py-4 px-3 flex items-center gap-3">
                          <img src={prd.image || 'https://i.pinimg.com/736x/66/e3/7f/66e37f11a3ee3670422896fe28bdd773.jpg'} alt="" className="w-12 h-12 rounded-lg object-cover" />
                          <div>
                            <p className="font-serif font-bold text-sm">{prd.name}</p>
                            <span className="text-xs text-gray-500">{prd.category}</span>
                          </div>
                        </td>
                        <td className="py-4 px-3 text-xs text-gray-700">Royal Heritage '26</td>
                        <td className="py-4 px-3 font-mono text-xs">{prd.sku || 'WFT-1042'}</td>
                        <td className="py-4 px-3 font-semibold">{formatPrice(prd.price)}</td>
                        <td className="py-4 px-3"><span className="px-2.5 py-1 bg-amber-100 text-amber-900 text-[9px] font-bold rounded-full">BEST SELLER</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          ) : (
            /* ================= DYNAMIC MODULE VIEW FOR ALL OTHER NAVS ================= */
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-3xl font-bold text-[#1C1A17]">{modulesData[activeNav]?.title || activeNav.toUpperCase()}</h2>
                  <p className="text-sm text-[#78716C] mt-1">{modulesData[activeNav]?.subtitle || 'Manage atelier configuration and parameters.'}</p>
                </div>
                <button onClick={handleAddProductClick} className="bg-[#1C1A17] text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center space-x-2">
                  <Plus className="w-4 h-4" /><span>ADD NEW RECORD</span>
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-[#EFECE6] p-8 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#EFECE6] text-[11px] font-bold text-[#78716C] uppercase tracking-wider">
                        {modulesData[activeNav]?.headers.map((h, i) => (
                          <th key={i} className="py-3 px-3">{h}</th>
                        )) || <th className="py-3 px-3">Record Detail</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFECE6] text-sm">
                      {modulesData[activeNav]?.rows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-[#FAF8F5]/60 transition">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="py-4 px-3 text-[#1C1A17]">
                              {cIdx === row.length - 1 ? (
                                <button onClick={() => showToast(`Executing action: ${cell}`)} className="bg-black hover:bg-[#B89768] text-white text-xs px-3 py-1.5 rounded-lg font-bold">
                                  {cell}
                                </button>
                              ) : cell}
                            </td>
                          ))}
                        </tr>
                      )) || (
                        <tr>
                          <td colSpan="4" className="py-8 text-center text-[#78716C]">Active atelier module online and fully synced.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Storefront Modal */}
      {storefrontOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 border border-[#EFECE6] shadow-2xl space-y-6 text-center">
            <h3 className="font-serif text-2xl font-bold text-[#1C1A17]">WEFTIN Atelier Storefront Preview</h3>
            <p className="text-sm text-[#78716C]">Admin portal secured.</p>
            <button onClick={() => setStorefrontOpen(false)} className="w-full bg-[#1C1A17] text-white py-3 rounded-xl text-xs font-bold">CLOSE</button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-[#141311] text-white px-6 py-4 rounded-2xl shadow-2xl z-50 flex items-center space-x-3">
          <CheckCircle2 className="w-5 h-5 text-[#B89768]" />
          <p className="text-sm font-medium">{toastMessage}</p>
        </div>
      )}

    </div>
  );
}
