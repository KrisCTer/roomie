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
    @Mapping(target = "price", expression = "java(entity.getPrice() != null ? entity.getPrice().doubleValue() : null)")
    @Mapping(target = "province", source = "address.province")
    @Mapping(target = "location", source = "address.location")
    PropertyDocument toDocument(Property entity);

    Property toEntityFromDocument(PropertyDocument doc);
}