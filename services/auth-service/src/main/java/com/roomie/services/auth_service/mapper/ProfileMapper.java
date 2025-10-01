package com.roomie.services.auth_service.mapper;

import com.roomie.services.auth_service.dto.request.ProfileCreationRequest;
import com.roomie.services.auth_service.dto.request.UserCreationRequest;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ProfileMapper {
    ProfileCreationRequest toProfileCreationRequest(UserCreationRequest request);
}