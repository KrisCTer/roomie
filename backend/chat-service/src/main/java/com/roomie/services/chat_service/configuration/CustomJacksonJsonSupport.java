package com.roomie.services.chat_service.configuration;

import java.lang.reflect.Field;

import com.corundumstudio.socketio.protocol.JacksonJsonSupport;
import com.fasterxml.jackson.databind.ObjectMapper;

public class CustomJacksonJsonSupport extends JacksonJsonSupport {

    public CustomJacksonJsonSupport(ObjectMapper objectMapper) {
        super();

        try {
            Field field = JacksonJsonSupport.class.getDeclaredField("objectMapper");
            field.setAccessible(true);
            field.set(this, objectMapper);
        } catch (Exception e) {
            throw new RuntimeException("Failed to set custom objectMapper", e);
        }
    }
}
