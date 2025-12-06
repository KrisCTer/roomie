package com.roomie.services.contract_service.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendOTPEmail(String toEmail, String otpCode, String role) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Mã OTP - Ký hợp đồng thuê nhà");

            String roleText = role.equals("tenant") ? "người thuê" : "chủ nhà";

            String emailBody = String.format(
                    "Xin chào,\n\n" +
                            "Bạn đang thực hiện ký hợp đồng thuê nhà với vai trò %s.\n\n" +
                            "Mã OTP của bạn là: %s\n\n" +
                            "Mã này có hiệu lực trong 5 phút.\n\n" +
                            "Nếu bạn không thực hiện hành động này, vui lòng bỏ qua email.\n\n" +
                            "Trân trọng,\n" +
                            "Roomie Team",
                    roleText,
                    otpCode
            );

            message.setText(emailBody);
            message.setFrom("noreply@roomie.com");

            mailSender.send(message);
            log.info("OTP email sent to {}", toEmail);

        } catch (Exception e) {
            log.error("Failed to send OTP email to {}", toEmail, e);
            throw new RuntimeException("Failed to send OTP email");
        }
    }
}