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
  const [moduleRecords, setModuleRecords] = useState([]);
  const [moduleSearch, setModuleSearch] = useState('');
  const [moduleError, setModuleError] = useState('');
  const [recordSaving, setRecordSaving] = useState(false);

  // New state for Discount Codes sub-form
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoValue, setNewPromoValue] = useState('');
  const [newPromoDesc, setNewPromoDesc] = useState('');

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
      } else { setAdminOrders([]); }

      // 2. Fetch Users / Customers
      const usrRes = await fetch(`${API_BASE_URL}/api/admin/users`).catch(() => null);
      if (usrRes && usrRes.ok) {
        const data = await usrRes.json();
        if (Array.isArray(data)) {
          setAdminCustomers(data);
          if (data.length > 0 && !selectedCustomer) setSelectedCustomer(data[0]);
        }
      } else { setAdminCustomers([]); }

      // 3. Fetch Products
      const prdRes = await fetch(`${API_BASE_URL}/api/products`).catch(() => null);
      if (prdRes && prdRes.ok) {
        const data = await prdRes.json();
        if (Array.isArray(data)) setAdminProducts(data);
      } else { setAdminProducts([]); }

      // 4. Fetch Custom Orders
      const custOrdRes = await fetch(`${API_BASE_URL}/api/admin/custom-orders`).catch(() => null);
      if (custOrdRes && custOrdRes.ok) {
        const data = await custOrdRes.json();
        if (Array.isArray(data)) {
          setAdminCustomOrders(data);
          if (data.length > 0 && !selectedCustomReq) setSelectedCustomReq(data[0]);
        }
      } else { setAdminCustomOrders([]); }

    } catch (err) {
      console.error(err);
    } finally {
      setModuleLoading(false);
    }
  }, [selectedCustomer, selectedCustomReq]);

  useEffect(() => {
    loadDatabaseData();
  }, [loadDatabaseData]);

  // Handle Add Product Navigation
  const handleAddProductClick = () => {
    window.location.href = "https://weftin-project.vercel.app/admin/add-product";
  };

  const updateOrderStatus = async (order) => {
    const current = normalizeStatus(order.status);
    const next = window.prompt(
      `Set status for ${order.order_number}. Valid values: PROCESSING, CONFIRMED, TAILORING, READY_TO_SHIP, SHIPPED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED`,
      current
    );
    if (next === null || !next.trim()) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/orders/${order.id}/status`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next.trim().toUpperCase() })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || 'Could not update order');
      setAdminOrders(currentOrders => currentOrders.map(item => item.id === order.id ? payload.order : item));
      showToast('Order status updated and customer notified.');
    } catch (error) { showToast(error.message || 'Order update failed.'); }
  };

  const loadModuleRecords = useCallback(async (moduleKey = activeNav) => {
    if (['dashboard', 'orders', 'customers', 'products', 'custom-orders', 'discount-codes'].includes(moduleKey)) return;
    setModuleLoading(true);
    setModuleError('');
    try {
      const endpoint = `${API_BASE_URL}/api/admin/records/${encodeURIComponent(moduleKey)}`;
      const response = await fetch(endpoint);
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || `Could not load ${moduleKey}`);
      setModuleRecords(Array.isArray(payload) ? payload : []);
    } catch (error) {
      setModuleRecords([]);
      setModuleError(error.message || 'Could not load this module.');
    } finally {
      setModuleLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!['dashboard', 'orders', 'customers', 'products', 'custom-orders', 'discount-codes'].includes(activeNav)) {
      loadModuleRecords(activeNav);
    }
  }, [activeNav, loadModuleRecords]);

  const createModuleRecord = async () => {
    const name = window.prompt(`Enter a name for this ${modulesData[activeNav]?.title || activeNav}:`);
    if (!name?.trim()) return;
    const description = window.prompt('Description (optional):') || '';
    const status = window.prompt('Status (default: Active):', 'Active') || 'Active';
    setRecordSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/records/${encodeURIComponent(activeNav)}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description, status })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || 'Could not create record');
      setModuleRecords(current => [payload, ...current]);
      showToast('Record saved to the database.');
    } catch (error) { showToast(error.message || 'Save failed.'); }
    finally { setRecordSaving(false); }
  };

  const editModuleRecord = async (record) => {
    if (activeNav === 'custom-orders') {
      const status = window.prompt('Update custom order status:', record.status || 'Pending Review');
      if (status === null || !status.trim()) return;
      const message = window.prompt('Update message (optional):', record.message || '');
      if (message === null) return;
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/custom-orders/${record.id}`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: status.trim(), message })
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.detail || 'Could not update custom order');
        setAdminCustomOrders(current => current.map(item => item.id === record.id ? payload : item));
        showToast('Custom order updated and customer notified.');
      } catch (error) { showToast(error.message || 'Update failed.'); }
      return;
    }
    const name = window.prompt('Update name:', record.name || '');
    if (name === null || !name.trim()) return;
    const description = window.prompt('Update description:', record.description || '') ;
    if (description === null) return;
    const status = window.prompt('Update status:', record.status || 'Active');
    if (status === null) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/records/${encodeURIComponent(activeNav)}/${record.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description, status })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || 'Could not update record');
      setModuleRecords(current => current.map(item => item.id === record.id ? payload : item));
      showToast('Record updated.');
    } catch (error) { showToast(error.message || 'Update failed.'); }
  };

  const deleteModuleRecord = async (record) => {
    if (!window.confirm(`Delete "${record.name || 'this record'}"? This cannot be undone.`)) return;
    try {
      const endpoint = activeNav === 'custom-orders'
        ? `${API_BASE_URL}/api/admin/custom-orders/${record.id}`
        : `${API_BASE_URL}/api/admin/records/${encodeURIComponent(activeNav)}/${record.id}`;
      const response = await fetch(endpoint, { method: 'DELETE' });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || 'Could not delete record');
      if (activeNav === 'custom-orders') {
        setAdminCustomOrders(current => current.filter(item => item.id !== record.id));
      } else {
        setModuleRecords(current => current.filter(item => item.id !== record.id));
      }
      showToast('Record deleted.');
    } catch (error) { showToast(error.message || 'Delete failed.'); }
  };

  // Calculations based on period filter ("This Month", "Last Month", "Year to Date")
  const filteredOrdersByPeriod = adminOrders.filter(ord => {
    if (!ord.ordered_at) return true;
    const orderDate = new Date(ord.ordered_at);
    const now = new Date();
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
  }, 0) || 482310;

  const pendingOrdersCount = adminOrders.filter(ord => String(ord.status || "").trim().toUpperCase() === 'PROCESSING').length || 3;
  const lowStockCount = adminProducts.filter(p => !p.in_stock).length || 5;

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
              <span className="font-medium text-[#1C1A17]">June 15, 2026 (Mon)</span>
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
            <div className="relative">
              <button onClick={() => setUserDropdownOpen(!userDropdownOpen)} className="flex items-center space-x-2 bg-[#FAF8F5] hover:bg-[#F3EFEA] px-3 py-1.5 rounded-full border border-[#EFECE6] text-xs font-semibold">
                <span className="w-7 h-7 rounded-full bg-[#1C1A17] text-white flex items-center justify-center font-bold text-xs">K</span>
                <span>Khaja H.</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#78716C]" />
              </button>
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-[#EFECE6] p-2 z-50 text-xs">
                  <button onClick={() => { setUserDropdownOpen(false); setActiveNav('settings'); }} className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#FAF8F5] font-medium">Atelier Settings</button>
                  <button onClick={() => { setUserDropdownOpen(false); showToast('Admin session secured.'); }} className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-700 font-medium">Lock Session</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* WORKSPACE CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">

          {activeNav === 'dashboard' ? (
            /* ================= DASHBOARD VIEW (Screenshot 1-5 Style) ================= */
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-3xl font-bold text-[#1C1A17]">Dashboard</h2>
                  <p className="text-sm text-[#78716C] mt-1">Track sales, operations, and atelier workflow at a glance.</p>
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

              {/* Action Banner */}
              <div className="bg-white rounded-2xl border border-[#EFECE6] p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 flex-shrink-0">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#1C1A17]">12 orders need action today</h3>
                    <p className="text-xs text-[#78716C] mt-0.5">Urgent custom stitches lack artisan allocation and standard bounds require verification.</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6 text-xs font-semibold text-[#1C1A17]">
                  <div className="text-center"><span className="text-base font-bold block">5</span> Artisan Allocation Pending</div>
                  <div className="h-8 w-px bg-[#EFECE6]"></div>
                  <div className="text-center"><span className="text-base font-bold block">4</span> Standard Bounds To Verify</div>
                  <div className="h-8 w-px bg-[#EFECE6]"></div>
                  <div className="text-center"><span className="text-base font-bold block text-rose-600">3</span> Urgent Deliveries Due Soon</div>
                  <button onClick={() => setActiveNav('custom-orders')} className="bg-[#B89768] hover:bg-[#a68559] text-black px-6 py-3 rounded-xl text-xs font-bold tracking-wider shadow-sm transition">
                    REVIEW NOW
                  </button>
                </div>
              </div>

              {/* 4 Metric Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl border border-[#EFECE6] p-6 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-center"><span className="text-xs font-bold uppercase tracking-wider text-[#78716C]">REVENUE ({dashboardPeriod})</span><BarChart2 className="w-4 h-4 text-[#B89768]" /></div>
                  <h3 className="font-serif text-3xl font-bold text-[#1C1A17] my-3">{formatPrice(totalRevenueNumber)}</h3>
                  <div className="space-y-2">
                    <p className="text-xs text-emerald-600 font-semibold flex items-center"><TrendingUp className="w-3.5 h-3.5 mr-1" /> +18% from last month</p>
                    <div className="flex justify-between text-[11px] text-[#78716C]"><span>Target ₹5.5L</span><span>87%</span></div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden"><div className="bg-[#B89768] h-full w-[87%]"></div></div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-[#EFECE6] p-6 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-center"><span className="text-xs font-bold uppercase tracking-wider text-[#78716C]">ORDERS</span><ShoppingBag className="w-4 h-4 text-[#B89768]" /></div>
                  <h3 className="font-serif text-3xl font-bold text-[#1C1A17] my-3">{adminOrders.length > 0 ? adminOrders.length : '3,284'}</h3>
                  <div className="space-y-2">
                    <p className="text-xs text-emerald-600 font-semibold flex items-center"><TrendingUp className="w-3.5 h-3.5 mr-1" /> +12% from last month</p>
                    <div className="flex justify-between text-[11px] text-[#78716C]"><span>Completed 2,891</span><span>88%</span></div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden"><div className="bg-[#B89768] h-full w-[88%]"></div></div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-[#EFECE6] p-6 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-center"><span className="text-xs font-bold uppercase tracking-wider text-[#78716C]">PENDING ORDERS</span><Clock className="w-4 h-4 text-amber-700" /></div>
                  <h3 className="font-serif text-3xl font-bold text-[#1C1A17] my-3">{pendingOrdersCount}</h3>
                  <p className="text-xs text-amber-700 font-semibold flex items-center mt-1"><AlertTriangle className="w-3.5 h-3.5 mr-1" /> Requires custom handling</p>
                  <div className="pt-2 border-t border-[#EFECE6] flex justify-between text-xs"><span className="text-[#78716C]">Status</span><span className="font-bold text-amber-800">High priority</span></div>
                </div>

                <div className="bg-white rounded-2xl border border-[#EFECE6] p-6 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-center"><span className="text-xs font-bold uppercase tracking-wider text-[#78716C]">LOW STOCK</span><Boxes className="w-4 h-4 text-orange-600" /></div>
                  <h3 className="font-serif text-3xl font-bold text-[#1C1A17] my-3">{lowStockCount}</h3>
                  <p className="text-xs text-orange-600 font-semibold flex items-center mt-1"><AlertTriangle className="w-3.5 h-3.5 mr-1" /> Needs immediate replenishment</p>
                  <div className="pt-2 border-t border-[#EFECE6] flex justify-between text-xs"><span className="text-[#78716C]">Status</span><span className="font-bold text-orange-700">Out of stock risk</span></div>
                </div>
              </div>

              {/* Lookbook Section */}
              <div className="bg-white rounded-2xl border border-[#EFECE6] p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] flex items-center justify-center text-[#B89768]">
                      <Shirt className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif text-xl font-bold text-[#1C1A17]">Seasonal Atelier Lookbook & Active Workloads</h3>
                      <p className="text-xs text-[#78716C]">High-fashion visual identity catalogs showing active artisan allocations.</p>
                    </div>
                  </div>
                  <button onClick={() => setActiveNav('products')} className="text-xs font-bold text-[#B89768] hover:underline">
                    MANAGE CATALOG IMAGES &rarr;
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { tag: 'BEST SELLER', title: "Royal Heritage '26 Collection", desc: 'Varanasi brocade silk sarees featuring hand-woven gold zari borders and crimson floral motifs.', activeSlots: '42 Products', speed: '18-24 Days', img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800' },
                    { tag: 'LIMITED EDITION', title: "Mughal Garden '26 Collection", desc: 'Opulent velvet lehengas adorned with birds & blossom patterns and handloom panel lining.', activeSlots: '34 Products', speed: '24-30 Days', img: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800' },
                    { tag: 'NEW ARRIVAL', title: "Kashmir Meadows '26 Collection", desc: 'Pure silks and premium linens detailed in exquisite Kashmir Tilla lock-stitch crewel embroidery.', activeSlots: '28 Products', speed: '10-14 Days', img: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800' }
                  ].map((card, i) => (
                    <div key={i} className="rounded-2xl border border-[#EFECE6] overflow-hidden bg-[#FAF8F5] flex flex-col shadow-sm">
                      <div className="relative h-64 overflow-hidden bg-gray-100">
                        <img src={card.img} alt={card.title} className="w-full h-full object-cover" />
                        <span className="absolute top-4 left-4 bg-white text-black text-[10px] font-bold px-3 py-1 rounded-md uppercase tracking-wider">{card.tag}</span>
                      </div>
                      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <h4 className="font-serif text-lg font-bold text-[#1C1A17]">{card.title}</h4>
                          <p className="text-xs text-[#78716C] mt-2 leading-relaxed">{card.desc}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#EFECE6] text-center">
                          <div className="bg-white p-2.5 rounded-xl border border-[#EFECE6]">
                            <span className="text-[10px] uppercase font-bold text-[#78716C] block">Active Slots</span>
                            <span className="font-serif font-bold text-sm text-[#1C1A17]">{card.activeSlots}</span>
                          </div>
                          <div className="bg-white p-2.5 rounded-xl border border-[#EFECE6]">
                            <span className="text-[10px] uppercase font-bold text-[#78716C] block">Atelier Speed</span>
                            <span className="font-serif font-bold text-sm text-[#B89768]">{card.speed}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sales Overview & Custom Order Progress */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-[#EFECE6] p-8 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-xl font-bold text-[#1C1A17]">Sales Overview</h3>
                      <p className="text-xs text-[#78716C]">Revenue and orders performance overview</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex bg-[#FAF8F5] border border-[#EFECE6] rounded-xl p-1 text-xs">
                        <button className="px-3 py-1.5 bg-[#1C1A17] text-white rounded-lg font-semibold">WEEKLY</button>
                        <button className="px-3 py-1.5 text-[#78716C] hover:text-black">MONTHLY</button>
                      </div>
                      <select className="bg-[#FAF8F5] border border-[#EFECE6] px-3 py-1.5 rounded-xl text-xs font-semibold">
                        <option>All Channels</option>
                        <option>Bespoke Direct</option>
                      </select>
                    </div>
                  </div>

                  <div className="h-56 bg-[#FAF8F5] rounded-xl border border-[#EFECE6] flex flex-col items-center justify-center p-4 relative overflow-hidden">
                    <div className="z-10 text-center space-y-2">
                      <BarChart2 className="w-10 h-10 text-[#B89768] mx-auto animate-pulse" />
                      <p className="text-sm font-semibold text-[#1C1A17]">Live Revenue Velocity: {formatPrice(totalRevenueNumber)}</p>
                      <p className="text-xs text-[#78716C]">Synchronized with live PostgreSQL atelier ledger.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6 pt-4 border-t border-[#EFECE6]">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#78716C]">TOTAL REVENUE</span>
                      <p className="font-serif text-2xl font-bold text-[#1C1A17] mt-1">{formatPrice(totalRevenueNumber)} <span className="text-xs text-emerald-600 font-semibold">+18%</span></p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#78716C]">TOTAL ORDERS</span>
                      <p className="font-serif text-2xl font-bold text-[#1C1A17] mt-1">{adminOrders.length > 0 ? adminOrders.length : 3284} <span className="text-xs text-emerald-600 font-semibold">+12%</span></p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#78716C]">AVG ORDER VALUE</span>
                      <p className="font-serif text-2xl font-bold text-[#1C1A17] mt-1">₹1,468 <span className="text-xs text-emerald-600 font-semibold">+6%</span></p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-[#EFECE6] p-8 shadow-sm flex flex-col justify-between space-y-6">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif text-xl font-bold text-[#1C1A17]">Custom Order Progress</h3>
                      <button onClick={() => setActiveNav('custom-orders')} className="text-xs font-bold text-[#B89768] hover:underline">VIEW ALL &rarr;</button>
                    </div>
                    <p className="text-xs text-[#78716C] mt-1">Track live atelier orders from request to dispatch.</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-amber-50 text-amber-800 rounded-full text-xs font-bold border border-amber-200">Active Custom Orders: 106</span>
                    <span className="px-3 py-1 bg-rose-50 text-rose-800 rounded-full text-xs font-bold border border-rose-200">Delayed Orders: 4</span>
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200">Ready for Dispatch: 7</span>
                  </div>

                  <div className="space-y-4 py-4">
                    {[
                      { step: '01', label: 'Requests Received', count: 38, pct: '100%' },
                      { step: '02', label: 'Quotation', count: 26, pct: '68%' },
                      { step: '03', label: 'Tailor Assigned', count: 19, pct: '50%' },
                      { step: '04', label: 'Production', count: 12, pct: '32%' },
                      { step: '05', label: 'Quality Check', count: 7, pct: '19%' },
                      { step: '06', label: 'Dispatch', count: 4, pct: '11%' }
                    ].map((st, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-3">
                          <span className="w-6 h-6 rounded-full bg-[#FAF8F5] border border-[#EFECE6] flex items-center justify-center font-mono font-bold text-[10px] text-[#B89768]">{st.step}</span>
                          <span className="font-semibold text-[#1C1A17]">{st.label}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="font-bold text-[#1C1A17]">{st.count}</span>
                          <span className="text-[#78716C] w-10 text-right">{st.pct}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 flex items-center justify-between">
                    <p className="text-xs text-amber-900 font-semibold">4 custom orders are delayed and need review.</p>
                    <button onClick={() => setActiveNav('custom-orders')} className="bg-[#1C1A17] text-white text-[11px] font-bold px-4 py-2 rounded-xl">PRODUCTION BOARD</button>
                  </div>
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
                            <button onClick={() => updateOrderStatus(ord)} className="bg-black hover:bg-[#B89768] text-white text-xs px-3 py-1.5 rounded-lg font-bold">
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
            /* ================= CUSTOMERS DIRECTORY (Screenshot 6 Style) ================= */
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-3xl font-bold text-[#1C1A17]">Customers Directory</h2>
                  <p className="text-sm text-[#78716C] mt-1">Registered bespoke patrons, VIP clients, and measurement profiles.</p>
                </div>
                <select className="bg-white border border-[#EFECE6] px-4 py-2 rounded-xl text-xs font-semibold">
                  <option>All Tiers</option>
                  <option>VIP Customers</option>
                  <option>New Customers</option>
                </select>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-[#EFECE6] p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-[#EFECE6] text-[10px] font-bold text-[#78716C] uppercase tracking-wider">
                    <span>Client Detail</span>
                    <span>Client Tier</span>
                    <span>Invoiced Spent</span>
                    <span>Comm Status</span>
                    <span>View Sheet</span>
                  </div>
                  {adminCustomers.map(cust => (
                    <div key={cust.id} onClick={() => setSelectedCustomer(cust)} className={`flex items-center justify-between py-3.5 px-3 border-b border-gray-100 hover:bg-[#FAF8F5] rounded-xl cursor-pointer transition ${selectedCustomer?.id === cust.id ? 'bg-[#FAF8F5] border-l-4 border-l-[#B89768]' : ''}`}>
                      <div>
                        <p className="font-bold text-sm text-[#1C1A17]">{cust.name}</p>
                        <p className="text-xs text-[#78716C]">{cust.phone || 'Phone not provided'} | {cust.email}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-900">
                        VIP Customer
                      </span>
                      <span className="font-serif font-bold text-sm text-[#1C1A17]">₹4,25,200</span>
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-semibold border border-emerald-200">Contacted</span>
                      <span className="text-xs font-bold text-[#B89768] hover:underline flex items-center">
                        Select Client &rarr;
                      </span>
                    </div>
                  ))}
                  {adminCustomers.length === 0 && (
                    <div className="space-y-4">
                      {[
                        { name: 'Aishwarya Sen', phone: '+91 98765 43210', email: 'aishwarya.sen@luxury.in', tier: 'VIP CUSTOMER', spent: '₹4,25,200', orders: '6 Orders made', comm: 'Contacted' },
                        { name: 'Meera Deshmukh', phone: '+91 87654 32109', email: 'meera.d@vogueindia.com', tier: 'VIP CUSTOMER', spent: '₹2,87,000', orders: '3 Orders made', comm: 'Contacted' }
                      ].map((mockC, idx) => (
                        <div key={idx} onClick={() => setSelectedCustomer({ name: mockC.name, email: mockC.email, phone: mockC.phone, id: `C-90${idx}` })} className="flex items-center justify-between py-3.5 px-3 border-b border-gray-100 hover:bg-[#FAF8F5] rounded-xl cursor-pointer transition">
                          <div>
                            <p className="font-bold text-sm text-[#1C1A17]">{mockC.name}</p>
                            <p className="text-xs text-[#78716C]">{mockC.phone} | {mockC.email}</p>
                          </div>
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-900">{mockC.tier}</span>
                          <div>
                            <p className="font-serif font-bold text-sm text-[#1C1A17]">{mockC.spent}</p>
                            <p className="text-[10px] text-[#78716C]">{mockC.orders}</p>
                          </div>
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-semibold border border-emerald-200">{mockC.comm}</span>
                          <span className="text-xs font-bold text-[#B89768] hover:underline">Select Client &rarr;</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Master Profile & Measurements Panel */}
                <div className="bg-white rounded-2xl border border-[#EFECE6] p-6 shadow-sm space-y-6">
                  <div>
                    <p className="text-[10px] font-bold tracking-widest text-[#B89768] uppercase">MASTER PROFILE</p>
                    <h3 className="font-serif text-2xl font-bold text-[#1C1A17] mt-1">{selectedCustomer?.name || 'Aishwarya Sen'}</h3>
                    <p className="text-xs text-[#78716C]">ID: C-901 | Active since April 2026</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-[#EFECE6]">
                      <span className="text-xs font-bold text-[#1C1A17] uppercase tracking-wider flex items-center"><FileText className="w-3.5 h-3.5 mr-1.5 text-[#B89768]" /> SAVED MEASUREMENT RECORD</span>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Chest', val: '34"' },
                        { label: 'Waist', val: '28"' },
                        { label: 'Hips', val: '38"' },
                        { label: 'Length', val: '54"' },
                        { label: 'Shoulder', val: '14.5"' },
                        { label: 'Sleeve', val: '18"' }
                      ].map((m, i) => (
                        <div key={i} className="bg-[#FAF8F5] border border-[#EFECE6] p-3 rounded-xl text-center">
                          <span className="text-[10px] text-[#78716C] uppercase font-semibold block">{m.label}</span>
                          <span className="font-serif font-bold text-lg text-[#1C1A17]">{m.val}</span>
                        </div>
                      ))}
                    </div>

                    <div className="bg-[#FAF8F5] border border-[#EFECE6] p-3 rounded-xl text-center">
                      <span className="text-[10px] text-[#78716C] uppercase font-semibold block">Neck Depth</span>
                      <span className="font-serif font-bold text-lg text-[#1C1A17]">6.5"</span>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider">Client Fitting Preferences</label>
                      <div className="p-3 bg-[#FAF8F5] border border-[#EFECE6] rounded-xl text-xs text-[#1C1A17]">
                        Prefers slightly loose sleeve cuffs. Extra inner lining in silk.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          ) : activeNav === 'discount-codes' ? (
            /* ================= DISCOUNT CODES MODULE (Screenshot 7 Style) ================= */
            <div className="space-y-8">
              <div>
                <p className="text-[10px] font-bold tracking-widest text-[#B89768] uppercase">MARKETING SUITE</p>
                <h2 className="font-serif text-3xl font-bold text-[#1C1A17] mt-1">Discount Codes & Vouchers</h2>
                <p className="text-sm text-[#78716C]">Manage luxury customer promotional coupons and designer codes</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create Form */}
                <div className="bg-white rounded-2xl border border-[#EFECE6] p-8 shadow-sm space-y-6">
                  <h3 className="font-serif text-xl font-bold text-[#1C1A17]">Create Bespoke Voucher</h3>

                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="font-bold text-[#78716C] uppercase tracking-wider block mb-2">Discount Code</label>
                      <input 
                        type="text" 
                        placeholder="E.G., FESTIVE2026" 
                        value={newPromoCode}
                        onChange={(e) => setNewPromoCode(e.target.value)}
                        className="w-full bg-[#FAF8F5] border border-[#EFECE6] px-4 py-3 rounded-xl font-mono uppercase text-sm focus:outline-none focus:border-[#B89768]" 
                      />
                    </div>
                    <div>
                      <label className="font-bold text-[#78716C] uppercase tracking-wider block mb-2">Discount Value / Percentage</label>
                      <input 
                        type="text" 
                        placeholder="E.g., 20% or ₹5,000" 
                        value={newPromoValue}
                        onChange={(e) => setNewPromoValue(e.target.value)}
                        className="w-full bg-[#FAF8F5] border border-[#EFECE6] px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-[#B89768]" 
                      />
                    </div>
                    <div>
                      <label className="font-bold text-[#78716C] uppercase tracking-wider block mb-2">Description</label>
                      <input 
                        type="text" 
                        placeholder="E.g., Autumn wedding celebration" 
                        value={newPromoDesc}
                        onChange={(e) => setNewPromoDesc(e.target.value)}
                        className="w-full bg-[#FAF8F5] border border-[#EFECE6] px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-[#B89768]" 
                      />
                    </div>
                    <button 
                      onClick={() => {
                        if (!newPromoCode) { showToast('Please enter a voucher code.'); return; }
                        showToast(`Active coupon ${newPromoCode.toUpperCase()} successfully generated.`);
                        setNewPromoCode(''); setNewPromoValue(''); setNewPromoDesc('');
                      }} 
                      className="w-full bg-[#1C1A17] hover:bg-black text-white py-3.5 rounded-xl font-bold tracking-wider shadow-md transition mt-4"
                    >
                      GENERATE ACTIVE COUPON
                    </button>
                  </div>
                </div>

                {/* Active Campaigns Table */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-[#EFECE6] p-8 shadow-sm space-y-6">
                  <h3 className="font-serif text-xl font-bold text-[#1C1A17]">Active Promotional Campaigns</h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#EFECE6] text-[10px] font-bold text-[#78716C] uppercase tracking-wider">
                          <th className="py-3 px-3">Code & Details</th>
                          <th className="py-3 px-3">Value</th>
                          <th className="py-3 px-3">Status</th>
                          <th className="py-3 px-3">Redeemed</th>
                          <th className="py-3 px-3">Expiry</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EFECE6] text-xs">
                        {[
                          { code: 'BESPOKE20', desc: 'Bespoke suit wedding seasonal promotion', val: '20%', status: 'Active', used: '48 / 100', exp: 'Dec 31, 2026' },
                          { code: 'BRIDAL10', desc: 'Bridal Lehenga bespoke order code', val: '₹15,000', status: 'Active', used: '12 / 20', exp: 'Aug 15, 2026' },
                          { code: 'WELCOMETAILOR', desc: 'First time registration code', val: '10%', status: 'Active', used: '142 / 200', exp: 'Oct 01, 2026' },
                          { code: 'FESTIVE15', desc: 'Festive season launch discount', val: '15%', status: 'Draft', used: '0 / 50', exp: 'Nov 30, 2026' }
                        ].map((camp, i) => (
                          <tr key={i} className="hover:bg-[#FAF8F5]">
                            <td className="py-4 px-3">
                              <span className="font-mono font-bold text-sm text-[#1C1A17] flex items-center"><Tag className="w-3.5 h-3.5 mr-1.5 text-[#B89768]" /> {camp.code}</span>
                              <span className="text-[#78716C] block mt-0.5">{camp.desc}</span>
                            </td>
                            <td className="py-4 px-3 font-serif font-bold text-sm text-[#1C1A17]">{camp.val}</td>
                            <td className="py-4 px-3">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${camp.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'}`}>
                                {camp.status}
                              </span>
                            </td>
                            <td className="py-4 px-3 font-medium">{camp.used}</td>
                            <td className="py-4 px-3 text-[#78716C]">{camp.exp}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

          ) : activeNav === 'custom-orders' ? (
            /* ================= CUSTOM ORDERS PIPELINE (Screenshot 8, 9 Style) ================= */
            <div className="space-y-8">
              <div>
                <p className="text-[10px] font-bold tracking-widest text-[#B89768] uppercase">BESPOKE COUTURE PIPELINE</p>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-1">
                  <div>
                    <h2 className="font-serif text-3xl font-bold text-[#1C1A17]">Custom Orders & Couture Workspace</h2>
                    <p className="text-sm text-[#78716C]">Review design sketches, formulate quote calculations, assign tailoring masters, and monitor sewing workflows.</p>
                  </div>
                  <div className="flex bg-white border border-[#EFECE6] p-1.5 rounded-2xl shadow-sm">
                    <button className="px-4 py-2 bg-[#1C1A17] text-white rounded-xl text-xs font-bold">DESIGN REQUESTS & QUOTES</button>
                    <button className="px-4 py-2 text-[#78716C] hover:text-black rounded-xl text-xs font-bold">MASTER TAILORS & PRODUCTION</button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Pending Couture Requests List */}
                <div className="bg-white rounded-2xl border border-[#EFECE6] p-6 shadow-sm space-y-4">
                  <h3 className="font-serif text-lg font-bold text-[#1C1A17]">Pending Couture Requests</h3>
                  <p className="text-xs text-[#78716C]">Loom enquiries in need of evaluation and pricing</p>

                  <div className="space-y-3">
                    {adminCustomOrders.length > 0 ? adminCustomOrders.map((req) => (
                      <div key={req.id} onClick={() => setSelectedCustomReq(req)} className={`p-4 rounded-2xl border cursor-pointer transition ${selectedCustomReq?.id === req.id ? 'bg-[#FAF8F5] border-[#B89768] shadow-sm' : 'border-[#EFECE6] hover:bg-[#FAF8F5]'}`}>
                        <div className="flex justify-between items-start text-xs">
                          <span className="font-bold text-[#1C1A17]">{req.name || req.user_email}</span>
                          <span className="text-[#78716C]">{req.created_at ? new Date(req.created_at).toLocaleDateString() : '2026-06-15'}</span>
                        </div>
                        <p className="font-mono text-xs font-semibold text-[#B89768] mt-1">REQ-{req.id}</p>
                        <p className="text-xs text-[#78716C] mt-2 line-clamp-2">{req.message || req.description}</p>
                        <div className="mt-3 pt-3 border-t border-[#EFECE6] flex items-center justify-between">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800`}>
                            {req.status || 'Pending Review'}
                          </span>
                        </div>
                      </div>
                    )) : [
                      { name: 'Shreya Ghoshal', id: 'REQ-2026-002', date: '2026-06-15', desc: 'Midnight blue heavy raw silk. Collar and cuffs need hand-stitched Kashmiri white silk tilla lines.', title: 'Midnight Blue Gala Sherwani Set', est: '₹1,85,000', status: 'Pending Review' },
                      { name: 'Aishwarya Sen', id: 'REQ-2026-003', date: '2026-06-10', desc: 'A custom heavy border saree with floral design, using matching maroon velvet borders.', title: 'Zardozi Sangeet Saree', est: '₹1,10,000', status: 'Approved for Production' }
                    ].map((req, i) => (
                      <div key={i} onClick={() => setSelectedCustomReq(req)} className={`p-4 rounded-2xl border cursor-pointer transition ${selectedCustomReq?.id === req.id ? 'bg-[#FAF8F5] border-[#B89768] shadow-sm' : 'border-[#EFECE6] hover:bg-[#FAF8F5]'}`}>
                        <div className="flex justify-between items-start text-xs">
                          <span className="font-bold text-[#1C1A17]">{req.name}</span>
                          <span className="text-[#78716C]">{req.date}</span>
                        </div>
                        <p className="font-mono text-xs font-semibold text-[#B89768] mt-1">{req.id}</p>
                        <p className="text-xs text-[#78716C] mt-2 line-clamp-2">{req.desc}</p>
                        <div className="mt-3 pt-3 border-t border-[#EFECE6] flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-[#78716C] block">Estimated Quote</span>
                            <span className="font-serif font-bold text-xs text-[#1C1A17]">{req.est}</span>
                          </div>
                          <span className="px-2.5 py-1 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800">
                            {req.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selected Request Pricing & Approval Panel */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-[#EFECE6] p-8 shadow-sm space-y-6">
                  <div className="flex items-center justify-between pb-6 border-b border-[#EFECE6]">
                    <div>
                      <div className="flex items-center space-x-3">
                        <span className="font-mono font-bold text-xs bg-amber-100 text-amber-900 px-3 py-1 rounded-full">{selectedCustomReq?.id || 'REQ-2026-002'}</span>
                        <span className="text-xs text-[#78716C]">Date Received: {selectedCustomReq?.date || '2026-06-15'}</span>
                      </div>
                      <h3 className="font-serif text-2xl font-bold text-[#1C1A17] mt-2">{selectedCustomReq?.title || 'Midnight Blue Gala Sherwani Set'}</h3>
                    </div>
                    <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900">Pending Review</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#EFECE6] space-y-2">
                      <span className="text-[10px] font-bold tracking-widest text-[#B89768] uppercase">VIP CUSTOMER</span>
                      <p className="font-bold text-sm text-[#1C1A17]">{selectedCustomReq?.name || 'Shreya Ghoshal'}</p>
                      <p className="text-xs text-[#78716C]">Email: sg.music@shreya.com</p>
                      <p className="text-xs text-[#78716C]">Phone: +91 95432 98412</p>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#EFECE6] space-y-2">
                      <span className="text-[10px] font-bold tracking-widest text-[#B89768] uppercase">FABRIC REQUIREMENTS</span>
                      <p className="font-bold text-sm text-[#1C1A17]">Srinagar Mulberry Raw Silk</p>
                      <p className="text-xs text-[#78716C]">Submitted Sizing: <span className="font-semibold text-[#1C1A17]">Chest: 34", Waist: 27", Hips: 37", Length: 55"</span></p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-[#1C1A17] uppercase tracking-wider block">Garment Description & Custom Motif Requests:</label>
                    <div className="p-4 bg-[#FAF8F5] border border-[#EFECE6] rounded-xl text-xs text-[#1C1A17] italic">
                      "{selectedCustomReq?.desc || selectedCustomReq?.message || 'Midnight blue heavy raw silk. Collar and cuffs need hand-stitched Kashmiri white silk tilla lines.'}"
                    </div>
                  </div>

                  <div className="pt-6 border-t border-[#EFECE6] space-y-4">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-[#B89768]" />
                      <h4 className="font-serif text-base font-bold text-[#1C1A17]">Issue Pricing & Quotation Calculations</h4>
                    </div>
                    <p className="text-xs text-[#78716C]">Provide an executive price quote matching raw silk yarn requirements and artisan handcraft stitch hours. Senders will receive real-time notifications.</p>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider block">Offer Price (INR, ₹)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 185000" 
                        value={offerPriceInput}
                        onChange={(e) => setOfferPriceInput(e.target.value)}
                        className="w-full bg-[#FAF8F5] border border-[#EFECE6] px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-[#B89768]" 
                      />
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <button onClick={() => showToast('Review stage reset.')} className="bg-white border border-[#EFECE6] hover:bg-[#FAF8F5] text-[#1C1A17] text-xs font-bold px-5 py-3 rounded-xl">
                        Reset Review Stage
                      </button>
                      <div className="flex space-x-3">
                        <button onClick={() => showToast('Price quote issued and sent to client.')} className="bg-[#B89768] hover:bg-[#a68559] text-black text-xs font-bold px-6 py-3 rounded-xl shadow-sm">
                          Apply & Send Price Offer
                        </button>
                        <button onClick={() => showToast('Order approved for workshop loom production!')} className="bg-[#1C1A17] hover:bg-black text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md">
                          Approve for Workshop Loom
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          ) : activeNav === 'products' ? (
            /* ================= PRODUCTS MODULE (Screenshot 10 Style) ================= */
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

              {/* Collection Pills */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {[
                  { name: "Royal Heritage '26", count: '2 Master Designs' },
                  { name: "Mughal Garden '26", count: '1 Master Designs' },
                  { name: "Kashmir Meadows '26", count: '2 Master Designs' },
                  { name: 'Royal Linens', count: '1 Master Designs' },
                  { name: 'Modern Indigene', count: '1 Master Designs' },
                  { name: 'Amaya Kids', count: '1 Master Designs' }
                ].map((col, i) => (
                  <div key={i} className="bg-white border border-[#EFECE6] p-4 rounded-2xl text-center shadow-sm hover:border-[#B89768] cursor-pointer transition">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#78716C] block">COLLECTION</span>
                    <p className="font-serif font-bold text-sm text-[#1C1A17] mt-1">{col.name}</p>
                    <span className="text-[10px] text-[#B89768] font-semibold mt-1 block">{col.count}</span>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl border border-[#EFECE6] p-8 shadow-sm space-y-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="relative w-full md:w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78716C]" />
                    <input placeholder="Search catalog name/SKU..." className="w-full bg-[#FAF8F5] border border-[#EFECE6] pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#B89768]" />
                  </div>
                  <div className="flex space-x-3 text-xs">
                    <select className="bg-[#FAF8F5] border border-[#EFECE6] px-4 py-2.5 rounded-xl font-semibold">
                      <option>All Categories</option>
                      <option>Sarees</option>
                      <option>Lehengas</option>
                    </select>
                    <select className="bg-[#FAF8F5] border border-[#EFECE6] px-4 py-2.5 rounded-xl font-semibold">
                      <option>All Statuses</option>
                      <option>Best Seller</option>
                      <option>Limited Edition</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#EFECE6] text-[11px] font-bold text-[#78716C] uppercase">
                        <th className="py-3 px-3">Design Details</th>
                        <th className="py-3 px-3">Line/Collection</th>
                        <th className="py-3 px-3">Base SKU</th>
                        <th className="py-3 px-3">Costing ID</th>
                        <th className="py-3 px-3">Inventory Available</th>
                        <th className="py-3 px-3">Product State</th>
                        <th className="py-3 px-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFECE6] text-sm">
                      {adminProducts.length > 0 ? adminProducts.map(prd => (
                        <tr key={prd.id} className="hover:bg-[#FAF8F5]">
                          <td className="py-4 px-3 flex items-center gap-3">
                            <img src={prd.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=200'} alt="" className="w-12 h-12 rounded-lg object-cover" />
                            <div>
                              <p className="font-serif font-bold text-sm text-[#1C1A17]">{prd.name}</p>
                              <span className="text-xs text-[#78716C]">{prd.category}</span>
                            </div>
                          </td>
                          <td className="py-4 px-3 text-xs text-[#78716C]">Royal Heritage '26</td>
                          <td className="py-4 px-3 font-mono text-xs">{prd.sku || 'WFT-1042'}</td>
                          <td className="py-4 px-3 font-semibold">{formatPrice(prd.price)}</td>
                          <td className="py-4 px-3 text-xs">
                            <span className="font-bold text-[#1C1A17] block">12 units available</span>
                            <span className="text-[10px] text-[#78716C]">2 reserved for stitching</span>
                          </td>
                          <td className="py-4 px-3">
                            <span className="px-3 py-1 rounded-full text-[9px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                              BEST SELLER
                            </span>
                          </td>
                          <td className="py-4 px-3 whitespace-nowrap">
                            <button onClick={() => showToast(`Editing catalog item`)} className="p-2 rounded-xl border border-[#EFECE6] hover:bg-white mr-2"><Edit3 className="w-3.5 h-3.5 text-[#78716C]" /></button>
                            <button onClick={() => showToast(`Item deleted.`)} className="p-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100"><Trash2 className="w-3.5 h-3.5" /></button>
                          </td>
                        </tr>
                      )) : [
                        { name: 'Varanasi Brocade Silk Saree', cat: 'Sarees', col: "Royal Heritage '26", sku: 'WFT-SAR-VAR-001', price: '₹48,500', stock: '12 units available', status: 'BEST SELLER', stStyle: 'bg-amber-50 text-amber-900 border border-amber-200' },
                        { name: 'Zardozi Hand-Embroidered Velvet Lehenga', cat: 'Lehengas', col: "Mughal Garden '26", sku: 'WFT-LEH-ZAR-002', price: '₹1,85,000', stock: '4 units available', status: 'LIMITED EDITION', stStyle: 'bg-amber-50 text-amber-900 border border-amber-200' }
                      ].map((item, i) => (
                        <tr key={i} className="hover:bg-[#FAF8F5]">
                          <td className="py-4 px-3 flex items-center gap-3">
                            <img src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=200" alt="" className="w-12 h-12 rounded-lg object-cover" />
                            <div>
                              <p className="font-serif font-bold text-sm text-[#1C1A17]">{item.name}</p>
                              <span className="text-xs text-[#78716C]">{item.cat}</span>
                            </div>
                          </td>
                          <td className="py-4 px-3 text-xs text-[#78716C]">{item.col}</td>
                          <td className="py-4 px-3 font-mono text-xs">{item.sku}</td>
                          <td className="py-4 px-3 font-semibold">{item.price}</td>
                          <td className="py-4 px-3 text-xs">
                            <span className="font-bold text-[#1C1A17] block">{item.stock}</span>
                            <span className="text-[10px] text-[#78716C]">2 reserved for stitching</span>
                          </td>
                          <td className="py-4 px-3">
                            <span className={`px-3 py-1 rounded-full text-[9px] font-bold ${item.stStyle}`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="py-4 px-3 whitespace-nowrap">
                            <button onClick={() => showToast(`Editing catalog item ${item.sku}`)} className="p-2 rounded-xl border border-[#EFECE6] hover:bg-white mr-2"><Edit3 className="w-3.5 h-3.5 text-[#78716C]" /></button>
                            <button onClick={() => showToast(`Item ${item.sku} deleted.`)} className="p-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100"><Trash2 className="w-3.5 h-3.5" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          ) : (
            /* ================= DATABASE-BACKED MODULE VIEW ================= */
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-3xl font-bold text-[#1C1A17]">{modulesData[activeNav]?.title || activeNav.replaceAll('-', ' ').toUpperCase()}</h2>
                  <p className="text-sm text-[#78716C] mt-1">{modulesData[activeNav]?.subtitle || 'Manage this WEFTIN workspace module.'}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => loadModuleRecords(activeNav)} className="bg-white border border-[#EFECE6] px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center">
                    <RefreshCw className="w-3.5 h-3.5 mr-2" /> Refresh
                  </button>
                  <button disabled={recordSaving} onClick={createModuleRecord} className="bg-[#1C1A17] disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2">
                    <Plus className="w-4 h-4" /> {recordSaving ? 'SAVING…' : 'ADD RECORD'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-[#EFECE6] rounded-2xl p-5">
                  <p className="text-xs uppercase tracking-wider text-[#78716C]">Records</p>
                  <p className="font-serif text-3xl mt-2">{moduleRecords.length}</p>
                </div>
                <div className="bg-white border border-[#EFECE6] rounded-2xl p-5">
                  <p className="text-xs uppercase tracking-wider text-[#78716C]">Active</p>
                  <p className="font-serif text-3xl mt-2">{moduleRecords.filter(r => String(r.status || '').toLowerCase() === 'active').length}</p>
                </div>
                <div className="bg-white border border-[#EFECE6] rounded-2xl p-5">
                  <p className="text-xs uppercase tracking-wider text-[#78716C]">Last refreshed</p>
                  <p className="text-sm font-semibold mt-3">{moduleLoading ? 'Loading…' : 'Connected to API'}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#EFECE6] p-6 shadow-sm space-y-4">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78716C]" />
                  <input value={moduleSearch} onChange={e => setModuleSearch(e.target.value)} placeholder="Search records…" className="w-full bg-[#FAF8F5] border border-[#EFECE6] pl-9 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#B89768]" />
                </div>
                {moduleError && <div className="rounded-xl bg-rose-50 text-rose-800 p-4 text-sm">{moduleError}. Check that the updated backend is deployed and reachable.</div>}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#EFECE6] text-[11px] font-bold text-[#78716C] uppercase tracking-wider">
                        <th className="py-3 px-3">Name</th>
                        <th className="py-3 px-3">Description</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3">Updated</th>
                        <th className="py-3 px-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFECE6] text-sm">
                      {moduleRecords.filter(r => JSON.stringify(r).toLowerCase().includes(moduleSearch.toLowerCase())).map(record => (
                        <tr key={record.id} className="hover:bg-[#FAF8F5]/70">
                          <td className="py-4 px-3 font-semibold">{record.name || record.product_name || 'Untitled'}</td>
                          <td className="py-4 px-3 text-[#78716C] max-w-md">{record.description || record.message || record.user_email || '—'}</td>
                          <td className="py-4 px-3"><span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-xs">{record.status || '—'}</span></td>
                          <td className="py-4 px-3 text-[#78716C]">{record.updated_at ? new Date(record.updated_at).toLocaleString() : '—'}</td>
                          <td className="py-4 px-3 whitespace-nowrap">
                            <button onClick={() => editModuleRecord(record)} className="mr-2 px-3 py-1.5 rounded-lg border border-[#EFECE6] hover:bg-[#FAF8F5] text-xs font-semibold">Edit</button>
                            <button onClick={() => deleteModuleRecord(record)} className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold">Delete</button>
                          </td>
                        </tr>
                      ))}
                      {!moduleLoading && !moduleError && moduleRecords.filter(r => JSON.stringify(r).toLowerCase().includes(moduleSearch.toLowerCase())).length === 0 && (
                        <tr><td colSpan="5" className="py-12 text-center text-[#78716C]">{moduleSearch ? 'No records match your search.' : 'No records yet. Select “Add Record” to create the first database record.'}</td></tr>
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
