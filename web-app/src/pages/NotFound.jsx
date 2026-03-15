import React from "react";
import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-primary text-dark-primary p-4">
      <div className="max-w-md w-full text-center space-y-8 animate-fade-in-up">
        {/* Error Code */}
        <div className="relative">
          <h1 className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 opacity-20">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <h2 className="text-3xl font-bold">Lạc đường rồi!</h2>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-4">
          <p className="text-dark-secondary text-lg">
            Trang bạn đang tìm kiếm không tồn tại, đã bị xóa hoặc tạm thời không truy cập được.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-full sm:w-auto px-6 py-3 rounded-xl bg-dark-secondary border border-dark-primary hover:bg-dark-tertiary transition-all duration-200 gap-2 text-dark-primary font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại</span>
          </button>
          
          <button
            onClick={() => navigate("/")}
            className="flex items-center justify-center w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 transition-all duration-200 gap-2 text-white font-medium shadow-lg shadow-blue-500/30"
          >
            <Home className="w-5 h-5" />
            <span>Về trang chủ</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
