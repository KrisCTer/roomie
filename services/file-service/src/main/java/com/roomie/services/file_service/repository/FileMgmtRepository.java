package com.roomie.services.file_service.repository;

import com.roomie.services.file_service.entity.FileMgmt;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FileMgmtRepository extends MongoRepository<FileMgmt, String> {
    Optional<FileMgmt> findByFileId(String fileId);
    List<FileMgmt> findByEntityTypeAndEntityIdAndDeletedFalse(String entityType, Long entityId);
    List<FileMgmt> findByOwnerIdAndDeletedFalse(String ownerId);
}
