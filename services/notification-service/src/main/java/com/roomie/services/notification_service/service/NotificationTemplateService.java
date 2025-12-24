package com.roomie.services.notification_service.service;

import com.roomie.services.notification_service.entity.NotificationTemplate;
import com.roomie.services.notification_service.enums.NotificationType;
import com.roomie.services.notification_service.repository.NotificationTemplateRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class NotificationTemplateService {

    NotificationTemplateRepository templateRepository;

    private static final Pattern PLACEHOLDER_PATTERN = Pattern.compile("\\{\\{(\\w+)}}");

    /**
     * Render title từ template
     */
    public String renderTitle(NotificationType type, Map<String, Object> data, String language) {
        NotificationTemplate template = getTemplate(type, language);
        if (template == null || template.getTitleTemplate() == null) {
            return "Thông báo mới";
        }
        return replacePlaceholders(template.getTitleTemplate(), data);
    }

    /**
     * Render message từ template
     */
    public String renderMessage(NotificationType type, Map<String, Object> data, String language) {
        NotificationTemplate template = getTemplate(type, language);
        if (template == null || template.getMessageTemplate() == null) {
            return "";
        }
        return replacePlaceholders(template.getMessageTemplate(), data);
    }

    /**
     * Render short message từ template
     */
    public String renderShortMessage(NotificationType type, Map<String, Object> data, String language) {
        NotificationTemplate template = getTemplate(type, language);
        if (template == null || template.getShortMessageTemplate() == null) {
            return renderMessage(type, data, language);
        }
        return replacePlaceholders(template.getShortMessageTemplate(), data);
    }

    /**
     * Render action URL từ template
     */
    public String renderActionUrl(NotificationType type, Map<String, Object> data) {
        NotificationTemplate template = getTemplate(type, "vi");
        if (template == null || template.getActionUrlTemplate() == null) {
            return null;
        }
        return replacePlaceholders(template.getActionUrlTemplate(), data);
    }

    /**
     * Lấy template
     */
    private NotificationTemplate getTemplate(NotificationType type, String language) {
        return templateRepository
                .findByTypeAndLanguageAndIsActiveTrue(type, language)
                .orElseGet(() -> {
                    log.warn("No template found for type: {}, language: {}", type, language);
                    return null;
                });
    }

    /**
     * Replace placeholders trong template
     * Example: "Hello {{name}}" với data = {name: "John"} => "Hello John"
     */
    private String replacePlaceholders(String template, Map<String, Object> data) {
        if (template == null || data == null) {
            return template;
        }

        Matcher matcher = PLACEHOLDER_PATTERN.matcher(template);
        StringBuffer result = new StringBuffer();

        while (matcher.find()) {
            String key = matcher.group(1);
            Object value = data.get(key);
            String replacement = value != null ? value.toString() : "";
            matcher.appendReplacement(result, Matcher.quoteReplacement(replacement));
        }

        matcher.appendTail(result);
        return result.toString();
    }

    /**
     * Tạo template mẫu
     */
    public void createDefaultTemplates() {
        // Booking confirmed template
        createTemplateIfNotExists(
                NotificationType.BOOKING_CONFIRMED,
                "vi",
                "Đặt phòng được xác nhận! 🎉",
                "Chủ nhà đã xác nhận yêu cầu đặt phòng '{{propertyTitle}}'. Vui lòng hoàn tất thanh toán.",
                "Đặt phòng đã được chấp nhận",
                "/bookings/{{bookingId}}"
        );

        // Contract activated template
        createTemplateIfNotExists(
                NotificationType.CONTRACT_ACTIVATED,
                "vi",
                "Hợp đồng đã được kích hoạt! 🎉",
                "Hợp đồng thuê '{{propertyTitle}}' đã chính thức có hiệu lực từ ngày {{startDate}}",
                "Hợp đồng đã kích hoạt",
                "/contracts/{{contractId}}"
        );

        // Payment completed template
        createTemplateIfNotExists(
                NotificationType.PAYMENT_COMPLETED,
                "vi",
                "Thanh toán thành công! ✅",
                "Giao dịch {{amount}} VNĐ đã được xử lý thành công",
                "Thanh toán thành công",
                "/payments/{{paymentId}}"
        );

        log.info("Default notification templates created");
    }

    private void createTemplateIfNotExists(
            NotificationType type,
            String language,
            String titleTemplate,
            String messageTemplate,
            String shortMessageTemplate,
            String actionUrlTemplate
    ) {
        if (templateRepository.findByTypeAndLanguage(type, language).isEmpty()) {
            NotificationTemplate template = NotificationTemplate.builder()
                    .type(type)
                    .language(language)
                    .titleTemplate(titleTemplate)
                    .messageTemplate(messageTemplate)
                    .shortMessageTemplate(shortMessageTemplate)
                    .actionUrlTemplate(actionUrlTemplate)
                    .isActive(true)
                    .build();

            templateRepository.save(template);
        }
    }
}