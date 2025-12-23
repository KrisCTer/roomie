package com.roomie.services.billing_service.mapper;

import com.roomie.services.billing_service.dto.request.UtilityRequest;
import com.roomie.services.billing_service.dto.response.UtilityResponse;
import com.roomie.services.billing_service.entity.Utility;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UtilityMapper {

    Utility toEntity(UtilityRequest request);

    UtilityResponse toResponse(Utility utility);

    void updateEntity(UtilityRequest request, @MappingTarget Utility utility);
}