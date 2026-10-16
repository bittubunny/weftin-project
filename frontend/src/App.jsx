import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Home_Page from './pages/Home_Page';
import Shop_Page from './pages/Shop_Page';
import Lookbook_Page from './pages/Lookbook_Page';
import Limitededition_Page from './pages/Limitededition_Page';
import Profile_Page from './pages/Profile_Page';
import Dashboard from './pages/Dashboard';
import Cart_Page from './pages/Cart_Page';
import Product_Overview from './pages/Product_Overview';
import AddProduct_Page from './pages/AddProduct_Page'; 
import CustomDesigns_Page from './pages/CustomDesigns_Page';
import CustomWorkspace_Page from './pages/CustomWorkspace_Page';
import Measurements_Page from './pages/Measurements_Page';
import Orders_Page from './pages/Orders_Page';
import Wishlist_Page from './pages/Wishlist_Page';
import Addresses_Page from './pages/Addresses_Page';
import Notifications_Page from './pages/Notifications_Page';
import Support_Page from './pages/Support_Page';
import TrackOrder_Page from './pages/TrackOrder_Page';
import Login_Page from './pages/Login_Page';
import Register_Page from './pages/Register_Page';
import Admin_HomeCMS_Page from './pages/Admin_HomeCMS_Page';
import Admin_Lookbook_Page from "./pages/Admin_Lookbook_Page";
import Admin_Limitededition_Page from "./pages/Admin_Limitededition_Page";
import Collections_Page from "./pages/Collections_Page"; 
import Admin_Dashboard_Page from './pages/Admin_Dashboard_Page';

// Simple Protected Route wrapper helper
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('weftin_token');
  const user = localStorage.getItem('weftin_user');

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* --- PUBLIC GUEST-ACCESSIBLE ROUTES --- */}
        <Route path="/" element={<Home_Page />} />
        <Route path="/shop" element={<Shop_Page />} />
        <Route path="/lookbook" element={<Lookbook_Page />} />
        <Route path="/limited" element={<Limitededition_Page />} />
        <Route path="/collections" element={<Collections_Page />} />
        <Route path="/product/:id" element={<Product_Overview />} />
        <Route path="/cart" element={<Cart_Page />} />
        <Route path="/login" element={<Login_Page />} />
        <Route path="/register" element={<Register_Page />} />
        <Route path="/support" element={<Support_Page />} />
        <Route path="/custom-designs" element={<CustomDesigns_Page />} />
        <Route path="/custom-workspace/:id" element={<CustomWorkspace_Page />} />

        {/* --- LOGIN-REQUIRED PROTECTED ROUTES --- */}
        <Route path="/profile" element={<ProtectedRoute><Profile_Page /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><Orders_Page /></ProtectedRoute>} />
        <Route path="/measurements" element={<ProtectedRoute><Measurements_Page /></ProtectedRoute>} />
        <Route path="/wishlist" element={<ProtectedRoute><Wishlist_Page /></ProtectedRoute>} />
        <Route path="/addresses" element={<ProtectedRoute><Addresses_Page /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications_Page /></ProtectedRoute>} />
        <Route path="/track-order/:id" element={<ProtectedRoute><TrackOrder_Page /></ProtectedRoute>} />

        {/* --- ADMIN-ONLY ROUTES --- */}
        <Route path="/admin/add-product" element={<ProtectedRoute><AddProduct_Page /></ProtectedRoute>} />
        <Route path="/admin/home-cms" element={<ProtectedRoute><Admin_HomeCMS_Page /></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<ProtectedRoute><Admin_Dashboard_Page /></ProtectedRoute>} />
        <Route path="/admin/lookbook" element={<ProtectedRoute><Admin_Lookbook_Page /></ProtectedRoute>} />
        <Route path="/admin/limited-edition" element={<ProtectedRoute><Admin_Limitededition_Page /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}
