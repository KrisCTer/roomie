package com.roomie.services.identity_service.repository;

import com.roomie.services.identity_service.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role,String> {
}
