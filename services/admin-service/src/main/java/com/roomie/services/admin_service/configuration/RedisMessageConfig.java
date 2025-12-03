package com.roomie.services.admin_service.configuration;

import com.roomie.services.admin_service.service.LogStreamService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.adapter.MessageListenerAdapter;

@Configuration
public class RedisMessageConfig {

    @Bean
    public ChannelTopic logChannel() {
        return new ChannelTopic(LogStreamService.CHANNEL);
    }

    @Bean
    public MessageListenerAdapter listenerAdapter(LogSubscriber subscriber) {
        return new MessageListenerAdapter(subscriber, "onMessage");
    }
}
