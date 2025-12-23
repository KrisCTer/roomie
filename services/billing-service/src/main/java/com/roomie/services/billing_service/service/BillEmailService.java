package com.roomie.services.billing_service.service;

import com.roomie.services.billing_service.dto.response.ContractResponse;
import com.roomie.services.billing_service.dto.response.property.PropertyResponse;
import com.roomie.services.billing_service.entity.Bill;
import com.roomie.services.billing_service.exception.AppException;
import com.roomie.services.billing_service.exception.ErrorCode;
import com.roomie.services.billing_service.repository.BillRepository;
import com.roomie.services.billing_service.repository.httpclient.ContractClient;
import com.roomie.services.billing_service.repository.httpclient.PropertyClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/**
 * Bill Email Service
 * Handles sending invoice emails to tenants
 */
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Slf4j
public class BillEmailService {
    final JavaMailSender mailSender;
    final BillRepository billRepository;
    final BillPdfGeneratorService pdfGeneratorService;
    final ContractClient contractClient;
    final PropertyClient propertyClient;

    @Value("${spring.mail.username}")
    String fromEmail;

    /**
     * Send invoice email to tenant
     */
    public void sendInvoiceEmail(String billId, String recipientEmail) {
        try {
            // Get bill
            Bill bill = billRepository.findById(billId)
                    .orElseThrow(() -> new AppException(ErrorCode.BILL_NOT_FOUND));

            // Get contract
            ContractResponse contract = contractClient.get(bill.getContractId())
                    .getBody()
                    .getResult();

            // Get property
            PropertyResponse property = null;
            try {
                property = propertyClient.get(contract.getPropertyId())
                        .getResult();
            } catch (Exception e) {
                log.warn("Could not fetch property details: {}", e.getMessage());
            }

            // Determine recipient email
            String toEmail = recipientEmail;
            if (toEmail == null || toEmail.isBlank()) {
                // TODO: Get tenant email from contract/profile service
                toEmail = "tenant@example.com"; // Placeholder
            }

            // Generate PDF
            byte[] pdfBytes = pdfGeneratorService.generateInvoicePdf(bill, contract, property);

            // Send email
            sendEmailWithAttachment(
                    toEmail,
                    buildEmailSubject(bill),
                    buildEmailBody(bill, property),
                    pdfBytes,
                    "invoice_" + billId.substring(0, 12) + ".pdf"
            );

            // Update bill with emailedAt timestamp
            bill.setUpdatedAt(Instant.now());
            billRepository.save(bill);

            log.info("Invoice email sent successfully for bill: {}", billId);

        } catch (Exception e) {
            log.error("Error sending invoice email for bill: {}", billId, e);
            throw new RuntimeException("Failed to send invoice email: " + e.getMessage());
        }
    }

    /**
     * Send email with PDF attachment
     */
    private void sendEmailWithAttachment(
            String to,
            String subject,
            String body,
            byte[] attachment,
            String attachmentName
    ) throws MessagingException {

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(body, true); // true = HTML

        // Attach PDF
        helper.addAttachment(attachmentName, () ->
                new java.io.ByteArrayInputStream(attachment));

        mailSender.send(message);
    }

    /**
     * Build email subject
     */
    private String buildEmailSubject(Bill bill) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM/yyyy");
        String month = bill.getBillingMonth().format(formatter);
        return String.format("Hóa đơn tháng %s - Roomie Platform", month);
    }

    /**
     * Build email body (HTML)
     */
    private String buildEmailBody(Bill bill, PropertyResponse property) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");

        String propertyName = property != null ? property.getTitle() : "N/A";
        String billingMonth = bill.getBillingMonth().format(formatter);
        String dueDate = bill.getDueDate().format(formatter);
        String totalAmount = formatCurrency(bill.getTotalAmount());

        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); 
                              color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; 
                               border-left: 4px solid #667eea; }
                    .highlight { color: #667eea; font-weight: bold; font-size: 24px; }
                    .button { display: inline-block; padding: 12px 30px; background: #667eea; 
                             color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🏠 ROOMIE PLATFORM</h1>
                        <p>Hóa đơn thanh toán</p>
                    </div>
                    <div class="content">
                        <p>Xin chào,</p>
                        <p>Chúng tôi gửi bạn hóa đơn thanh toán cho tháng <strong>%s</strong>.</p>
                        
                        <div class="info-box">
                            <p><strong>🏠 Bất động sản:</strong> %s</p>
                            <p><strong>📅 Kỳ thanh toán:</strong> %s</p>
                            <p><strong>⏰ Hạn thanh toán:</strong> %s</p>
                            <p><strong>💰 Tổng tiền:</strong> <span class="highlight">%s</span></p>
                        </div>

                        <p>Vui lòng xem chi tiết trong file PDF đính kèm.</p>

                        <center>
                            <a href="https://roomie.vn/bills" class="button">Xem chi tiết</a>
                        </center>

                        <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi.</p>
                        
                        <p>Trân trọng,<br><strong>Roomie Platform Team</strong></p>
                    </div>
                    <div class="footer">
                        <p>© 2025 Roomie Platform. All rights reserved.</p>
                        <p>Email: support@roomie.vn | Phone: +84 28 1234 5678</p>
                    </div>
                </div>
            </body>
            </html>
            """, billingMonth, propertyName, billingMonth, dueDate, totalAmount);
    }

    /**
     * Format currency
     */
    private String formatCurrency(Object value) {
        if (value == null) return "0 đ";

        long amount = 0;
        if (value instanceof java.math.BigDecimal) {
            amount = ((java.math.BigDecimal) value).longValue();
        } else if (value instanceof Number) {
            amount = ((Number) value).longValue();
        }

        return String.format("%,d đ", amount);
    }
}