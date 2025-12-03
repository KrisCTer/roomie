package com.roomie.services.contract_service.configuration;

import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.kafka.support.serializer.JsonSerializer;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class KafkaConfig {
    @Bean
    public NewTopic contractCreated() {
        return new NewTopic("contract.created", 1, (short)1);
    }
    @Bean
    public NewTopic contractSigned() {
        return new NewTopic("contract.signed", 1, (short)1);
    }
    @Bean
    public NewTopic contractPendingPayment() {
        return new NewTopic("contract.pending_payment", 1, (short)1);
    }
    @Bean
    public NewTopic contractActivated() {
        return new NewTopic("contract.activated", 1, (short)1);
    }
}