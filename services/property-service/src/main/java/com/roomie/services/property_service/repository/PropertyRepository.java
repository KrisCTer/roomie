package com.roomie.services.property_service.repository;

import com.roomie.services.property_service.entity.Property;
import com.roomie.services.property_service.enums.ApprovalStatus;
import com.roomie.services.property_service.enums.PropertyStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PropertyRepository extends MongoRepository<Property, String> {
    List<Property> findByMonthlyRentBetween(BigDecimal min, BigDecimal max);

    List<Property> findByAddress_ProvinceIgnoreCase(String province);

    List<Property> findByStatus(ApprovalStatus status);

    List<Property> findAllByOwner_OwnerId(String ownerId);

    // simple amenities search (contains)
    List<Property> findByAmenities_OthersContaining(String amenity);

    List<Property> findByStatusAndPropertyStatus(ApprovalStatus status, PropertyStatus propertyStatus);
}