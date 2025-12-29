package com.roomie.services.property_service.repository;

import com.roomie.services.property_service.entity.Favorite;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends MongoRepository<Favorite, String> {

    Optional<Favorite> findByUserIdAndPropertyId(String userId, String propertyId);

    List<Favorite> findByUserId(String userId);

    List<Favorite> findByPropertyId(String propertyId);

    long countByPropertyId(String propertyId);

    boolean existsByUserIdAndPropertyId(String userId, String propertyId);

    void deleteByUserIdAndPropertyId(String userId, String propertyId);
}