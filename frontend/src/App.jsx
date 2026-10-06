import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home_Page from './pages/Home_Page';
import Shop_Page from './pages/Shop_Page';
import Lookbook_Page from './pages/Lookbook_Page';
import Limitededition_Page from './pages/Limitededition_Page';
import Profile_Page from './pages/Profile_Page';
import Dashboard from './pages/Dashboard';
import Cart_Page from './pages/Cart_Page';
import Product_Overview from './pages/Product_Overview';
import AddProduct_Page from './pages/AddProduct_Page'; // If you created the admin form
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
import Collections_Page from "./pages/Collections_Page"; // Adjust path based on your folder structure

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home_Page />} />
        <Route path="/shop" element={<Shop_Page />} />
        <Route path="/lookbook" element={<Lookbook_Page />} />
        <Route path="/limited" element={<Limitededition_Page />} />
        <Route path="/profile" element={<Profile_Page />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/cart" element={<Cart_Page />} />
        <Route path="/custom-designs" element={<CustomDesigns_Page />} />
        <Route path="/custom-workspace/:id" element={<CustomWorkspace_Page />} />
        {/* Update this line to include /:id */}
        <Route path="/product/:id" element={<Product_Overview />} />
        <Route path="/measurements" element={<Measurements_Page />} />
        <Route path="/admin/add-product" element={<AddProduct_Page />} />
        <Route path="/orders" element={<Orders_Page />} />
        <Route path="/wishlist" element={<Wishlist_Page />} />
        <Route path="/addresses" element={<Addresses_Page />} />
        <Route path="/notifications" element={<Notifications_Page />} />
        <Route path="/support" element={<Support_Page />} />
        <Route path="/track-order/:id" element={<TrackOrder_Page />} />
        <Route path="/login" element={<Login_Page />} />
        <Route path="/register" element={<Register_Page />} />
        <Route path="/collections" element={<Collections_Page />} />
<Route path="/admin/home-cms" element={<Admin_HomeCMS_Page />} /> 
<Route
  path="/admin/lookbook"
  element={<Admin_Lookbook_Page />}
/>
<Route
  path="/admin/limited-edition"
  element={
    <Admin_Limitededition_Page />
  }
/>
     </Routes>
    </Router>
  );
}
