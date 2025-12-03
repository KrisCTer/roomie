package com.roomie.services.chat_service.service;

import com.roomie.services.chat_service.dto.request.IntrospectRequest;
import com.roomie.services.chat_service.dto.response.IntrospectResponse;
import com.roomie.services.chat_service.repository.httpclient.IdentityClient;
import feign.FeignException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class IdentityService {
    IdentityClient identityClient;
    public IntrospectResponse  introspect(IntrospectRequest introspectRequest) {
        try{
            var result = identityClient.introspect(introspectRequest).getResult();
            if(Objects.isNull(result)){
                return IntrospectResponse.builder().valid(false).build();
            }
            return result;
        } catch(FeignException e){
            log.error("introspect failed: {}", e.getMessage(),e);
            return IntrospectResponse.builder()
                    .userId(null)
                    .valid(false)
                    .build();
        }
    }
}
