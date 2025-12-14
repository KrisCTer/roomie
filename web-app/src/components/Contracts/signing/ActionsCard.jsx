import React from "react";
import { PenTool, CheckCircle, Clock, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ActionsCard = ({
  contract,
  canSign,
  isSigned,
  otherPartySigned,
  party,
  pdfUrl,
  onSignClick,
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Hành động</h2>

      <div className="space-y-3">
        {/* Show sign button if user can sign */}
        {canSign && party && (
          <button
            onClick={onSignClick}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold shadow-md"
          >
            <PenTool className="w-5 h-5" />
            Ký hợp đồng ngay
          </button>
        )}

        {/* Show if user already signed */}
        {isSigned && (
          <div className="p-3 bg-green-50 border-l-4 border-green-500 rounded-lg">
            <p className="text-sm text-green-700 font-medium text-center flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Bạn đã ký hợp đồng này
            </p>
          </div>
        )}

        {/* Show waiting message */}
        {isSigned && !otherPartySigned && (
          <div className="p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
            <p className="text-sm text-yellow-700 text-center flex items-center justify-center gap-2">
              <Clock className="w-4 h-4" />
              Đang chờ {party === "landlord" ? "người thuê" : "chủ nhà"} ký
            </p>
          </div>
        )}

        {/* Show if user is not a party */}
        {!party && (
          <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded-lg">
            <p className="text-sm text-red-700 text-center">
              Bạn không phải là bên tham gia hợp đồng này
            </p>
          </div>
        )}

        {pdfUrl && (
          <a
            href={pdfUrl}
            download
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            <Download className="w-5 h-5" />
            Tải xuống hợp đồng
          </a>
        )}

        <button
          onClick={() => navigate("/my-contracts")}
          className="w-full px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Quay lại danh sách
        </button>
      </div>
    </div>
  );
};

export default ActionsCard;
