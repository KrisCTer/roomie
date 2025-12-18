import React from "react";
import ContractCard from "./ContractCard";

const ContractsList = ({
  contracts,
  role,
  onContractClick,
  propertyCache,
  userCache,
  currentUserId,
}) => {
  if (!contracts || contracts.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <p className="text-gray-600 mb-2">No contracts found</p>
        <p className="text-sm text-gray-500">
          {role === "landlord"
            ? "Contracts will appear once a tenant confirms a booking"
            : "Contracts will appear after the landlord confirms your booking"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {contracts.map((contract) => (
        <ContractCard
          key={contract.id}
          contract={contract}
          role={role}
          onClick={() => onContractClick(contract)}
          propertyData={propertyCache[contract.propertyId]}
          tenantData={userCache[contract.tenantId]}
          landlordData={userCache[contract.landlordId]}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
};

export default ContractsList;
