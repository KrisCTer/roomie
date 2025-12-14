import React from "react";

const ContractInfoCard = ({ contract, formatDateTime }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Thông tin hợp đồng
      </h2>
      <div className="space-y-3 text-sm">
        <div>
          <p className="text-gray-600">Mã hợp đồng</p>
          <p className="font-medium text-gray-900 font-mono">
            {contract._id || contract.id}
          </p>
        </div>
        <div>
          <p className="text-gray-600">Mã booking</p>
          <p className="font-medium text-gray-900 font-mono">
            {contract.bookingId || "N/A"}
          </p>
        </div>
        <div>
          <p className="text-gray-600">Tenant ID</p>
          <p className="font-medium text-gray-900 font-mono text-xs">
            {contract.tenantId}
          </p>
        </div>
        <div>
          <p className="text-gray-600">Landlord ID</p>
          <p className="font-medium text-gray-900 font-mono text-xs">
            {contract.landlordId}
          </p>
        </div>
        <div>
          <p className="text-gray-600">Ngày tạo</p>
          <p className="font-medium text-gray-900">
            {formatDateTime(contract.createdAt)}
          </p>
        </div>
        <div>
          <p className="text-gray-600">Cập nhật lần cuối</p>
          <p className="font-medium text-gray-900">
            {formatDateTime(contract.updatedAt)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContractInfoCard;
