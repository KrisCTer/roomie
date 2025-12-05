package com.roomie.services.chat_service.configuration;

import com.corundumstudio.socketio.protocol.JacksonJsonSupport;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.lang.reflect.Field;

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
