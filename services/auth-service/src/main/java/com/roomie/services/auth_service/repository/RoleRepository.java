package com.roomie.services.auth_service.repository;

import com.roomie.services.auth_service.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role,String> {
}
