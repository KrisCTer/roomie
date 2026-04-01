package com.roomie.services.profile_service.configuration;

import com.roomie.services.profile_service.mapper.UserProfileMapper;
import org.mapstruct.factory.Mappers;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MapperConfig {

    @Bean
    public UserProfileMapper userProfileMapper() {
        return Mappers.getMapper(UserProfileMapper.class);
    }
}
