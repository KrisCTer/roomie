package com.roomie.services.chat_service.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.corundumstudio.socketio.SocketIOServer;

@Configuration
public class SocketIOConfig {

    @Bean
    public SocketIOServer socketIOServer() {
        com.corundumstudio.socketio.Configuration conf = new com.corundumstudio.socketio.Configuration();

        conf.setHostname("0.0.0.0");
        conf.setPort(8099);
        conf.setOrigin("*");

        // ⭐️ Override JsonSupport — cách duy nhất đúng với 2.0.3
        conf.setJsonSupport(new CustomJsonSupport());

        return new SocketIOServer(conf);
    }
}
