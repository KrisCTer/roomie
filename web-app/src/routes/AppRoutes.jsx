// src/routes/AppRoutes.jsx (hoặc src/AppRoutes.jsx)
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";

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

import AdminProperties from "../pages/Admin/AdminProperties";
import AdminUsers from "../pages/Admin/AdminUsers";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Main */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/property/:id" element={<PropertyDetail />} />
        <Route path="/property-search" element={<PropertySearch />} />

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

        {/* Admin */}
        <Route path="/admin/properties" element={<AdminProperties />} />
        <Route path="/admin/users" element={<AdminUsers />} />

        {/* Fallback */}
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
