package com.roomie.services.identity_service.repository;

import com.roomie.services.identity_service.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {
    boolean existsByUsername(String username);

    Optional<User> findByUsername(String username);

    @Query("""
              SELECT DISTINCT u
              FROM User u
              LEFT JOIN FETCH u.roles r
              LEFT JOIN FETCH r.permissions
              WHERE u.username = :username
            """)
    Optional<User> findByUsernameWithRoles(@Param("username") String username);

    @Query("""
                SELECT u FROM User u
                LEFT JOIN FETCH u.roles
                WHERE u.id = :id
            """)
    Optional<User> findByIdWithRoles(@Param("id") String id);
}
