package com.roomie.services.contract_service.configuration;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class KafkaConfig {

    @Bean
    public NewTopic contractCreated() {
        return new NewTopic("contract.created", 1, (short) 1);
    }

    @Bean
    public NewTopic contractSigned() {
        return new NewTopic("contract.signed", 1, (short) 1);
    }

    @Bean
    public NewTopic contractPendingPayment() {
        return new NewTopic("contract.pending_payment", 1, (short) 1);
    }

    @Bean
    public NewTopic contractActivated() {
        return new NewTopic("contract.activated", 1, (short) 1);
    }

    @Bean
    public NewTopic contractTerminated() {
        return new NewTopic("contract.terminated", 1, (short) 1);
    }

    @Bean
    public NewTopic contractExpired() {
        return new NewTopic("contract.expired", 1, (short) 1);
    }
}