import React from "react";
import ContractCard from "./ContractCard";

const ContractsList = ({
  contracts,
  role,
  onContractClick,
  propertyCache,
  userCache,
}) => {
  return (
    <div className="space-y-4">
      {contracts.map((contract) => (
        <ContractCard
          key={contract.id}
          contract={contract}
          role={role}
          onClick={() => onContractClick(contract)}
          propertyData={propertyCache[contract.propertyId]}
          userData={userCache}
        />
      ))}
    </div>
  );
};

export default ContractsList;
