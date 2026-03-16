package com.roomie.services.billing_service.mapper;

import com.roomie.services.billing_service.dto.request.BillRequest;
import com.roomie.services.billing_service.dto.response.BillResponse;
import com.roomie.services.billing_service.entity.Bill;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface BillMapper {
    Bill toEntity(BillRequest request);
    BillResponse toResponse(Bill bill);
}
