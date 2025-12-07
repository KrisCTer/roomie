package com.roomie.services.chat_service.configuration;

import com.corundumstudio.socketio.protocol.JacksonJsonSupport;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

public class CustomJsonSupport extends JacksonJsonSupport {

    @Override
    protected void init(ObjectMapper mapper) {
        // register Java 8 Time support
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        // VERY IMPORTANT – phải gọi super.init()
        super.init(mapper);
    }
}
