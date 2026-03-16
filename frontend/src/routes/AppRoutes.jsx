// src/routes/AppRoutes.jsx
import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import RoleProtectedRoute from "../components/common/RoleProtectedRoute";
import VerificationGuard from "../components/common/VerificationGuard";
import LoadingSpinner from "../components/common/LoadingSpinner";

/* ================= AUTH (lazy) ================= */
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const OAuth2Callback = lazy(() => import("../pages/OAuth2Callback"));
const IdentityVerification = lazy(() => import("../pages/IdentityVerification/IdentityVerification"));

/* ================= MAIN / PUBLIC (lazy) ================= */
const Home = lazy(() => import("../pages/Main/Home"));
const PropertyDetail = lazy(() => import("../pages/Main/PropertyDetail"));
const PropertySearch = lazy(() => import("../pages/Main/PropertySearch"));
const UserProfile = lazy(() => import("../pages/Main/UserProfile"));
const MyFavorites = lazy(() => import("../pages/Main/MyFavorites"));

/* ================= USER (lazy) ================= */
const Profile = lazy(() => import("../pages/Profile/Profile"));
const Message = lazy(() => import("../pages/Message/Message"));
const Dashboard = lazy(() => import("../pages/User/Dashboard"));
const MyBookings = lazy(() => import("../pages/Booking/MyBookings"));
const MyContracts = lazy(() => import("../pages/Contracts/MyContracts"));
const ContractSigning = lazy(() => import("../pages/Contracts/ContractSigning"));
const UnifiedBillsPage = lazy(() => import("../pages/Billing/UnifiedBillsPage"));
const BillDetail = lazy(() => import("../pages/Billing/BillDetail"));
const NotificationCenter = lazy(() => import("../pages/NotificationCenter"));

/* ================= LANDLORD (lazy) ================= */
const AddProperty = lazy(() => import("../pages/Property/AddProperty"));
const MyProperties = lazy(() => import("../pages/Property/MyProperties"));
const UtilityConfigPage = lazy(() => import("../pages/Billing/UtilityConfigPage"));

/* ================= ADMIN (lazy) ================= */
const Admin = lazy(() => import("../pages/User/Admin"));
const AdminProperties = lazy(() => import("../pages/Admin/AdminProperties"));
const AdminUsers = lazy(() => import("../pages/Admin/AdminUsers"));
const AdminDashboard = lazy(() => import("../pages/Admin/AdminDashboard"));
const NotFound = lazy(() => import("../pages/NotFound"));

const AppRoutes = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner message="Đang tải trang..." />
        </div>
      }
    >
    <Routes>
      {/* ================= OAUTH ================= */}
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
            <VerificationGuard>
              <Profile />
            </VerificationGuard>
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/message"
        element={
          <RoleProtectedRoute allowedRoles={["tenant", "landlord", "admin"]}>
            <VerificationGuard>
              <Message />
            </VerificationGuard>
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
            <VerificationGuard>
              <Dashboard />
            </VerificationGuard>
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/my-bookings"
        element={
          <RoleProtectedRoute allowedRoles={["tenant", "landlord"]}>
            <VerificationGuard>
              <MyBookings />
            </VerificationGuard>
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/my-contracts"
        element={
          <RoleProtectedRoute allowedRoles={["tenant", "landlord"]}>
            <VerificationGuard>
              <MyContracts />
            </VerificationGuard>
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/contract-signing/:id"
        element={
          <RoleProtectedRoute allowedRoles={["tenant", "landlord"]}>
            <VerificationGuard>
              <ContractSigning />
            </VerificationGuard>
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/unified-bills"
        element={
          <RoleProtectedRoute allowedRoles={["tenant", "landlord"]}>
            <VerificationGuard>
              <UnifiedBillsPage />
            </VerificationGuard>
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/bill-detail/:id"
        element={
          <RoleProtectedRoute allowedRoles={["tenant", "landlord"]}>
            <VerificationGuard>
              <BillDetail />
            </VerificationGuard>
          </RoleProtectedRoute>
        }
      />

      {/* ================= LANDLORD ONLY ================= */}
      <Route
        path="/add-property"
        element={
          <RoleProtectedRoute allowedRoles={["landlord"]}>
            <VerificationGuard>
              <AddProperty />
            </VerificationGuard>
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/my-properties"
        element={
          <RoleProtectedRoute allowedRoles={["landlord"]}>
            <VerificationGuard>
              <MyProperties />
            </VerificationGuard>
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/utility-config"
        element={
          <RoleProtectedRoute allowedRoles={["landlord"]}>
            <VerificationGuard>
              <UtilityConfigPage />
            </VerificationGuard>
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
      <Route path="*" element={<NotFound />} />
    </Routes>
    </Suspense>
  );
};

export default AppRoutes;
