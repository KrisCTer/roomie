import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ContractHeader = ({ contract, statusConfig, party }) => {
  const navigate = useNavigate();
  const StatusIcon = statusConfig.icon;

  return (
    <div className="mb-6">
      <button
        onClick={() => navigate("/my-contracts")}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Quay lại danh sách</span>
      </button>

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Chi tiết hợp đồng
          </h1>
          <p className="text-gray-600">
            Mã hợp đồng:{" "}
            <span className="font-mono font-semibold">
              {contract._id || contract.id}
            </span>
          </p>
          {party && (
            <p className="text-sm text-blue-600 mt-1">
              Vai trò:{" "}
              <span className="font-semibold">
                {party === "tenant" ? "Người thuê" : "Chủ nhà"}
              </span>
            </p>
          )}
        </div>

        <span
          className={`${statusConfig.bg} ${statusConfig.text} px-4 py-2 rounded-full font-medium flex items-center gap-2`}
        >
          <StatusIcon className="w-5 h-5" />
          {statusConfig.label}
        </span>
      </div>
    </div>
  );
};

export default ContractHeader;
