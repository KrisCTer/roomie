package com.roomie.services.identity_service.mapper;

import com.roomie.services.identity_service.dto.request.UserCreationRequest;
import com.roomie.services.identity_service.dto.request.UserUpdateRequest;
import com.roomie.services.identity_service.dto.response.PermissionResponse;
import com.roomie.services.identity_service.dto.response.RoleResponse;
import com.roomie.services.identity_service.dto.response.UserResponse;
import com.roomie.services.identity_service.entity.Permission;
import com.roomie.services.identity_service.entity.Role;
import com.roomie.services.identity_service.entity.User;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.stream.Collectors;

@Component
@Primary
public class UserMapperManual implements UserMapper {

    @Override
    public User toUser(UserCreationRequest request) {
        if (request == null) {
            return null;
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setAuthProvider(request.getAuthProvider());
        return user;
    }

    @Override
    public UserResponse toUserResponse(User user) {
        if (user == null) {
            return null;
        }

        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setPhoneNumber(user.getPhoneNumber());
        response.setEmailVerified(user.isEmailVerified());
        response.setRoles(mapRoles(user.getRoles()));
        return response;
    }

    @Override
    public void updateUser(User user, UserUpdateRequest request) {
        if (user == null || request == null) {
            return;
        }

        if (request.getPassword() != null) {
            user.setPassword(request.getPassword());
        }
    }

    private Set<RoleResponse> mapRoles(Set<Role> roles) {
        if (roles == null) {
            return null;
        }

        return roles.stream()
                .map(this::toRoleResponse)
                .collect(Collectors.toSet());
    }

    private RoleResponse toRoleResponse(Role role) {
        if (role == null) {
            return null;
        }

        RoleResponse response = new RoleResponse();
        response.setName(role.getName());
        response.setDescription(role.getDescription());
        response.setPermissions(mapPermissions(role.getPermissions()));
        return response;
    }

    private Set<PermissionResponse> mapPermissions(Set<Permission> permissions) {
        if (permissions == null) {
            return null;
        }

        return permissions.stream()
                .map(this::toPermissionResponse)
                .collect(Collectors.toSet());
    }

    private PermissionResponse toPermissionResponse(Permission permission) {
        if (permission == null) {
            return null;
        }

        PermissionResponse response = new PermissionResponse();
        response.setName(permission.getName());
        response.setDescription(permission.getDescription());
        return response;
    }
}
