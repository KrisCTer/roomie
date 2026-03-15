// web-app/src/components/common/RoleProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useRole } from "../../contexts/RoleContext";
import { useUser } from "../../contexts/UserContext";

const RoleProtectedRoute = ({ children, allowedRoles }) => {
  // const { activeRole } = useRole();

  // if (!allowedRoles.includes(activeRole)) {
  //   return <Navigate to="/dashboard" replace />;
  // }

  // return children;
  const { activeRole } = useRole();
  const { user } = useUser();

  const isAdmin =
    user?.role === "admin" || user?.username?.toLowerCase() === "admin";

  // ✅ Admin luôn được phép vào route admin
  if (isAdmin && allowedRoles.includes("admin")) {
    return children;
  }

  // ✅ User thường
  if (allowedRoles.includes(activeRole)) {
    return children;
  }

  return <Navigate to="/dashboard" replace />;
};

export default RoleProtectedRoute;
