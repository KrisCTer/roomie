package com.roomie.services.property_service.configuration;

import com.roomie.services.property_service.entity.Owner;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class AuthUtil {

    public static Owner getCurrentOwner() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }

        // Giả sử JWT chứa các claim: userId, name, email, phone
        String userId = auth.getName(); // thường là sub claim
        String name = auth.getAuthorities().toString(); // có thể lấy từ claim khác
        String email = auth.getPrincipal().toString();

        Owner owner = new Owner();
        owner.setOwnerId(userId);
//        owner.setName(name);
//        owner.setEmail(email);
        // nếu phone có trong JWT claim thì set
        return owner;
    }
}
