// src/routes/AppRoutes.jsx
import { Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";
import OAuth2Callback from "../pages/OAuth2Callback";

import Home from "../pages/Main/Home";
import Profile from "../pages/Profile/Profile";
import Message from "../pages/Message/Message";
import Admin from "../pages/User/Admin";
import Dashboard from "../pages/User/Dashboard";
import AddProperty from "../pages/Property/AddProperty";
import MyProperties from "../pages/Property/MyProperties";
import PropertyDetail from "../pages/Main/PropertyDetail";
import PropertySearch from "../pages/Main/PropertySearch";
import ContractSigning from "../pages/Contracts/ContractSigning";
import MyContracts from "../pages/Contracts/MyContracts";
import MyBookings from "../pages/Booking/MyBookings";
import UnifiedBillsPage from "../pages/Billing/UnifiedBillsPage";
import BillDetail from "../pages/Billing/BillDetail";
import UtilityConfigPage from "../pages/Billing/UtilityConfigPage";
import UserProfile from "../pages/Main/UserProfile";

import AdminProperties from "../pages/Admin/AdminProperties";
import AdminUsers from "../pages/Admin/AdminUsers";
import AdminDashboard from "../pages/Admin/AdminDashboard";

const AppRoutes = () => {
  return (
    <Routes>
      {/* ✅ OAuth2 CALLBACK – PHẢI ĐẶT TRƯỚC */}
      <Route path="/oauth2/callback" element={<OAuth2Callback />} />

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Main */}
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/property/:id" element={<PropertyDetail />} />
      <Route path="/search" element={<PropertySearch />} />
      <Route path="/user/:userId" element={<UserProfile />} />

      {/* User */}
      <Route path="/profile" element={<Profile />} />
      <Route path="/message" element={<Message />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/add-property" element={<AddProperty />} />
      <Route path="/my-properties" element={<MyProperties />} />
      <Route path="/contract-signing/:id" element={<ContractSigning />} />
      <Route path="/my-contracts" element={<MyContracts />} />
      <Route path="/my-bookings" element={<MyBookings />} />
      <Route path="/unified-bills" element={<UnifiedBillsPage />} />
      <Route path="/bill-detail/:id" element={<BillDetail />} />
      <Route path="/utility-config" element={<UtilityConfigPage />} />

      {/* Admin */}
      <Route path="/admin/properties" element={<AdminProperties />} />
      <Route path="/admin/users" element={<AdminUsers />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />

      {/* Fallback */}
      <Route path="*" element={<Home />} />
    </Routes>
  );
};

export default AppRoutes;
