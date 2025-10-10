package com.roomie.services.identity_service.config;

import com.roomie.services.identity_service.entity.Role;
import com.roomie.services.identity_service.entity.User;
import com.roomie.services.identity_service.enums.UserRole;
import com.roomie.services.identity_service.repository.RoleRepository;
import com.roomie.services.identity_service.repository.UserRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashSet;

@Configuration
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AppConfiguration {
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;

    @NonFinal
    static final String ADMIN_USER_NAME = "admin";

    @NonFinal
    static final String ADMIN_PASSWORD = "admin";

    @Bean
    ApplicationRunner runner(UserRepository userRepository) {
        return args -> {
            if (userRepository.findByUsername(ADMIN_USER_NAME).isEmpty()) {
                Role tenantRole = roleRepository.save(Role.builder()
                        .name(UserRole.TENANT.name())
                        .description("Tenant role")
                        .build());

                Role landlordRole = roleRepository.save(Role.builder()
                        .name(UserRole.LANDLORD.name())
                        .description("Landlord role")
                        .build());

                Role adminRole = roleRepository.save(Role.builder()
                        .name(UserRole.ADMIN.name())
                        .description("Admin role")
                        .build());

                var roles = new HashSet<Role>();
                roles.add(adminRole);

                User user = User.builder()
                        .username(ADMIN_USER_NAME)
                        .emailVerified(true)
                        .password(passwordEncoder.encode(ADMIN_PASSWORD))
                        .roles(roles)
                        .isActive(true)
                        .build();

                userRepository.save(user);
                log.warn("admin user has been created with default password: admin, please change it");
            }
            log.info("Application initialization completed .....");
        };
    }
}
