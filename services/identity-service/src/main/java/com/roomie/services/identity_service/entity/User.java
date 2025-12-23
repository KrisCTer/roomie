package com.roomie.services.identity_service.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(name = "username", unique = true, columnDefinition = "VARCHAR(255) COLLATE utf8mb4_unicode_ci")
    String username;
    String password;

    @Column(name = "email", unique = true, columnDefinition = "VARCHAR(255) COLLATE utf8mb4_unicode_ci")
    String email;

    @Column(name = "email_verified", nullable = false, columnDefinition = "boolean default false")
    boolean emailVerified;

    @Column(name = "phone_number", unique = true, columnDefinition = "VARCHAR(15) COLLATE utf8mb4_unicode_ci")
    String phoneNumber;

    @Column(name = "is_active",nullable = false)
    Boolean isActive = true;

    @Column(name = "is_banned",nullable = false)
    Boolean isBanned = false;

    @Column(name="provider")
    private String authProvider;

    @ManyToMany
    Set<Role> roles;
}
