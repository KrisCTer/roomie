import React from "react";
import { X, CheckCircle, PenTool } from "lucide-react";

const SignModal = ({ show, onClose, onContinue }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            ✍️ Xác nhận ký hợp đồng
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">
              ⚠️ Bạn đang thực hiện ký điện tử hợp đồng thuê nhà. Sau khi ký,
              bạn sẽ chịu trách nhiệm pháp lý theo các điều khoản trong hợp
              đồng.
            </p>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Tôi đã đọc và hiểu rõ các điều khoản trong hợp đồng</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Tôi đồng ý với tất cả các điều khoản đã nêu</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Tôi cam kết thực hiện đúng nghĩa vụ của mình</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Hủy
          </button>
          <button
            onClick={onContinue}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 shadow-md"
          >
            <PenTool className="w-5 h-5" />
            Tiếp tục ký
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignModal;
