package com.roomie.services.auth_service.repository;

import com.roomie.services.auth_service.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User,String> {
    boolean existsByUsername(String username);

    Optional<User> findByUsername(String username);
}
