package com.roomie.services.ai_service.service;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Slf4j
public class GeminiService {

    @Value("${gemini.api.key}")
    String apiKey;

    @Value("${gemini.api.model:gemini-2.5-flash}")
    String model;

    // ⭐ FIX: Đổi từ v1 sang v1beta
    private final WebClient webClient = WebClient.builder()
            .baseUrl("https://generativelanguage.googleapis.com/v1beta")
            .build();

    private final Gson gson = new Gson();

    /**
     * Generate content using Gemini API
     */
    public String generateContent(String prompt, List<Map<String, String>> history) {
        try {
            log.info("🤖 Calling Gemini API with model: {}", model);

            // Build request body
            Map<String, Object> requestBody = buildRequestBody(prompt, history);

            String uriString = "/models/" + model + ":generateContent";

            // Call Gemini API
            String response = webClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .path(uriString)
                            .queryParam("key", apiKey)
                            .build())
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            // Parse response
            String result = parseResponse(response);
            log.info("✅ Generated content successfully");

            return result;

        } catch (WebClientResponseException e) {
            log.error("❌ Gemini API Error: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Gemini API Error: " + e.getMessage());
        } catch (Exception e) {
            log.error("❌ Error calling Gemini API", e);
            throw new RuntimeException("Failed to generate content: " + e.getMessage());
        }
    }

    /**
     * Build request body for Gemini API
     */
    private Map<String, Object> buildRequestBody(String prompt, List<Map<String, String>> history) {
        Map<String, Object> requestBody = new HashMap<>();
        List<Map<String, Object>> contents = new ArrayList<>();

        // System Prompt
        Map<String, Object> systemContent = new HashMap<>();
        systemContent.put("role", "user");
        Map<String, String> systemPart = new HashMap<>();
        systemPart.put("text", getSystemPrompt());
        systemContent.put("parts", List.of(systemPart));
        contents.add(systemContent);

        // System prompt acknowledgment
        Map<String, Object> systemAck = new HashMap<>();
        systemAck.put("role", "model");
        Map<String, String> ackPart = new HashMap<>();
        ackPart.put("text", "Được rồi, tôi đã hiểu nhiệm vụ của mình. Tôi sẵn sàng hỗ trợ bạn!");
        systemAck.put("parts", List.of(ackPart));
        contents.add(systemAck);

        // History
        if (history != null && !history.isEmpty()) {
            for (Map<String, String> msg : history) {
                Map<String, Object> content = new HashMap<>();
                String role = "assistant".equals(msg.get("role")) ? "model" : "user";
                content.put("role", role);

                Map<String, String> part = new HashMap<>();
                part.put("text", msg.get("content"));

                content.put("parts", List.of(part));
                contents.add(content);
            }
        }

        // Current user prompt
        Map<String, Object> currentContent = new HashMap<>();
        currentContent.put("role", "user");

        Map<String, String> currentPart = new HashMap<>();
        currentPart.put("text", prompt);

        currentContent.put("parts", List.of(currentPart));
        contents.add(currentContent);

        requestBody.put("contents", contents);

        // Generation config
        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("temperature", 0.7);
        generationConfig.put("topP", 0.95);
        generationConfig.put("maxOutputTokens", 2048);

        requestBody.put("generationConfig", generationConfig);

        return requestBody;
    }

    private String parseResponse(String responseJson) {
        try {
            JsonObject response = gson.fromJson(responseJson, JsonObject.class);

            if (response.has("candidates") && response.getAsJsonArray("candidates").size() > 0) {
                JsonObject candidate = response.getAsJsonArray("candidates").get(0).getAsJsonObject();

                if (candidate.has("content")) {
                    JsonObject content = candidate.getAsJsonObject("content");

                    if (content.has("parts") && content.getAsJsonArray("parts").size() > 0) {
                        JsonObject part = content.getAsJsonArray("parts").get(0).getAsJsonObject();

                        if (part.has("text")) {
                            return part.get("text").getAsString();
                        }
                    }
                }
            }
            throw new RuntimeException("Invalid response format from Gemini API");
        } catch (Exception e) {
            log.error("❌ Error parsing Gemini response", e);
            throw new RuntimeException("Failed to parse response: " + e.getMessage());
        }
    }

    private String getSystemPrompt() {
        return """
                Bạn là trợ lý AI của Roomie, nền tảng quản lý cho thuê bất động sản tại Việt Nam.
                
                Nhiệm vụ của bạn:
                1. Giúp người dùng tìm phòng trọ phù hợp
                2. Giải đáp thắc mắc về quy trình thuê nhà, hợp đồng, thanh toán
                3. Đưa ra gợi ý về các loại hình bất động sản dựa trên nhu cầu
                4. Giải thích các tính năng và cách sử dụng nền tảng
                5. Hỗ trợ các câu hỏi chung về việc thuê nhà tại Việt Nam
                
                Hướng dẫn:
                - Luôn thân thiện, chuyên nghiệp và súc tích
                - Trả lời bằng tiếng Việt hoặc tiếng Anh tùy theo ngôn ngữ người dùng sử dụng
                - Cung cấp lời khuyên thực tế, có thể hành động
                - Nếu không biết thông tin cụ thể về nền tảng, đề xuất liên hệ bộ phận hỗ trợ
                - Luôn ưu tiên an toàn người dùng và thực hành cho thuê hợp pháp
                """;
    }
}