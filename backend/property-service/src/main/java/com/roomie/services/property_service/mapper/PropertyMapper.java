package com.roomie.services.property_service.mapper;

import com.roomie.services.property_service.dto.request.*;
import com.roomie.services.property_service.dto.response.*;
import com.roomie.services.property_service.entity.*;
import org.mapstruct.*;
import org.springframework.data.elasticsearch.core.geo.GeoPoint;

@Mapper(componentModel = "spring", imports = {GeoPoint.class})
public interface PropertyMapper {
    Property toEntity(PropertyRequest dto);

    PropertyResponse toResponse(Property entity);

    // ES document mapping (basic)
    @Mapping(target = "monthlyRent", expression = "java(entity.getMonthlyRent() != null ? entity.getMonthlyRent().doubleValue() : null)")
    @Mapping(target = "province", source = "address.province")
    @Mapping(target = "district", source = "address.district")
    @Mapping(target = "ward", source = "address.ward")
    @Mapping(target = "street", source = "address.street")
    @Mapping(target = "houseNumber", source = "address.houseNumber")
    @Mapping(target = "fullAddress", source = "address.fullAddress")
    @Mapping(target = "location", source = "address.location")
    PropertyDocument toDocument(Property entity);

    Property toEntityFromDocument(PropertyDocument doc);
}