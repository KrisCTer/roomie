package com.roomie.services.property_service.mapper;

import com.roomie.services.property_service.dto.request.PropertyRequest;
import com.roomie.services.property_service.dto.response.PropertyResponse;
import com.roomie.services.property_service.entity.Property;
import com.roomie.services.property_service.entity.PropertyDocument;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.data.elasticsearch.core.geo.GeoPoint;

@Mapper(componentModel = "spring", imports = {GeoPoint.class})
public interface PropertyMapper {
    Property toEntity(PropertyRequest dto);

    PropertyResponse toResponse(Property entity);

    // ES document mapping (basic)
    @Mapping(target = "price", expression = "java(entity.getPrice() != null ? entity.getPrice().doubleValue() : null)")
    @Mapping(target = "addressLine", source = "address.fullAddress")
    @Mapping(target = "province", source = "address.province")
    @Mapping(target = "location", source = "address.location")
    PropertyDocument toDocument(Property entity);

    Property toEntityFromDocument(PropertyDocument doc);
}
