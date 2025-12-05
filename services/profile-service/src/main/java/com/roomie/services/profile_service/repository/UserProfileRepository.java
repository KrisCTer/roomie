package com.roomie.services.profile_service.repository;

import com.roomie.services.profile_service.entity.UserProfile;
import feign.Param;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserProfileRepository extends Neo4jRepository<UserProfile, String> {
    Optional<UserProfile> findByUserId(String userId);
    @Query("""
    MATCH (u:user_profile)
    WHERE 
        toLower(u.username) CONTAINS toLower($keyword)
        OR toLower(u.email) CONTAINS toLower($keyword)
        OR toLower(u.firstName) CONTAINS toLower($keyword)
        OR toLower(u.lastName) CONTAINS toLower($keyword)
        OR toLower(u.phoneNumber) CONTAINS toLower($keyword)
    RETURN u
""")
    List<UserProfile> searchUsers(@Param("keyword") String keyword);
    void deleteByUserId(String userId);
}