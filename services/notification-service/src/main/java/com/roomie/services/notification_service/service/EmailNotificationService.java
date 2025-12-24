package com.roomie.services.notification_service.service;

import com.roomie.services.notification_service.entity.Notification;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Slf4j
public class EmailNotificationService {
    final JavaMailSender mailSender;
    final TemplateEngine templateEngine;

    @Value("${notification.email.from:noreply@roomie.com}")
    String fromEmail;

    @Value("${notification.email.enabled:true}")
    boolean emailEnabled;

    /**
     * Gửi notification email (async)
     */
    @Async
    public void sendNotificationEmail(Notification notification) {
        if (!emailEnabled) {
            log.debug("Email notifications disabled");
            return;
        }

        try {
            // Get user email from notification metadata or user service
            String toEmail = getUserEmail(notification.getUserId());
            if (toEmail == null) {
                log.warn("No email found for user: {}", notification.getUserId());
                return;
            }

            // Build email content
            String subject = buildEmailSubject(notification);
            String body = buildEmailBody(notification);

            // Send email
            sendHtmlEmail(toEmail, subject, body);

            log.info("Sent email notification to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send email notification", e);
        }
    }

    /**
     * Gửi HTML email
     */
    private void sendHtmlEmail(String to, String subject, String htmlBody) throws Exception {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlBody, true);

        mailSender.send(message);
    }

    /**
     * Gửi simple text email
     */
    @SuppressWarnings("unused")
    private void sendSimpleEmail(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);

        mailSender.send(message);
    }

    /**
     * Build email subject
     */
    private String buildEmailSubject(Notification notification) {
        return "[Roomie] " + notification.getTitle();
    }

    /**
     * Build email body using Thymeleaf template
     */
    private String buildEmailBody(Notification notification) {
        Context context = new Context();
        context.setVariable("title", notification.getTitle());
        context.setVariable("message", notification.getMessage());
        context.setVariable("actionUrl", notification.getActionUrl());
        context.setVariable("actionText", notification.getActionText());

        // Use template based on notification type
        String templateName = getTemplateName(notification.getType().name());

        return templateEngine.process(templateName, context);
    }

    /**
     * Get email template name based on notification type
     */
    private String getTemplateName(String typeName) {
        return switch (typeName) {
            case "BOOKING_CONFIRMED" -> "email/booking-confirmed";
            case "CONTRACT_ACTIVATED" -> "email/contract-activated";
            case "PAYMENT_COMPLETED" -> "email/payment-completed";
            default -> "email/notification-default";
        };
    }

    /**
     * Get user email (should call user service)
     */
    private String getUserEmail(String userId) {
        // TODO: Call user/profile service to get email
        // For now, return a mock email
        return userId + "@example.com";
    }
}