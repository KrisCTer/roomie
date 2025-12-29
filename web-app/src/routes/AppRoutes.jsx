// src/routes/AppRoutes.jsx
import { Routes, Route } from "react-router-dom";
import RoleProtectedRoute from "../components/common/RoleProtectedRoute";

/* ================= AUTH ================= */
import Login from "../pages/Login";
import Register from "../pages/Register";
import OAuth2Callback from "../pages/OAuth2Callback";
import IdentityVerification from "../pages/IdentityVerification/IdentityVerification";

/* ================= MAIN / PUBLIC ================= */
import Home from "../pages/Main/Home";
import PropertyDetail from "../pages/Main/PropertyDetail";
import PropertySearch from "../pages/Main/PropertySearch";
import UserProfile from "../pages/Main/UserProfile";
import MyFavorites from "../pages/Main/MyFavorites";

/* ================= USER ================= */
import Profile from "../pages/Profile/Profile";
import Message from "../pages/Message/Message";
import Dashboard from "../pages/User/Dashboard";
import MyBookings from "../pages/Booking/MyBookings";
import MyContracts from "../pages/Contracts/MyContracts";
import ContractSigning from "../pages/Contracts/ContractSigning";
import UnifiedBillsPage from "../pages/Billing/UnifiedBillsPage";
import BillDetail from "../pages/Billing/BillDetail";
import NotificationCenter from "../pages/NotificationCenter";

/* ================= LANDLORD ================= */
import AddProperty from "../pages/Property/AddProperty";
import MyProperties from "../pages/Property/MyProperties";
import UtilityConfigPage from "../pages/Billing/UtilityConfigPage";

/* ================= ADMIN ================= */
import Admin from "../pages/User/Admin";
import AdminProperties from "../pages/Admin/AdminProperties";
import AdminUsers from "../pages/Admin/AdminUsers";
import AdminDashboard from "../pages/Admin/AdminDashboard";

const AppRoutes = () => {
  return (
    <Routes>
      {/* ================= OAUTH ================= */}
      {/* ⚠️ PHẢI ĐẶT TRƯỚC */}
      <Route path="/oauth2/callback" element={<OAuth2Callback />} />

      {/* ================= AUTH ================= */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ================= PUBLIC ================= */}
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/property/:id" element={<PropertyDetail />} />
      <Route path="/search" element={<PropertySearch />} />
      <Route path="/user/:userId" element={<UserProfile />} />
      <Route path="/my-favorites" element={<MyFavorites />} />

      {/* ================= COMMON (LOGIN REQUIRED) ================= */}
      <Route
        path="/identity-verification"
        element={
          <RoleProtectedRoute allowedRoles={["tenant", "landlord", "admin"]}>
            <IdentityVerification />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <RoleProtectedRoute allowedRoles={["tenant", "landlord", "admin"]}>
            <Profile />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/message"
        element={
          <RoleProtectedRoute allowedRoles={["tenant", "landlord", "admin"]}>
            <Message />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/notifications"
        element={
          <RoleProtectedRoute allowedRoles={["tenant", "landlord", "admin"]}>
            <NotificationCenter />
          </RoleProtectedRoute>
        }
      />

      {/* ================= TENANT + LANDLORD ================= */}
      <Route
        path="/dashboard"
        element={
          <RoleProtectedRoute allowedRoles={["tenant", "landlord"]}>
            <Dashboard />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/my-bookings"
        element={
          <RoleProtectedRoute allowedRoles={["tenant", "landlord"]}>
            <MyBookings />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/my-contracts"
        element={
          <RoleProtectedRoute allowedRoles={["tenant", "landlord"]}>
            <MyContracts />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/contract-signing/:id"
        element={
          <RoleProtectedRoute allowedRoles={["tenant", "landlord"]}>
            <ContractSigning />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/unified-bills"
        element={
          <RoleProtectedRoute allowedRoles={["tenant", "landlord"]}>
            <UnifiedBillsPage />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/bill-detail/:id"
        element={
          <RoleProtectedRoute allowedRoles={["tenant", "landlord"]}>
            <BillDetail />
          </RoleProtectedRoute>
        }
      />

      {/* ================= LANDLORD ONLY ================= */}
      <Route
        path="/add-property"
        element={
          <RoleProtectedRoute allowedRoles={["landlord"]}>
            <AddProperty />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/my-properties"
        element={
          <RoleProtectedRoute allowedRoles={["landlord"]}>
            <MyProperties />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/utility-config"
        element={
          <RoleProtectedRoute allowedRoles={["landlord"]}>
            <UtilityConfigPage />
          </RoleProtectedRoute>
        }
      />

      {/* ================= ADMIN ================= */}
      <Route
        path="/admin"
        element={
          <RoleProtectedRoute allowedRoles={["admin"]}>
            <Admin />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <RoleProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/admin/properties"
        element={
          <RoleProtectedRoute allowedRoles={["admin"]}>
            <AdminProperties />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <RoleProtectedRoute allowedRoles={["admin"]}>
            <AdminUsers />
          </RoleProtectedRoute>
        }
      />

      {/* ================= FALLBACK ================= */}
      <Route path="*" element={<Home />} />
    </Routes>
  );
};

export default AppRoutes;
