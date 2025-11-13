package com.roomie.services.property_service.repository;

import com.roomie.services.property_service.entity.Property;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PropertyRepository extends MongoRepository<Property, String> {
    List<Property> findByPriceBetween(java.math.BigDecimal min, java.math.BigDecimal max);

    List<Property> findByAddress_ProvinceIgnoreCase(String province);

    // simple amenities search (contains)
    List<Property> findByAmenities_OthersContaining(String amenity);
}