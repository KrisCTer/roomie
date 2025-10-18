package com.roomie.services.profile_service.configuration;

import org.neo4j.driver.Driver;
import org.neo4j.driver.GraphDatabase;
import org.neo4j.driver.AuthTokens;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.neo4j.core.transaction.Neo4jTransactionManager;
import org.springframework.data.neo4j.repository.config.EnableNeo4jRepositories;

@Configuration
@EnableNeo4jRepositories(basePackages = "com.roomie.services.profile_service.repository")
public class Neo4jConfig {

    @Bean
    public Driver driver() {
        return GraphDatabase.driver(
                "bolt://localhost:7687",
                AuthTokens.basic("neo4j", "roomie123") // đổi user/password của bạn
        );
    }

    @Bean
    public Neo4jTransactionManager transactionManager(Driver driver) {
        return new Neo4jTransactionManager(driver);
    }
}