package com.roomie.services.contract_service.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class DigitalSignatureService {
    @Value("${digital.signature.secret}")
    String secret;

    public String sign(String payload) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(), "HmacSHA256"));
            byte[] s = mac.doFinal(payload.getBytes());
            return Base64.getEncoder().encodeToString(s);
        } catch (Exception ex) {
            throw new RuntimeException(ex);
        }
    }

    public boolean verify(String payload, String signature) {
        return sign(payload).equals(signature);
    }
}
