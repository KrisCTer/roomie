// web-app/src/components/common/VerificationGuard.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";

const VerificationGuard = ({ children }) => {
  const navigate = useNavigate();
  const { user, loading } = useUser();

  useEffect(() => {
    // Chờ load xong mới kiểm tra
    if (!loading && user) {
      // Check if user is admin
      const isAdmin =
        user.username?.toLowerCase() === "admin" ||
        localStorage.getItem("username")?.toLowerCase() === "admin";

      // Skip verification check for admin
      if (isAdmin) {
        return;
      }

      // Kiểm tra nếu chưa có idCardNumber (chưa xác thực)
      if (!user.idCardNumber) {
        navigate("/identity-verification");
      }
    }
  }, [loading, user, navigate]);

  // Hiển thị children khi đã xác thực hoặc đang loading hoặc là admin
  return children;
};

export default VerificationGuard;
