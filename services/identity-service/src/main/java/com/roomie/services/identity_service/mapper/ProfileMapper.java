package com.roomie.services.identity_service.mapper;

import com.roomie.services.identity_service.dto.request.ProfileCreationRequest;
import com.roomie.services.identity_service.dto.request.UserCreationRequest;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ProfileMapper {
    ProfileCreationRequest toProfileCreationRequest(UserCreationRequest request);
}