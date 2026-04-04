// web-app/src/components/common/RoleProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useRole } from "../../contexts/RoleContext";
import { useUser } from "../../contexts/UserContext";
import LoadingSpinner from "./LoadingSpinner";

const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const { activeRole } = useRole();
  const { user, loading } = useUser();

  // Only block while loading if user state is still unknown.
  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Đang xác thực..." />
      </div>
    );
  }

  // Protected routes always require login.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const currentRole = (user?.role || activeRole || "").toLowerCase();
  const isAdmin =
    currentRole === "admin" || user?.username?.toLowerCase() === "admin";

  if (isAdmin && allowedRoles.includes("admin")) {
    return children;
  }

  if (isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (allowedRoles.includes(currentRole)) {
    return children;
  }

  return <Navigate to="/" replace />;
};

export default RoleProtectedRoute;
