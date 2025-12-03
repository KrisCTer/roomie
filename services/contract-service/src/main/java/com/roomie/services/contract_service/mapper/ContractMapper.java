package com.roomie.services.contract_service.mapper;

import com.roomie.services.contract_service.dto.request.ContractRequest;
import com.roomie.services.contract_service.dto.response.ContractResponse;
import com.roomie.services.contract_service.entity.Contract;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ContractMapper {
    Contract toEntity(ContractRequest req);
    ContractResponse toResponse(Contract entity);
}
