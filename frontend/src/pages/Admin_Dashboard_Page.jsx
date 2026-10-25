import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  ChevronDown, 
  Search, 
  Plus, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  FileText, 
  Trash2, 
  Edit3, 
  Printer,
  DollarSign,
  BarChart2,
  Globe,
  Settings,
  Calendar,
  Lock,
  Mail,
  KeyRound,
  Loader2,
  ShieldCheck,
  Menu,
  X,
  User,
  Check
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://weftin-project.onrender.com";

export default function Admin_Dashboard_Page() {
  const navigate = useNavigate();

  // Admin Login Prompt States
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [adminEmailInput, setAdminEmailInput] = useState("");
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [authenticating, setAuthenticating] = useState(false);

  const [activeNav, setActiveNav] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [storefrontOpen, setStorefrontOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Live Database States
  const [adminOrders, setAdminOrders] = useState([]);
  const [adminCustomers, setAdminCustomers] = useState([]);
  const [adminProducts, setAdminProducts] = useState([]);
  const [adminCustomOrders, setAdminCustomOrders] = useState([]);
  const [customerMeasurements, setCustomerMeasurements] = useState([]);
  const [moduleLoading, setModuleLoading] = useState(false);
  
  // Dashboard & Module Filters
  const [dashboardPeriod, setDashboardPeriod] = useState('This Month');
  const [salesTimeframe, setSalesTimeframe] = useState('WEEKLY');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedCustomReq, setSelectedCustomReq] = useState(null);
  const [offerPriceInput, setOfferPriceInput] = useState('');
  const [moduleRecords, setModuleRecords] = useState([]);
  const [moduleSearch, setModuleSearch] = useState('');
  const [moduleError, setModuleError] = useState('');
  const [recordSaving, setRecordSaving] = useState(false);

  // Admin profile state
  const [adminName, setAdminName] = useState("Khaja H.");
  const [adminRole, setAdminRole] = useState("Master Atelier Administrator");

  // Notifications state
  const [notifications, setNotifications] = useState([
    { id: 1, title: "New Custom Order Inquiry", desc: "Patron submitted a custom design request.", time: "10m ago", read: false },
    { id: 2, title: "Low Stock Warning", desc: "Silk Fabric inventory is falling below safety bounds.", time: "1h ago", read: false },
    { id: 3, title: "Order Completed", desc: "Order #WF-2026-000029 marked as Shipped.", time: "3h ago", read: true }
  ]);

  // Discount Codes sub-form states
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoValue, setNewPromoValue] = useState('');
  const [newPromoDesc, setNewPromoDesc] = useState('');

  // Live Current Date
  const [currentDateFormatted, setCurrentDateFormatted] = useState('');

  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
      setCurrentDateFormatted(now.toLocaleDateString('en-US', options));
    };
    updateDate();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ---------------------------------------------------------
  // ADMIN AUTHENTICATION GUARD (ID 10 Check via Isolated Admin Keys)
  // ---------------------------------------------------------
  useEffect(() => {
    const adminAuth = localStorage.getItem("weftin_admin_auth");
    const storedAdminUser = JSON.parse(localStorage.getItem("weftin_admin_user") || "null");

    if (adminAuth === "true" && storedAdminUser?.id === 10) {
      setIsAdminAuthenticated(true);
      if (storedAdminUser?.name) setAdminName(storedAdminUser.name);
      loadDatabaseData();
    }
    setCheckingAuth(false);
  }, []);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!adminEmailInput.trim() || !adminPasswordInput.trim()) {
      showToast("Please enter both admin email and password.");
      return;
    }

    setAuthenticating(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: adminEmailInput.trim().toLowerCase(),
          password: adminPasswordInput
        })
      });

      const data = await response.json();

      if (response.ok && data?.user) {
        const userId = Number(data.user.id || data.user.user_id);
        const userEmail = String(data.user.email || "").trim().toLowerCase();

        if (userId === 10 && userEmail === "weftin.admin891@gmail.com") {
          // Store in isolated admin keys so storefront user state remains untouched
          localStorage.setItem("weftin_admin_auth", "true");
          if (data.access_token) {
            localStorage.setItem("weftin_admin_token", data.access_token);
          }
          localStorage.setItem("weftin_admin_user", JSON.stringify(data.user));
          
          if (data.user.name) setAdminName(data.user.name);
          setIsAdminAuthenticated(true);
          showToast("Admin session unlocked successfully (ID: 10).");
          loadDatabaseData();
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

  const getAuthHeaders = () => {
    const token = localStorage.getItem("weftin_admin_token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  };

  // Fetch Database Data with proper JWT auth headers
  const loadDatabaseData = useCallback(async () => {
    try {
      setModuleLoading(true);
      const headers = getAuthHeaders();
      
      const ordRes = await fetch(`${API_BASE_URL}/api/admin/orders`, { headers }).catch(() => null);
      if (ordRes && ordRes.ok) {
        const data = await ordRes.json();
        if (Array.isArray(data)) setAdminOrders(data);
      }

      const usrRes = await fetch(`${API_BASE_URL}/api/admin/users`, { headers }).catch(() => null);
      if (usrRes && usrRes.ok) {
        const data = await usrRes.json();
        if (Array.isArray(data)) {
          setAdminCustomers(data);
          if (data.length > 0 && !selectedCustomer) setSelectedCustomer(data[0]);
        }
      }

      const prdRes = await fetch(`${API_BASE_URL}/api/products`, { headers }).catch(() => null);
      if (prdRes && prdRes.ok) {
        const data = await prdRes.json();
        if (Array.isArray(data)) setAdminProducts(data);
      }

      const custOrdRes = await fetch(`${API_BASE_URL}/api/admin/custom-orders`, { headers }).catch(() => null);
      if (custOrdRes && custOrdRes.ok) {
        const data = await custOrdRes.json();
        if (Array.isArray(data)) {
          setAdminCustomOrders(data);
          if (data.length > 0 && !selectedCustomReq) {
            setSelectedCustomReq(data[0]);
            if (data[0].product_price) setOfferPriceInput(String(data[0].product_price));
          }
        }
      }

    } catch (err) {
      console.error("Error loading database data:", err);
    } finally {
      setModuleLoading(false);
    }
  }, [selectedCustomer, selectedCustomReq]);

  useEffect(() => {
    if (!selectedCustomer?.email) {
      setCustomerMeasurements([]);
      return;
    }
    const headers = getAuthHeaders();
    fetch(`${API_BASE_URL}/api/measurements/${encodeURIComponent(selectedCustomer.email)}`, { headers })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCustomerMeasurements(data);
      })
      .catch(() => setCustomerMeasurements([]));
  }, [selectedCustomer]);

  const handleAddProductClick = () => {
    navigate("/admin/add-product");
  };

  const updateOrderStatus = async (order) => {
    const current = String(order.status || "PROCESSING").trim().toUpperCase();
    const next = window.prompt(
      `Set status for ${order.order_number}. Valid values: PENDING, CONFIRMED, TAILORING, IN_PRODUCTION, QUALITY_CHECK, PACKED, READY_TO_SHIP, SHIPPED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED`,
      current
    );
    if (next === null || !next.trim()) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/orders/${order.id}/status`, {
        method: 'PATCH', 
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: next.trim().toUpperCase() })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || 'Could not update order');
      setAdminOrders(currentOrders => currentOrders.map(item => item.id === order.id ? payload.order : item));
      showToast('Order status updated and customer notified.');
    } catch (error) { 
      showToast(error.message || 'Order update failed.'); 
    }
  };

  const assignTailorToOrder = async (order) => {
    const tailorName = window.prompt("Assign Master Tailor/Artisan name for this order:", order.tailor_assigned || "Master Khaja");
    if (!tailorName?.trim()) return;
    try {
      await fetch(`${API_BASE_URL}/api/admin/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: 'TAILORING', tailor_assigned: tailorName.trim() })
      }).catch(() => null);

      setAdminOrders(current => current.map(item => item.id === order.id ? { ...item, tailor_assigned: tailorName.trim(), status: 'TAILORING' } : item));
      showToast(`Assigned ${tailorName.trim()} to order ${order.order_number}. Status updated to TAILORING.`);
    } catch (err) {
      showToast('Failed to assign tailor.');
    }
  };

  // Connected real API function for sending price offer / quotation
  const handleSendPriceOffer = async () => {
  if (!selectedCustomReq?.id) {
    showToast("No custom order selected.");
    return;
  }
  if (!offerPriceInput.trim()) {
    showToast("Please enter a valid offer price first.");
    return;
  }
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/custom-orders/${selectedCustomReq.id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        status: 'Quotation Ready',
        product_price: offerPriceInput.trim()
      })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.detail || 'Failed to send price offer');

    setAdminCustomOrders(curr => curr.map(item => item.id === selectedCustomReq.id ? data : item));
    setSelectedCustomReq(data);
    showToast('Price quote issued and sent to client successfully!');
  } catch (err) {
    showToast(err.message || 'Failed to send price offer.');
  }
};

  
  const printOrderReport = (order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast('Popup blocked. Please allow popups to print report.');
      return;
    }
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Order Report - ${order.order_number}</title>
        <style>
          body { font-family: serif; padding: 30px; color: #111; background: #fff; }
          .header { border-bottom: 2px solid #111; padding-bottom: 15px; display: flex; justify-content: space-between; }
          .logo { font-size: 24px; font-weight: bold; letter-spacing: 0.2em; }
          .details { margin-top: 20px; font-family: sans-serif; font-size: 13px; line-height: 1.6; }
          table { width: 100%; border-collapse: collapse; margin-top: 25px; font-family: sans-serif; font-size: 13px; }
          th, td { border-bottom: 1px solid #ccc; padding: 10px; text-align: left; }
          th { background: #FAF8F5; text-transform: uppercase; font-size: 11px; letter-spacing: 0.1em; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">WEFTIN ATELIER</div>
            <div style="font-size: 10px; font-family: sans-serif; letter-spacing: 0.15em;">OFFICIAL ORDER REPORT</div>
          </div>
          <div style="text-align: right; font-family: sans-serif; font-size: 12px;">
            <strong>Order ID:</strong> ${order.order_number}<br>
            <strong>Date:</strong> ${order.ordered_at ? new Date(order.ordered_at).toLocaleDateString() : 'Recent'}
          </div>
        </div>
        <div class="details">
          <p><strong>Customer Email:</strong> ${order.user_email}</p>
          <p><strong>Fulfillment Status:</strong> ${order.status}</p>
          <p><strong>Assigned Tailor:</strong> ${order.tailor_assigned || 'Unassigned'}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Item / Product</th>
              <th>Quantity</th>
              <th>Size / Shade</th>
              <th>Total Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>${order.product_name}</strong></td>
              <td>${order.quantity || 1}</td>
              <td>${order.size || 'Standard'} / ${order.color || 'Default'}</td>
              <td><strong>₹${Number(order.total_price || 0).toLocaleString()}</strong></td>
            </tr>
          </tbody>
        </table>
        <script>window.print();</script>
      </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleEditProduct = async (product) => {
    const newName = window.prompt("Update Product Name:", product.name);
    if (!newName?.trim()) return;
    const newPrice = window.prompt("Update Price (INR):", product.price);
    if (newPrice === null) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/products/${product.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...product,
          name: newName.trim(),
          price: newPrice.trim()
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to update product');
      setAdminProducts(curr => curr.map(p => p.id === product.id ? data.data : p));
      showToast('Product updated successfully in database.');
    } catch (err) {
      showToast(err.message || 'Product update failed.');
    }
  };

  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Delete product "${product.name}" from database?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/products/${product.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to delete product.');
      }
      setAdminProducts(curr => curr.filter(p => p.id !== product.id));
      showToast('Product removed from catalog.');
    } catch (err) {
      showToast(err.message || 'Failed to delete product.');
    }
  };

  const loadModuleRecords = useCallback(async (moduleKey = activeNav) => {
    if (['dashboard', 'orders', 'customers', 'products', 'custom-orders'].includes(moduleKey)) return;
    setModuleLoading(true);
    setModuleError('');
    try {
      const endpoint = `${API_BASE_URL}/api/admin/records/${encodeURIComponent(moduleKey)}`;
      const response = await fetch(endpoint, { headers: getAuthHeaders() });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || `Could not load ${moduleKey}`);
      setModuleRecords(Array.isArray(payload) ? payload : []);
    } catch (error) {
      setModuleRecords([]);
      setModuleError(error.message || 'Could not load this module.');
    } finally {
      setModuleLoading(false);
    }
  }, [activeNav]);

  useEffect(() => {
    if (!['dashboard', 'orders', 'customers', 'products', 'custom-orders'].includes(activeNav)) {
      loadModuleRecords(activeNav);
    }
  }, [activeNav, loadModuleRecords]);

  const createModuleRecord = async () => {
    const name = window.prompt("Enter a name for this record:");
    if (!name?.trim()) return;
    const description = window.prompt('Description (optional):') || '';
    const status = window.prompt('Status (default: Active):', 'Active') || 'Active';
    setRecordSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/records/${encodeURIComponent(activeNav)}`, {
        method: 'POST', 
        headers: getAuthHeaders(),
        body: JSON.stringify({ name: name.trim(), description, status })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || 'Could not create record');
      setModuleRecords(current => [payload, ...current]);
      showToast('Record saved to the database.');
    } catch (error) { 
      showToast(error.message || 'Save failed.'); 
    } finally { 
      setRecordSaving(false); 
    }
  };

  const createPromoCodeRecord = async () => {
    if (!newPromoCode.trim()) {
      showToast('Please enter a voucher code.');
      return;
    }
    setRecordSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/records/discount-codes`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: newPromoCode.trim().toUpperCase(),
          description: newPromoDesc.trim() || `Value: ${newPromoValue || 'Promotional Voucher'}`,
          status: 'Active'
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || 'Could not generate voucher');
      showToast(`Active coupon ${newPromoCode.toUpperCase()} saved to database.`);
      setNewPromoCode('');
      setNewPromoValue('');
      setNewPromoDesc('');
      loadModuleRecords('discount-codes');
    } catch (err) {
      showToast(err.message || 'Failed to generate voucher.');
    } finally {
      setRecordSaving(false);
    }
  };

  const editModuleRecord = async (record) => {
    if (activeNav === 'custom-orders') {
      const status = window.prompt('Update custom order status:', record.status || 'Pending Review');
      if (status === null || !status.trim()) return;
      const message = window.prompt('Update message (optional):', record.message || '');
      if (message === null) return;
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/custom-orders/${record.id}`, {
          method: 'PATCH', 
          headers: getAuthHeaders(),
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
    const description = window.prompt('Update description:', record.description || '');
    if (description === null) return;
    const status = window.prompt('Update status:', record.status || 'Active');
    if (status === null) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/records/${encodeURIComponent(activeNav)}/${record.id}`, {
        method: 'PUT', 
        headers: getAuthHeaders(),
        body: JSON.stringify({ name: name.trim(), description, status })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || 'Could not update record');
      if (activeNav === 'discount-codes') {
        loadModuleRecords('discount-codes');
      } else {
        setModuleRecords(current => current.map(item => item.id === record.id ? payload : item));
      }
      showToast('Record updated.');
    } catch (error) { showToast(error.message || 'Update failed.'); }
  };

  const deleteModuleRecord = async (record) => {
    if (!window.confirm(`Delete "${record.name || 'this record'}"? This cannot be undone.`)) return;
    try {
      const endpoint = activeNav === 'custom-orders'
        ? `${API_BASE_URL}/api/admin/custom-orders/${record.id}`
        : `${API_BASE_URL}/api/admin/records/${encodeURIComponent(activeNav)}/${record.id}`;
      const response = await fetch(endpoint, { method: 'DELETE', headers: getAuthHeaders() });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || 'Could not delete record');
      if (activeNav === 'custom-orders') {
        setAdminCustomOrders(current => current.filter(item => item.id !== record.id));
      } else if (activeNav === 'discount-codes') {
        loadModuleRecords('discount-codes');
      } else {
        setModuleRecords(current => current.filter(item => item.id !== record.id));
      }
      showToast('Record deleted.');
    } catch (error) { showToast(error.message || 'Delete failed.'); }
  };

  useEffect(() => {
    if (activeNav === 'discount-codes') {
      loadModuleRecords('discount-codes');
    }
  }, [activeNav, loadModuleRecords]);

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
  }, 0);

  const chartFilteredOrders = adminOrders.filter(ord => {
    if (!ord.ordered_at) return true;
    const orderDate = new Date(ord.ordered_at);
    const now = new Date();
    const diffTime = Math.abs(now - orderDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (salesTimeframe === 'WEEKLY') {
      return diffDays <= 7;
    } else {
      return diffDays <= 30;
    }
  });

  const chartTotalRevenue = chartFilteredOrders.reduce((sum, ord) => sum + (Number(ord.total_price) || 0), 0);
  const chartTotalOrders = chartFilteredOrders.length;
  const chartAvgOrderValue = chartTotalOrders > 0 ? Math.round(chartTotalRevenue / chartTotalOrders) : 0;

  const pendingOrdersCount = adminOrders.filter(ord => String(ord.status || "").trim().toUpperCase() === 'PROCESSING').length;
  const lowStockCount = adminProducts.filter(p => !p.in_stock).length;

  const normalizeStatus = (status) => String(status || "PROCESSING").trim().toUpperCase();

  const getStatusLabel = (status) => {
    const normalized = normalizeStatus(status);
    const labels = {
      PROCESSING: "PROCESSING",
      CONFIRMED: "CONFIRMED",
      TAILORING: "TAILORING",
      IN_PRODUCTION: "IN PRODUCTION",
      QUALITY_CHECK: "QUALITY CHECK",
      PACKED: "PACKED",
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
      case "TAILORING":
      case "IN_PRODUCTION": return "bg-purple-100 text-purple-800";
      case "QUALITY_CHECK": return "bg-indigo-100 text-indigo-800";
      case "PACKED": return "bg-teal-100 text-teal-800";
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
      subtitle: 'Clients waiting for out-of-stock luxury fabrics and limited editions.'
    },
    categories: {
      title: 'Catalogue Categories',
      subtitle: 'Organize collections, seasonal lookbooks, and product classifications.'
    },
    customizations: {
      title: 'Bespoke Customizations',
      subtitle: 'Define measurement parameters, monogramming styles, and fabric add-ons.'
    },
    vendors: {
      title: 'Atelier Vendors & Suppliers',
      subtitle: 'Fabric mills, handloom weavers, and raw material partners.'
    },
    tailors: {
      title: 'Master Tailors & Artisans',
      subtitle: 'In-house and contracted master craftsmen assigned to bespoke orders.'
    },
    inventory: {
      title: 'Atelier Inventory & Stock',
      subtitle: 'Live stock tracking for silks, velvets, threads, and packaging.'
    },
    expenses: {
      title: 'Expenses Management',
      subtitle: 'Track atelier operating costs, raw material procurement, and overheads.'
    },
    analytics: {
      title: 'Business Analytics & Reports',
      subtitle: 'Deep-dive metrics into high-performing garments and customer acquisition.'
    },
    shipping: {
      title: 'Shipping & Logistics',
      subtitle: 'Dispatch partners, local courier tracking, and insured transit logs.'
    },
    seo: {
      title: 'SEO & Metadata Management',
      subtitle: 'Manage search engine descriptions, keywords, and OpenGraph sharing tags.'
    },
    settings: {
      title: 'Atelier Settings',
      subtitle: 'Configure store preferences, taxes, staff permissions, and currency.'
    }
  };

  // ---------------------------------------------------------
  // LOADING / CHECKING AUTH STATE
  // ---------------------------------------------------------
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 mx-auto text-amber-700 animate-spin mb-3" />
          <p className="text-xs uppercase tracking-widest text-gray-500">Verifying administrator credentials...</p>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // ADMIN CREDENTIAL GATE MODAL (IF NOT AUTHENTICATED)
  // ---------------------------------------------------------
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] text-gray-900 font-sans flex items-center justify-center p-4 sm:p-6 relative">
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-[100] bg-gray-900 text-white px-6 py-3 rounded-lg shadow-2xl text-sm flex items-center gap-3 border border-amber-500/30">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            {toastMessage}
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-10 max-w-md w-full">
          <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-200">
            <Lock className="w-6 h-6" />
          </div>

          <h2 className="font-serif text-2xl font-light text-center text-gray-900 mb-1">Admin Dashboard Security</h2>
          <p className="text-xs text-gray-500 text-center mb-8 leading-relaxed">
            Please enter admin credentials (ID: 10) to access the Atelier Workspace.
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
                  Unlock Admin Dashboard
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/dashboard"
              className="text-xs text-gray-500 hover:text-black underline"
            >
              Return to Member Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const renderSidebarContent = (isCollapsed = false) => (
    <div className="flex flex-col justify-between h-full">
      <div>
        <div className="h-20 flex items-center justify-between px-6 border-b border-[#EFECE6]">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => { setActiveNav('dashboard'); setMobileSidebarOpen(false); }}>
            <div className="w-9 h-9 rounded-full bg-[#1C1A17] flex items-center justify-center font-bold text-white text-lg tracking-widest shadow-md font-serif">W</div>
            {!isCollapsed && <span className="font-serif tracking-widest text-xl font-bold text-[#1C1A17]">WEFT IN</span>}
          </div>
          {!isCollapsed && (
            <button onClick={() => setIsSidebarCollapsed(true)} className="hidden md:block text-[#78716C] hover:text-[#1C1A17] transition">
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          {isCollapsed && (
            <button onClick={() => setIsSidebarCollapsed(false)} className="hidden md:block text-[#78716C] hover:text-[#1C1A17] transition mx-auto">
              <ChevronLeft className="w-4 h-4 rotate-180" />
            </button>
          )}
          <button onClick={() => setMobileSidebarOpen(false)} className="md:hidden text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 py-6 space-y-6 overflow-y-auto max-h-[calc(100vh-220px)]">
          <div onClick={() => { setActiveNav('dashboard'); setMobileSidebarOpen(false); }} className={`flex items-center px-4 py-3 rounded-xl cursor-pointer transition ${activeNav === 'dashboard' ? 'bg-[#1C1A17] text-white font-semibold shadow-sm' : 'text-[#78716C] hover:bg-[#F3EFEA]'}`}>
            <LayoutDashboard className="w-5 h-5 mr-3 flex-shrink-0" />
            {!isCollapsed && <span className="text-sm">Dashboard</span>}
          </div>

          {/* Sales Group */}
          <div>
            {!isCollapsed && <p className="px-4 text-[11px] font-semibold tracking-wider text-[#B89768] uppercase mb-2">Sales</p>}
            <div className="space-y-1">
              {[
                { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: adminOrders.length > 0 ? String(adminOrders.length) : null },
                { id: 'customers', label: 'Customers', icon: Users, badge: adminCustomers.length > 0 ? String(adminCustomers.length) : null },
                { id: 'discount-codes', label: 'Discount Codes', icon: Tag },
                { id: 'stock-interest', label: 'Stock Interest', icon: Bell },
                { id: 'custom-orders', label: 'Custom Orders', icon: Scissors, badge: adminCustomOrders.length > 0 ? String(adminCustomOrders.length) : null }
              ].map(item => {
                const Icon = item.icon;
                const isActive = activeNav === item.id;
                return (
                  <div key={item.id} onClick={() => { setActiveNav(item.id); setMobileSidebarOpen(false); }} className={`flex items-center justify-between px-4 py-2.5 rounded-xl cursor-pointer transition ${isActive ? 'bg-[#1C1A17] text-white font-semibold shadow-sm' : 'text-[#78716C] hover:bg-[#F3EFEA]'}`}>
                    <div className="flex items-center">
                      <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                      {!isCollapsed && <span className="text-sm">{item.label}</span>}
                    </div>
                    {!isCollapsed && item.badge && (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-[#B89768] text-black' : 'bg-amber-100 text-amber-800'}`}>{item.badge}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Catalogue Group */}
          <div>
            {!isCollapsed && <p className="px-4 text-[11px] font-semibold tracking-wider text-[#B89768] uppercase mb-2">Catalogue</p>}
            <div className="space-y-1">
              {[
                { id: 'products', label: 'Products', icon: Shirt },
                { id: 'categories', label: 'Categories', icon: Layers },
                { id: 'customizations', label: 'Customizations', icon: Sliders }
              ].map(item => {
                const Icon = item.icon;
                const isActive = activeNav === item.id;
                return (
                  <div key={item.id} onClick={() => { setActiveNav(item.id); setMobileSidebarOpen(false); }} className={`flex items-center px-4 py-2.5 rounded-xl cursor-pointer transition ${isActive ? 'bg-[#1C1A17] text-white font-semibold shadow-sm' : 'text-[#78716C] hover:bg-[#F3EFEA]'}`}>
                    <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                    {!isCollapsed && <span className="text-sm">{item.label}</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Production Group */}
          <div>
            {!isCollapsed && <p className="px-4 text-[11px] font-semibold tracking-wider text-[#B89768] uppercase mb-2">Production</p>}
            <div className="space-y-1">
              {[
                { id: 'vendors', label: 'Vendors', icon: Truck },
                { id: 'tailors', label: 'Tailors', icon: UsersRound },
                { id: 'inventory', label: 'Inventory', icon: Boxes }
              ].map(item => {
                const Icon = item.icon;
                const isActive = activeNav === item.id;
                return (
                  <div key={item.id} onClick={() => { setActiveNav(item.id); setMobileSidebarOpen(false); }} className={`flex items-center px-4 py-2.5 rounded-xl cursor-pointer transition ${isActive ? 'bg-[#1C1A17] text-white font-semibold shadow-sm' : 'text-[#78716C] hover:bg-[#F3EFEA]'}`}>
                    <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                    {!isCollapsed && <span className="text-sm">{item.label}</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Finance Group */}
          <div>
            {!isCollapsed && <p className="px-4 text-[11px] font-semibold tracking-wider text-[#B89768] uppercase mb-2">Finance</p>}
            <div className="space-y-1">
              {[
                { id: 'expenses', label: 'Expenses', icon: DollarSign },
                { id: 'analytics', label: 'Analytics', icon: BarChart2 }
              ].map(item => {
                const Icon = item.icon;
                const isActive = activeNav === item.id;
                return (
                  <div key={item.id} onClick={() => { setActiveNav(item.id); setMobileSidebarOpen(false); }} className={`flex items-center px-4 py-2.5 rounded-xl cursor-pointer transition ${isActive ? 'bg-[#1C1A17] text-white font-semibold shadow-sm' : 'text-[#78716C] hover:bg-[#F3EFEA]'}`}>
                    <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                    {!isCollapsed && <span className="text-sm">{item.label}</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Config Group */}
          <div>
            {!isCollapsed && <p className="px-4 text-[11px] font-semibold tracking-wider text-[#B89768] uppercase mb-2">Config</p>}
            <div className="space-y-1">
              {[
                { id: 'shipping', label: 'Shipping', icon: Truck },
                { id: 'seo', label: 'SEO', icon: Globe },
                { id: 'settings', label: 'Settings', icon: Settings }
              ].map(item => {
                const Icon = item.icon;
                const isActive = activeNav === item.id;
                return (
                  <div key={item.id} onClick={() => { setActiveNav(item.id); setMobileSidebarOpen(false); }} className={`flex items-center px-4 py-2.5 rounded-xl cursor-pointer transition ${isActive ? 'bg-[#1C1A17] text-white font-semibold shadow-sm' : 'text-[#78716C] hover:bg-[#F3EFEA]'}`}>
                    <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                    {!isCollapsed && <span className="text-sm">{item.label}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-[#EFECE6] bg-[#F3EFEA] flex flex-col gap-2">
        <button
          onClick={() => {
            localStorage.removeItem("weftin_admin_auth");
            localStorage.removeItem("weftin_admin_token");
            localStorage.removeItem("weftin_admin_user");
            setIsAdminAuthenticated(false);
            showToast("Locked admin session.");
          }}
          className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold py-2.5 px-3 rounded-xl border border-rose-200 transition flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
        >
          <span>Lock Admin Session</span>
        </button>
        <Link to="/" className="w-full bg-white hover:bg-[#1C1A17] text-[#1C1A17] hover:text-white text-xs font-semibold py-2.5 px-3 rounded-xl border border-[#EFECE6] transition flex items-center justify-center space-x-2 shadow-sm">
          <ChevronLeft className="w-3.5 h-3.5" />
          {!isCollapsed && <span>VIEW STOREFRONT</span>}
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAF8F5] font-sans text-[#1C1A17] select-none relative">
      
      {/* DESKTOP SIDEBAR */}
      <aside className={`hidden md:flex ${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-[#FAF8F5] border-r border-[#EFECE6] text-[#1C1A17] flex-col transition-all duration-300 z-30 flex-shrink-0`}>
        {renderSidebarContent(isSidebarCollapsed)}
      </aside>

      {/* MOBILE SIDEBAR SLIDE-OVER */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)}></div>
          <div className="relative w-72 bg-[#FAF8F5] h-full shadow-2xl flex flex-col z-10">
            {renderSidebarContent(false)}
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex flex-col h-full overflow-hidden w-full">
        
        {/* TOP HEADER */}
        <header className="h-20 bg-white border-b border-[#EFECE6] flex items-center justify-between px-4 sm:px-8 flex-shrink-0 z-20">
          <div className="flex items-center space-x-3">
            <button onClick={() => setMobileSidebarOpen(true)} className="md:hidden p-2 rounded-xl bg-[#FAF8F5] border border-[#EFECE6] text-gray-800">
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-serif text-base sm:text-lg font-bold text-[#1C1A17] truncate max-w-[180px] sm:max-w-none">WEFTIN Atelier Workspace</h1>
              <div className="hidden sm:flex items-center space-x-2 text-xs text-[#78716C] mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-[#B89768]" />
                <span className="font-medium text-[#1C1A17]">{currentDateFormatted || "June 15, 2026"}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4">
            <button onClick={() => showToast('Bespoke Control Console session active.')} className="hidden lg:flex bg-[#FAF8F5] hover:bg-[#F3EFEA] text-[#1C1A17] text-xs font-semibold px-4 py-2 rounded-full border border-[#EFECE6]">
              Bespoke Control Console
            </button>

            {/* Notifications Toggle */}
            <div className="relative">
              <button onClick={() => { setNotificationOpen(!notificationOpen); setUserDropdownOpen(false); }} className="relative w-10 h-10 rounded-full bg-[#FAF8F5] hover:bg-[#F3EFEA] flex items-center justify-center border border-[#EFECE6]">
                <Bell className="w-4 h-4 text-[#1C1A17]" />
                {notifications.some(n => !n.read) && <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>}
              </button>

              {notificationOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-[#EFECE6] p-4 z-50 text-xs">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100 mb-3">
                    <span className="font-bold uppercase tracking-wider text-gray-800">Atelier Notifications</span>
                    <button onClick={() => setNotifications(notifications.map(n => ({...n, read: true})))} className="text-[10px] text-[#B89768] hover:underline font-semibold">Mark all read</button>
                  </div>
                  <div className="space-y-2.5 max-h-64 overflow-y-auto">
                    {notifications.map(n => (
                      <div key={n.id} className={`p-3 rounded-xl border transition ${n.read ? 'bg-white border-gray-100 text-gray-600' : 'bg-amber-50/60 border-amber-200 text-gray-900 font-medium'}`}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-xs">{n.title}</span>
                          <span className="text-[10px] text-gray-400">{n.time}</span>
                        </div>
                        <p className="text-[11px] leading-snug text-gray-600">{n.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button onClick={() => { setUserDropdownOpen(!userDropdownOpen); setNotificationOpen(false); }} className="flex items-center space-x-2 bg-[#FAF8F5] hover:bg-[#F3EFEA] px-3 py-1.5 rounded-full border border-[#EFECE6] text-xs font-semibold">
                <span className="w-7 h-7 rounded-full bg-[#1C1A17] text-white flex items-center justify-center font-bold text-xs">
                  {adminName.charAt(0)}
                </span>
                <span className="hidden sm:inline">{adminName}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#78716C]" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-[#EFECE6] p-2 z-50 text-xs space-y-1">
                  <div className="px-3 py-2 border-b border-gray-100 mb-1">
                    <p className="font-bold text-gray-900">{adminName}</p>
                    <p className="text-[10px] text-[#B89768] font-mono">ID: 10 (Authorized Admin)</p>
                  </div>
                  <button onClick={() => { setUserDropdownOpen(false); setProfileModalOpen(true); }} className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#FAF8F5] font-medium flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-gray-500" /> Edit Admin Profile
                  </button>
                  <button onClick={() => { setUserDropdownOpen(false); setActiveNav('settings'); }} className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#FAF8F5] font-medium flex items-center gap-2">
                    <Settings className="w-3.5 h-3.5 text-gray-500" /> Atelier Settings
                  </button>
                  <div className="border-t border-gray-100 pt-1 mt-1"></div>
                  <button onClick={() => { 
                    setUserDropdownOpen(false); 
                    localStorage.removeItem("weftin_admin_auth"); 
                    localStorage.removeItem("weftin_admin_token");
                    localStorage.removeItem("weftin_admin_user");
                    setIsAdminAuthenticated(false); 
                    showToast('Admin session secured.'); 
                  }} className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-700 font-medium flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-rose-600" /> Lock Admin Session
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* WORKSPACE CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8">

          {activeNav === 'dashboard' ? (
            /* ================= DASHBOARD VIEW ================= */
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1A17]">Dashboard</h2>
                  <p className="text-xs sm:text-sm text-[#78716C] mt-1">Track sales, operations, and atelier workflow at a glance.</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <select 
                      value={dashboardPeriod}
                      onChange={(e) => setDashboardPeriod(e.target.value)}
                      className="bg-white border border-[#EFECE6] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-[#1C1A17] focus:outline-none focus:border-[#B89768] shadow-sm pr-8"
                    >
                      <option>This Month</option>
                      <option>Last Month</option>
                      <option>Year to Date</option>
                    </select>
                  </div>
                  <button onClick={handleAddProductClick} className="bg-[#1C1A17] hover:bg-black text-white px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-md flex items-center space-x-2 transition">
                    <Plus className="w-4 h-4" />
                    <span>ADD PRODUCT</span>
                  </button>
                </div>
              </div>

              {/* Action Banner */}
              <div className="bg-white rounded-2xl border border-[#EFECE6] p-6 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 flex-shrink-0">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#1C1A17]">12 orders need action today</h3>
                    <p className="text-xs text-[#78716C] mt-0.5">Urgent custom stitches lack artisan allocation and standard bounds require verification.</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-[#1C1A17]">
                  <div className="text-center"><span className="text-base font-bold block">5</span> Artisan Allocation</div>
                  <div className="hidden sm:block h-8 w-px bg-[#EFECE6]"></div>
                  <div className="text-center"><span className="text-base font-bold block">4</span> Bounds Verify</div>
                  <div className="hidden sm:block h-8 w-px bg-[#EFECE6]"></div>
                  <div className="text-center"><span className="text-base font-bold block text-rose-600">3</span> Urgent Due</div>
                  <button onClick={() => setActiveNav('custom-orders')} className="bg-[#B89768] hover:bg-[#a68559] text-black px-6 py-3 rounded-xl text-xs font-bold tracking-wider shadow-sm transition">
                    REVIEW NOW
                  </button>
                </div>
              </div>

              {/* 4 Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl border border-[#EFECE6] p-6 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-center"><span className="text-xs font-bold uppercase tracking-wider text-[#78716C]">REVENUE ({dashboardPeriod})</span><BarChart2 className="w-4 h-4 text-[#B89768]" /></div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1A17] my-3">{formatPrice(totalRevenueNumber)}</h3>
                  <div className="space-y-2">
                    <p className="text-xs text-emerald-600 font-semibold flex items-center"><TrendingUp className="w-3.5 h-3.5 mr-1" /> +18% from last month</p>
                    <div className="flex justify-between text-[11px] text-[#78716C]"><span>Target ₹5.5L</span><span>87%</span></div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden"><div className="bg-[#B89768] h-full w-[87%]"></div></div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-[#EFECE6] p-6 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-center"><span className="text-xs font-bold uppercase tracking-wider text-[#78716C]">ORDERS</span><ShoppingBag className="w-4 h-4 text-[#B89768]" /></div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1A17] my-3">{adminOrders.length}</h3>
                  <div className="space-y-2">
                    <p className="text-xs text-emerald-600 font-semibold flex items-center"><TrendingUp className="w-3.5 h-3.5 mr-1" /> +12% from last month</p>
                    <div className="flex justify-between text-[11px] text-[#78716C]"><span>Completed {adminOrders.filter(o => normalizeStatus(o.status) === 'DELIVERED').length}</span><span>88%</span></div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden"><div className="bg-[#B89768] h-full w-[88%]"></div></div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-[#EFECE6] p-6 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-center"><span className="text-xs font-bold uppercase tracking-wider text-[#78716C]">PENDING ORDERS</span><Clock className="w-4 h-4 text-amber-700" /></div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1A17] my-3">{pendingOrdersCount}</h3>
                  <p className="text-xs text-amber-700 font-semibold flex items-center mt-1"><AlertTriangle className="w-3.5 h-3.5 mr-1" /> Requires custom handling</p>
                  <div className="pt-2 border-t border-[#EFECE6] flex justify-between text-xs"><span className="text-[#78716C]">Status</span><span className="font-bold text-amber-800">High priority</span></div>
                </div>

                <div className="bg-white rounded-2xl border border-[#EFECE6] p-6 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-center"><span className="text-xs font-bold uppercase tracking-wider text-[#78716C]">LOW STOCK</span><Boxes className="w-4 h-4 text-orange-600" /></div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1A17] my-3">{lowStockCount}</h3>
                  <p className="text-xs text-orange-600 font-semibold flex items-center mt-1"><AlertTriangle className="w-3.5 h-3.5 mr-1" /> Needs immediate replenishment</p>
                  <div className="pt-2 border-t border-[#EFECE6] flex justify-between text-xs"><span className="text-[#78716C]">Status</span><span className="font-bold text-orange-700">Out of stock risk</span></div>
                </div>
              </div>

              {/* Lookbook Section */}
              <div className="bg-white rounded-2xl border border-[#EFECE6] p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] flex items-center justify-center text-[#B89768]">
                      <Shirt className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg sm:text-xl font-bold text-[#1C1A17]">Seasonal Atelier Lookbook & Active Workloads</h3>
                      <p className="text-xs text-[#78716C]">High-fashion visual identity catalogs showing active artisan allocations.</p>
                    </div>
                  </div>
                  <button onClick={() => setActiveNav('products')} className="text-xs font-bold text-[#B89768] hover:underline self-start sm:self-auto">
                    MANAGE CATALOG IMAGES →
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {(adminProducts.length > 0 ? adminProducts.slice(0, 3) : [
                    { name: "Royal Heritage '26 Collection", category: 'Bridal Wear', price: '48,500', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800', tag: 'BEST SELLER' },
                    { name: "Mughal Garden '26 Collection", category: 'Velvet Lehenga', price: '1,85,000', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800', tag: 'LIMITED EDITION' },
                    { name: "Kashmir Meadows '26", category: 'Silk Kurti', price: '24,000', image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800', tag: 'NEW ARRIVAL' }
                  ]).map((prod, i) => (
                    <div key={prod.id || i} className="rounded-2xl border border-[#EFECE6] overflow-hidden bg-[#FAF8F5] flex flex-col shadow-sm">
                      <div className="relative h-56 sm:h-64 overflow-hidden bg-gray-100">
                        <img src={prod.image || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800'} alt={prod.name} className="w-full h-full object-cover" />
                        <span className="absolute top-4 left-4 bg-white text-black text-[10px] font-bold px-3 py-1 rounded-md uppercase tracking-wider">{prod.tag || 'ATELIER EXCLUSIVE'}</span>
                      </div>
                      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <h4 className="font-serif text-lg font-bold text-[#1C1A17]">{prod.name}</h4>
                          <p className="text-xs text-[#78716C] mt-1">Category: {prod.category} | Price: {formatPrice(prod.price)}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#EFECE6] text-center">
                          <div className="bg-white p-2.5 rounded-xl border border-[#EFECE6]">
                            <span className="text-[10px] uppercase font-bold text-[#78716C] block">Active Slots</span>
                            <span className="font-serif font-bold text-sm text-[#1C1A17]">{prod.in_stock ? 'In Stock' : 'Low Stock'}</span>
                          </div>
                          <div className="bg-white p-2.5 rounded-xl border border-[#EFECE6]">
                            <span className="text-[10px] uppercase font-bold text-[#78716C] block">Atelier Speed</span>
                            <span className="font-serif font-bold text-sm text-[#B89768]">14-18 Days</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sales Overview & Custom Order Progress */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-[#EFECE6] p-6 sm:p-8 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-serif text-xl font-bold text-[#1C1A17]">Sales Overview</h3>
                      <p className="text-xs text-[#78716C]">Revenue and orders performance overview based on live database data</p>
                    </div>
                    <div className="flex bg-[#FAF8F5] border border-[#EFECE6] rounded-xl p-1 text-xs self-start sm:self-auto">
                      <button 
                        onClick={() => setSalesTimeframe('WEEKLY')} 
                        className={`px-3 py-1.5 rounded-lg font-semibold transition ${salesTimeframe === 'WEEKLY' ? 'bg-[#1C1A17] text-white' : 'text-[#78716C] hover:text-black'}`}
                      >
                        WEEKLY
                      </button>
                      <button 
                        onClick={() => setSalesTimeframe('MONTHLY')} 
                        className={`px-3 py-1.5 rounded-lg font-semibold transition ${salesTimeframe === 'MONTHLY' ? 'bg-[#1C1A17] text-white' : 'text-[#78716C] hover:text-black'}`}
                      >
                        MONTHLY
                      </button>
                    </div>
                  </div>

                  {/* Interactive Dynamic Growing Graph */}
                  <div className="h-64 bg-[#FAF8F5] rounded-xl border border-[#EFECE6] flex flex-col justify-between p-6 relative overflow-hidden">
                    <div className="flex justify-between items-center text-xs text-[#78716C]">
                      <span>REVENUE VELOCITY ({salesTimeframe})</span>
                      <span className="font-bold text-[#1C1A17]">{salesTimeframe === 'WEEKLY' ? 'Past 7 Days' : 'Past 30 Days'}</span>
                    </div>

                    <div className="flex items-end justify-between gap-2 sm:gap-3 h-36 px-2 sm:px-4 pt-6 border-b border-[#EFECE6]">
                      {[35, 55, 45, 75, 60, 90, 85].map((val, idx) => {
                        const maxVal = salesTimeframe === 'WEEKLY' ? 200000 : 800000;
                        const barHeight = chartTotalRevenue > 0 
                          ? Math.min(100, Math.max(15, Math.round((chartTotalRevenue / maxVal) * val)))
                          : val;
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                            <div className="absolute -top-8 bg-[#1C1A17] text-white text-[9px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10 shadow-md">
                              {formatPrice(Math.round((chartTotalRevenue / 7) * (val / 60)))}
                            </div>
                            <div style={{ height: `${barHeight}%` }} className="w-full bg-[#B89768] rounded-t-lg transition-all duration-500 hover:bg-black"></div>
                            <span className="text-[10px] text-[#78716C] font-mono">{salesTimeframe === 'WEEKLY' ? `D${idx+1}` : `W${idx+1}`}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#78716C]">Live Ledger Total</span>
                      <span className="font-serif font-bold text-sm text-[#1C1A17]">{formatPrice(chartTotalRevenue)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#EFECE6]">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#78716C]">TOTAL REVENUE</span>
                      <p className="font-serif text-xl sm:text-2xl font-bold text-[#1C1A17] mt-1">{formatPrice(chartTotalRevenue)} <span className="text-xs text-emerald-600 font-semibold">+18%</span></p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#78716C]">TOTAL ORDERS</span>
                      <p className="font-serif text-xl sm:text-2xl font-bold text-[#1C1A17] mt-1">{chartTotalOrders} <span className="text-xs text-emerald-600 font-semibold">+12%</span></p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#78716C]">AVG ORDER VALUE</span>
                      <p className="font-serif text-xl sm:text-2xl font-bold text-[#1C1A17] mt-1">{formatPrice(chartAvgOrderValue)} <span className="text-xs text-emerald-600 font-semibold">+6%</span></p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-[#EFECE6] p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-6">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif text-xl font-bold text-[#1C1A17]">Custom Order Progress</h3>
                      <button onClick={() => setActiveNav('custom-orders')} className="text-xs font-bold text-[#B89768] hover:underline">VIEW ALL →</button>
                    </div>
                    <p className="text-xs text-[#78716C] mt-1">Track live atelier orders from request to dispatch.</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-amber-50 text-amber-800 rounded-full text-xs font-bold border border-amber-200">Active Custom Orders: {adminCustomOrders.length}</span>
                  </div>

                  <div className="space-y-4 py-4">
                    {[
                      { step: '01', label: 'Requests Received', count: adminCustomOrders.length, pct: '100%' },
                      { step: '02', label: 'Quotation', count: Math.round(adminCustomOrders.length * 0.7), pct: '70%' },
                      { step: '03', label: 'Tailor Assigned', count: Math.round(adminCustomOrders.length * 0.5), pct: '50%' },
                      { step: '04', label: 'Production', count: Math.round(adminCustomOrders.length * 0.3), pct: '30%' }
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

                  <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-amber-900 font-semibold text-center sm:text-left">Custom orders need review.</p>
                    <button onClick={() => setActiveNav('custom-orders')} className="bg-[#1C1A17] text-white text-[11px] font-bold px-4 py-2 rounded-xl whitespace-nowrap">PRODUCTION BOARD</button>
                  </div>
                </div>
              </div>
            </div>

          ) : activeNav === 'orders' ? (
            /* ================= ORDERS MODULE ================= */
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1A17]">Orders Management</h2>
                  <p className="text-xs sm:text-sm text-[#78716C] mt-1">Live customer purchase orders, artisan assignments, and print reports.</p>
                </div>
                <button onClick={loadDatabaseData} className="bg-white border border-[#EFECE6] px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center self-start sm:self-auto">
                  <RefreshCw className="w-3.5 h-3.5 mr-2 text-[#B89768]" /> Refresh
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-[#EFECE6] p-4 sm:p-8 shadow-sm space-y-6">
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
                  <div className="flex bg-[#FAF8F5] border border-[#EFECE6] rounded-xl p-1 text-xs overflow-x-auto w-full md:w-auto">
                    {['All', 'Active', 'Delivered', 'Cancelled'].map(tab => (
                      <button key={tab} onClick={() => setOrderStatusFilter(tab)} className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap flex-1 md:flex-initial text-center ${orderStatusFilter === tab ? 'bg-[#1C1A17] text-white' : 'text-[#78716C]'}`}>
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[750px]">
                    <thead>
                      <tr className="border-b border-[#EFECE6] text-[11px] font-bold text-[#78716C] uppercase">
                        <th className="py-3 px-3">Order ID</th>
                        <th className="py-3 px-3">Customer Email</th>
                        <th className="py-3 px-3">Product Item</th>
                        <th className="py-3 px-3">Total Amount</th>
                        <th className="py-3 px-3">Assigned Tailor</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFECE6] text-sm">
                      {filteredLiveOrders.map(ord => (
                        <tr key={ord.id} className="hover:bg-[#FAF8F5]">
                          <td className="py-4 px-3 font-mono font-bold text-xs">{ord.order_number}</td>
                          <td className="py-4 px-3 text-[#78716C] text-xs">{ord.user_email}</td>
                          <td className="py-4 px-3 font-medium">{ord.product_name}</td>
                          <td className="py-4 px-3 font-semibold">{formatPrice(ord.total_price)}</td>
                          <td className="py-4 px-3 text-xs text-[#78716C]">
                            <span className="font-semibold text-[#1C1A17]">{ord.tailor_assigned || 'Unassigned'}</span>
                          </td>
                          <td className="py-4 px-3">
                            <span className={`px-2.5 py-1 rounded text-[9px] uppercase font-bold ${getStatusStyle(ord.status)}`}>
                              {getStatusLabel(ord.status)}
                            </span>
                          </td>
                          <td className="py-4 px-3 whitespace-nowrap space-x-2">
                            <button onClick={() => updateOrderStatus(ord)} className="bg-black hover:bg-[#B89768] text-white text-[11px] px-3 py-1.5 rounded-lg font-bold">
                              Status
                            </button>
                            <button onClick={() => assignTailorToOrder(ord)} className="bg-amber-100 text-amber-900 hover:bg-amber-200 text-[11px] px-3 py-1.5 rounded-lg font-bold">
                              Tailor
                            </button>
                            <button onClick={() => printOrderReport(ord)} className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-[11px] px-3 py-1.5 rounded-lg font-bold inline-flex items-center gap-1">
                              <Printer className="w-3 h-3" /> Print
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredLiveOrders.length === 0 && (
                        <tr><td colSpan="7" className="py-12 text-center text-[#78716C]">No orders found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          ) : activeNav === 'customers' ? (
            /* ================= CUSTOMERS DIRECTORY ================= */
            <div className="space-y-8">
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1A17]">Customers Directory</h2>
                <p className="text-xs sm:text-sm text-[#78716C] mt-1">Registered bespoke patrons, VIP clients, and live database measurement profiles.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-[#EFECE6] p-4 sm:p-6 shadow-sm space-y-4">
                  <div className="hidden sm:flex items-center justify-between pb-4 border-b border-[#EFECE6] text-[10px] font-bold text-[#78716C] uppercase tracking-wider">
                    <span>Client Detail</span>
                    <span>Client Tier</span>
                    <span>Registered Date</span>
                    <span>Action</span>
                  </div>
                  {adminCustomers.map(cust => (
                    <div key={cust.id} onClick={() => setSelectedCustomer(cust)} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 py-3.5 px-3 border-b border-gray-100 hover:bg-[#FAF8F5] rounded-xl cursor-pointer transition ${selectedCustomer?.id === cust.id ? 'bg-[#FAF8F5] sm:border-l-4 sm:border-l-[#B89768]' : ''}`}>
                      <div>
                        <p className="font-bold text-sm text-[#1C1A17]">{cust.name}</p>
                        <p className="text-xs text-[#78716C] truncate max-w-[240px]">{cust.phone || 'Phone not provided'} | {cust.email}</p>
                      </div>
                      <div className="flex items-center justify-between sm:justify-start gap-4">
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-900">
                          Patron
                        </span>
                        <span className="text-xs text-[#78716C]">{cust.created_at ? new Date(cust.created_at).toLocaleDateString() : '—'}</span>
                        <span className="text-xs font-bold text-[#B89768] hover:underline flex items-center">
                          Select →
                        </span>
                      </div>
                    </div>
                  ))}
                  {adminCustomers.length === 0 && (
                    <p className="py-8 text-center text-[#78716C]">No customers found in database.</p>
                  )}
                </div>

                {/* Master Profile & Live Measurements Panel */}
                <div className="bg-white rounded-2xl border border-[#EFECE6] p-6 shadow-sm space-y-6">
                  <div>
                    <p className="text-[10px] font-bold tracking-widest text-[#B89768] uppercase">MASTER PROFILE</p>
                    <h3 className="font-serif text-2xl font-bold text-[#1C1A17] mt-1">{selectedCustomer?.name || 'Select a customer'}</h3>
                    <p className="text-xs text-[#78716C] truncate">{selectedCustomer ? `Email: ${selectedCustomer.email}` : 'Choose a client to inspect database measurements.'}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-[#EFECE6]">
                      <span className="text-xs font-bold text-[#1C1A17] uppercase tracking-wider flex items-center"><FileText className="w-3.5 h-3.5 mr-1.5 text-[#B89768]" /> SAVED MEASUREMENTS</span>
                    </div>

                    {customerMeasurements.length > 0 ? customerMeasurements.map((m, idx) => (
                      <div key={idx} className="bg-[#FAF8F5] border border-[#EFECE6] p-4 rounded-xl space-y-3">
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span>{m.name || 'Fit Profile'} ({m.gender || 'Female'})</span>
                          <span className="text-amber-800">{m.is_default ? 'Default Profile' : ''}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                          {m.bust && <div className="bg-white p-2 rounded-lg border border-[#EFECE6]"><span className="text-[9px] text-[#78716C] block">Bust</span><strong>{m.bust}</strong></div>}
                          {m.waist && <div className="bg-white p-2 rounded-lg border border-[#EFECE6]"><span className="text-[9px] text-[#78716C] block">Waist</span><strong>{m.waist}</strong></div>}
                          {m.hips && <div className="bg-white p-2 rounded-lg border border-[#EFECE6]"><span className="text-[9px] text-[#78716C] block">Hips</span><strong>{m.hips}</strong></div>}
                          {m.shoulder && <div className="bg-white p-2 rounded-lg border border-[#EFECE6]"><span className="text-[9px] text-[#78716C] block">Shoulder</span><strong>{m.shoulder}</strong></div>}
                          {m.sleeve && <div className="bg-white p-2 rounded-lg border border-[#EFECE6]"><span className="text-[9px] text-[#78716C] block">Sleeve</span><strong>{m.sleeve}</strong></div>}
                          {m.total_length && <div className="bg-white p-2 rounded-lg border border-[#EFECE6]"><span className="text-[9px] text-[#78716C] block">Length</span><strong>{m.total_length}</strong></div>}
                        </div>
                        {m.remarks && <p className="text-[11px] text-[#78716C] italic">Note: "{m.remarks}"</p>}
                      </div>
                    )) : (
                      <p className="text-xs text-[#78716C] text-center py-6">No measurement records saved for this customer.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

          ) : activeNav === 'discount-codes' ? (
            /* ================= DISCOUNT CODES MODULE ================= */
            <div className="space-y-8">
              <div>
                <p className="text-[10px] font-bold tracking-widest text-[#B89768] uppercase">MARKETING SUITE</p>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1A17] mt-1">Discount Codes & Vouchers</h2>
                <p className="text-xs sm:text-sm text-[#78716C]">Manage luxury customer promotional coupons and designer codes stored in your database</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create Form */}
                <div className="bg-white rounded-2xl border border-[#EFECE6] p-6 sm:p-8 shadow-sm space-y-6">
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
                      disabled={recordSaving}
                      onClick={createPromoCodeRecord} 
                      className="w-full bg-[#1C1A17] disabled:opacity-50 hover:bg-black text-white py-3.5 rounded-xl font-bold tracking-wider shadow-md transition mt-4"
                    >
                      {recordSaving ? 'SAVING COUPON...' : 'GENERATE ACTIVE COUPON'}
                    </button>
                  </div>
                </div>

                {/* Active Campaigns Table */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-[#EFECE6] p-6 sm:p-8 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-xl font-bold text-[#1C1A17]">Active Promotional Campaigns</h3>
                    <button onClick={() => loadModuleRecords('discount-codes')} className="bg-[#FAF8F5] border border-[#EFECE6] px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center">
                      <RefreshCw className="w-3.5 h-3.5 mr-1 text-[#B89768]" /> Refresh
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead>
                        <tr className="border-b border-[#EFECE6] text-[10px] font-bold text-[#78716C] uppercase tracking-wider">
                          <th className="py-3 px-3">Code & Details</th>
                          <th className="py-3 px-3">Status</th>
                          <th className="py-3 px-3">Updated / Created</th>
                          <th className="py-3 px-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EFECE6] text-xs">
                        {moduleRecords.map(camp => (
                          <tr key={camp.id} className="hover:bg-[#FAF8F5]">
                            <td className="py-4 px-3">
                              <span className="font-mono font-bold text-sm text-[#1C1A17] flex items-center"><Tag className="w-3.5 h-3.5 mr-1.5 text-[#B89768]" /> {camp.name}</span>
                              <span className="text-[#78716C] block mt-0.5">{camp.description}</span>
                            </td>
                            <td className="py-4 px-3">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${camp.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'}`}>
                                {camp.status || 'Active'}
                              </span>
                            </td>
                            <td className="py-4 px-3 text-[#78716C]">{camp.updated_at ? new Date(camp.updated_at).toLocaleDateString() : '—'}</td>
                            <td className="py-4 px-3 whitespace-nowrap">
                              <button onClick={() => editModuleRecord(camp)} className="mr-2 px-3 py-1.5 rounded-lg border border-[#EFECE6] hover:bg-white text-xs font-semibold">Edit</button>
                              <button onClick={() => deleteModuleRecord(camp)} className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold">Delete</button>
                            </td>
                          </tr>
                        ))}
                        {moduleRecords.length === 0 && !moduleLoading && (
                          <tr><td colSpan="4" className="py-12 text-center text-[#78716C]">No discount codes in database yet. Create one using the form on the left.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

          ) : activeNav === 'custom-orders' ? (
            /* ================= CUSTOM ORDERS PIPELINE ================= */
            <div className="space-y-8">
              <div>
                <p className="text-[10px] font-bold tracking-widest text-[#B89768] uppercase">BESPOKE COUTURE PIPELINE</p>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-1">
                  <div>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1A17]">Custom Orders & Couture Workspace</h2>
                    <p className="text-xs sm:text-sm text-[#78716C]">Review design sketches, formulate quote calculations, assign tailoring masters, and monitor sewing workflows.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Pending Couture Requests List */}
                <div className="bg-white rounded-2xl border border-[#EFECE6] p-6 shadow-sm space-y-4">
                  <h3 className="font-serif text-lg font-bold text-[#1C1A17]">Custom Design Enquiries</h3>
                  <p className="text-xs text-[#78716C]">Fetched live from user requests</p>

                  <div className="space-y-3">
                    {adminCustomOrders.length > 0 ? adminCustomOrders.map((req) => (
                      <div key={req.id} onClick={() => { setSelectedCustomReq(req); setOfferPriceInput(req.product_price ? String(req.product_price) : ''); }} className={`p-4 rounded-2xl border cursor-pointer transition ${selectedCustomReq?.id === req.id ? 'bg-[#FAF8F5] border-[#B89768] shadow-sm' : 'border-[#EFECE6] hover:bg-[#FAF8F5]'}`}>
                        <div className="flex justify-between items-start text-xs">
                          <span className="font-bold text-[#1C1A17] truncate max-w-[160px]">{req.user_email}</span>
                          <span className="text-[#78716C]">{req.created_at ? new Date(req.created_at).toLocaleDateString() : ''}</span>
                        </div>
                        <p className="font-mono text-xs font-semibold text-[#B89768] mt-1">REQ-{req.id}</p>
                        <p className="font-serif font-bold text-sm text-[#1C1A17] mt-1">{req.product_name}</p>
                        <p className="text-xs text-[#78716C] mt-1 line-clamp-2">{req.message}</p>
                        <div className="mt-3 pt-3 border-t border-[#EFECE6] flex items-center justify-between">
                          <span className="px-2.5 py-1 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800">
                            {req.status || 'Pending Review'}
                          </span>
                        </div>
                      </div>
                    )) : (
                      <p className="text-xs text-[#78716C] text-center py-8">No custom design requests found.</p>
                    )}
                  </div>
                </div>

                {/* Selected Request Pricing & Approval Panel */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-[#EFECE6] p-6 sm:p-8 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-[#EFECE6]">
                    <div>
                      <div className="flex items-center space-x-3">
                        <span className="font-mono font-bold text-xs bg-amber-100 text-amber-900 px-3 py-1 rounded-full">{selectedCustomReq?.id ? `REQ-${selectedCustomReq.id}` : 'Select a request'}</span>
                        <span className="text-xs text-[#78716C]">Date: {selectedCustomReq?.created_at ? new Date(selectedCustomReq.created_at).toLocaleDateString() : '—'}</span>
                      </div>
                      <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1C1A17] mt-2">{selectedCustomReq?.product_name || 'Select a custom request'}</h3>
                    </div>
                    <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 self-start sm:self-auto">{selectedCustomReq?.status || 'Pending Review'}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#EFECE6] space-y-2">
                      <span className="text-[10px] font-bold tracking-widest text-[#B89768] uppercase">PATRON</span>
                      <p className="font-bold text-sm text-[#1C1A17] truncate">{selectedCustomReq?.user_email || '—'}</p>
                      <p className="text-xs text-[#78716C]">Category: {selectedCustomReq?.product_category || 'Bespoke'}</p>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#EFECE6] space-y-2">
                      <span className="text-[10px] font-bold tracking-widest text-[#B89768] uppercase">ATELIER LINE</span>
                      <p className="font-bold text-sm text-[#1C1A17]">{selectedCustomReq?.line || 'Bespoke Custom Line'}</p>
                      <p className="text-xs text-[#78716C]">Estimated Price: <span className="font-semibold text-[#1C1A17]">{formatPrice(selectedCustomReq?.product_price || 0)}</span></p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-[#1C1A17] uppercase tracking-wider block">Garment Description & Custom Motif Requests:</label>
                    <div className="p-4 bg-[#FAF8F5] border border-[#EFECE6] rounded-xl text-xs text-[#1C1A17] italic">
                      "{selectedCustomReq?.message || 'No specific notes provided.'}"
                    </div>
                  </div>

                  <div className="pt-6 border-t border-[#EFECE6] space-y-4">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-[#B89768]" />
                      <h4 className="font-serif text-base font-bold text-[#1C1A17]">Issue Pricing & Quotation Calculations</h4>
                    </div>
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

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4">
                      <button onClick={() => showToast('Review stage reset.')} className="w-full sm:w-auto bg-white border border-[#EFECE6] hover:bg-[#FAF8F5] text-[#1C1A17] text-xs font-bold px-5 py-3 rounded-xl">
                        Reset Review Stage
                      </button>
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                     <button onClick={handleSendPriceOffer} className="bg-[#B89768] hover:bg-[#a68559] text-black text-xs font-bold px-6 py-3 rounded-xl shadow-sm w-full sm:w-auto text-center cursor-pointer">
  Apply & Send Price Offer
</button>
                        <button onClick={async () => {
                          if (!selectedCustomReq?.id) return;
                          try {
                            const res = await fetch(`${API_BASE_URL}/api/admin/custom-orders/${selectedCustomReq.id}`, {
                              method: 'PATCH', 
                              headers: getAuthHeaders(),
                              body: JSON.stringify({ status: 'Approved for Production', message: selectedCustomReq.message })
                            });
                            const data = await res.json();
                            if (!res.ok) throw new Error(data.detail || 'Failed');
                            setAdminCustomOrders(curr => curr.map(item => item.id === selectedCustomReq.id ? data : item));
                            showToast('Order approved for workshop loom production!');
                          } catch(err) { showToast('Approval failed.'); }
                        }} className="bg-[#1C1A17] hover:bg-black text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md w-full sm:w-auto text-center">
                          Approve for Workshop Loom
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          ) : activeNav === 'products' ? (
            /* ================= PRODUCTS MODULE ================= */
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1A17]">Luxury Catalog & Products</h2>
                  <p className="text-xs sm:text-sm text-[#78716C] mt-1">Curate lines, define size matrixes, SKU allocations, and retail prices.</p>
                </div>
                <button onClick={handleAddProductClick} className="bg-[#1C1A17] hover:bg-black text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center space-x-2 self-start sm:self-auto">
                  <Plus className="w-4 h-4" /><span>+ Add New Design</span>
                </button>
              </div>

              {/* Collection Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
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

              <div className="bg-white rounded-2xl border border-[#EFECE6] p-4 sm:p-8 shadow-sm space-y-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="relative w-full md:w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78716C]" />
                    <input placeholder="Search catalog name/SKU..." className="w-full bg-[#FAF8F5] border border-[#EFECE6] pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#B89768]" />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="border-b border-[#EFECE6] text-[11px] font-bold text-[#78716C] uppercase">
                        <th className="py-3 px-3">Design Details</th>
                        <th className="py-3 px-3">Category</th>
                        <th className="py-3 px-3">Base SKU</th>
                        <th className="py-3 px-3">Price</th>
                        <th className="py-3 px-3">Stock Status</th>
                        <th className="py-3 px-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFECE6] text-sm">
                      {adminProducts.map(prd => (
                        <tr key={prd.id} className="hover:bg-[#FAF8F5]">
                          <td className="py-4 px-3 flex items-center gap-3">
                            <img src={prd.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=200'} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                            <div>
                              <p className="font-serif font-bold text-sm text-[#1C1A17]">{prd.name}</p>
                              <span className="text-xs text-[#78716C]">{prd.tag || 'Atelier'}</span>
                            </div>
                          </td>
                          <td className="py-4 px-3 text-xs text-[#78716C]">{prd.category}</td>
                          <td className="py-4 px-3 font-mono text-xs">{prd.sku || 'WFT-1042'}</td>
                          <td className="py-4 px-3 font-semibold">{formatPrice(prd.price)}</td>
                          <td className="py-4 px-3 text-xs">
                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold ${prd.in_stock ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                              {prd.in_stock ? 'IN STOCK' : 'OUT OF STOCK'}
                            </span>
                          </td>
                          <td className="py-4 px-3 whitespace-nowrap">
                            <button onClick={() => handleEditProduct(prd)} className="p-2 rounded-xl border border-[#EFECE6] hover:bg-white mr-2" title="Edit Product"><Edit3 className="w-3.5 h-3.5 text-[#78716C]" /></button>
                            <button onClick={() => handleDeleteProduct(prd)} className="p-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100" title="Delete Product"><Trash2 className="w-3.5 h-3.5" /></button>
                          </td>
                        </tr>
                      ))}
                      {adminProducts.length === 0 && (
                        <tr><td colSpan="6" className="py-12 text-center text-[#78716C]">No products found in database.</td></tr>
                      )}
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
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1A17]">{modulesData[activeNav]?.title || activeNav.replaceAll('-', ' ').toUpperCase()}</h2>
                  <p className="text-xs sm:text-sm text-[#78716C] mt-1">{modulesData[activeNav]?.subtitle || 'Manage this WEFTIN workspace module.'}</p>
                </div>
                <div className="flex gap-2 self-start md:self-auto">
                  <button onClick={() => loadModuleRecords(activeNav)} className="bg-white border border-[#EFECE6] px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center">
                    <RefreshCw className="w-3.5 h-3.5 mr-2" /> Refresh
                  </button>
                  <button disabled={recordSaving} onClick={createModuleRecord} className="bg-[#1C1A17] disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2">
                    <Plus className="w-4 h-4" /> {recordSaving ? 'SAVING…' : 'ADD RECORD'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                  <table className="w-full text-left border-collapse min-w-[700px]">
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
                          <td className="py-4 px-3 text-[#78716C] max-w-xs truncate">{record.description || record.message || record.user_email || '—'}</td>
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

      {/* Admin Profile Modal */}
      {profileModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 border border-[#EFECE6] shadow-2xl space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-xl font-bold text-[#1C1A17]">Edit Admin Profile</h3>
              <button onClick={() => setProfileModalOpen(false)} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#78716C] uppercase tracking-wider block mb-1">Administrator Name</label>
                <input 
                  type="text" 
                  value={adminName} 
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#EFECE6] px-4 py-3 rounded-xl font-medium text-sm focus:outline-none focus:border-[#B89768]" 
                />
              </div>
              <div>
                <label className="font-bold text-[#78716C] uppercase tracking-wider block mb-1">Administrator Role / Title</label>
                <input 
                  type="text" 
                  value={adminRole} 
                  onChange={(e) => setAdminRole(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#EFECE6] px-4 py-3 rounded-xl font-medium text-sm focus:outline-none focus:border-[#B89768]" 
                />
              </div>
              <div>
                <label className="font-bold text-[#78716C] uppercase tracking-wider block mb-1">Admin ID (Read-Only)</label>
                <input 
                  type="text" 
                  disabled 
                  value="10 (Authorized Admin)" 
                  className="w-full bg-gray-100 border border-gray-200 px-4 py-3 rounded-xl font-mono text-gray-500 text-sm" 
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button onClick={() => setProfileModalOpen(false)} className="flex-1 bg-white border border-[#EFECE6] text-gray-800 py-3 rounded-xl font-bold">Cancel</button>
                <button onClick={() => { setProfileModalOpen(false); showToast("Admin profile updated successfully."); }} className="flex-1 bg-[#1C1A17] text-white py-3 rounded-xl font-bold">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

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
