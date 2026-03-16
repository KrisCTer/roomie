package com.roomie.services.property_service.repository;

import com.roomie.services.property_service.entity.PropertyDocument;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PropertySearchRepository extends ElasticsearchRepository<PropertyDocument, String> {
    List<PropertyDocument> findByTitleContainingOrDescriptionContaining(String title, String description);

    List<PropertyDocument> findByProvince(String province);
}