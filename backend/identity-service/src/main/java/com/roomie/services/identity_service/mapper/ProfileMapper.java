package com.roomie.services.identity_service.mapper;

import com.roomie.services.identity_service.dto.request.ProfileCreationRequest;
import com.roomie.services.identity_service.dto.request.UserCreationRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProfileMapper {
    @Mapping(target = "permanentAddress", source = "location")
    ProfileCreationRequest toProfileCreationRequest(UserCreationRequest request);
}