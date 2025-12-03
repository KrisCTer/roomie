package com.roomie.services.contract_service.service;

import com.roomie.services.contract_service.dto.response.profile.UserProfileResponse;
import com.roomie.services.contract_service.dto.response.property.PropertyResponse;
import com.roomie.services.contract_service.entity.Contract;
import com.roomie.services.contract_service.repository.httpclient.ProfileClient;
import com.roomie.services.contract_service.repository.httpclient.PropertyClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.text.NumberFormat;
import java.time.Instant;
import java.time.LocalDate;
import java.time.Period;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ContractTemplateService {
    ProfileClient userProfileClient;
    PropertyClient propertyClient;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter
            .ofPattern("dd/MM/yyyy")
            .withZone(ZoneId.of("Asia/Ho_Chi_Minh"));

    private static final NumberFormat CURRENCY_FORMATTER =
            NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));

    private static final DateTimeFormatter DATETIME_FORMATTER =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")
                    .withZone(ZoneId.of("Asia/Ho_Chi_Minh"));

    private static final DateTimeFormatter DAY_ONLY =
            DateTimeFormatter.ofPattern("dd").withZone(ZoneId.of("Asia/Ho_Chi_Minh"));

    /**
     * Template hợp đồng PREVIEW - Bản xem trước (không có chữ ký)
     */
    public String buildPreviewContractHtml(Contract contract) {
        return buildContractHtml(contract, false);
    }

    /**
     * Template hợp đồng FINAL - Bản đầy đủ (có chữ ký)
     */
    public String buildFinalContractHtml(Contract contract) {
        return buildContractHtml(contract, true);
    }

    /**
     * Template hợp đồng chính (có thể là preview hoặc final)
     */
    public String buildRentalContractHtml(Contract contract) {
        return buildContractHtml(contract, false);
    }

    /**
     * Main builder - tạo HTML với hoặc không có chữ ký
     */
    private String buildContractHtml(Contract contract, boolean includeSignatures) {
        // Fetch data from services
        UserProfileResponse tenant = fetchUserProfile(contract.getTenantId());
        UserProfileResponse landlord = fetchUserProfile(contract.getLandlordId());
        PropertyResponse property = fetchProperty(contract.getPropertyId());

        // Format dates
        String startDate = contract.getStartDate() != null
                ? DATE_FORMATTER.format(contract.getStartDate())
                : "___________";
        String paymentDate = contract.getStartDate() != null
                ? DAY_ONLY.format(contract.getStartDate())
                : "___________";
        String endDate = contract.getEndDate() != null
                ? DATE_FORMATTER.format(contract.getEndDate())
                : "___________";

        String deposit = property != null && property.getRentalDeposit() != null
                ? CURRENCY_FORMATTER.format(property.getRentalDeposit())
                : "___________";

        String monthlyRent = property != null && property.getMonthlyRent() != null
                ? CURRENCY_FORMATTER.format(property.getMonthlyRent())
                : "___________";

        // Landlord info
        String landlordName = landlord != null ? landlord.getLastName() + " " + landlord.getFirstName() : "___________";
        String landlordId = landlord != null && landlord.getIdCardNumber() != null
                ? landlord.getIdCardNumber() : "___________";
        String landlordPhone = landlord != null && landlord.getPhoneNumber() != null
                ? landlord.getPhoneNumber() : "___________";
        String landlordAddress = landlord != null && landlord.getPermanentAddress() != null
                ? landlord.getPermanentAddress() : "___________";

        // Tenant info
        String tenantName = tenant != null ? tenant.getLastName() + " " + tenant.getFirstName() : "___________";
        String tenantId = tenant != null && tenant.getIdCardNumber() != null
                ? tenant.getIdCardNumber() : "___________";
        String tenantPhone = tenant != null && tenant.getPhoneNumber() != null
                ? tenant.getPhoneNumber() : "___________";
        String tenantAddress = tenant != null && tenant.getPermanentAddress() != null
                ? tenant.getPermanentAddress() : "___________";

        // Property info
        String propertyAddress = property != null && property.getAddress() != null
                ? property.getAddress().getFullAddress() : "___________";
        String propertySize = property != null && property.getSize() != null
                ? String.format("%.2f", property.getSize()) : "___________";

        String propertyType = property != null && property.getPropertyType() != null
                ? translatePropertyType(property.getPropertyType().toString()) : "___________";
        String propertyStructure = buildPropertyStructure(property);

        String monthsDuration = calculateMonthsDuration(contract.getStartDate(), contract.getEndDate());
        String currentDate = LocalDate.now().format(DateTimeFormatter.ofPattern("dd 'tháng' MM 'năm' yyyy"));
        String createdDateTime = Instant.now().atZone(ZoneId.of("Asia/Ho_Chi_Minh"))
                .format(DATETIME_FORMATTER);

        // Build signature section
        String signatureSection = includeSignatures
                ? buildSignatureSection(contract, landlordName, tenantName)
                : buildPreviewSignatureSection(landlordName, tenantName);

        return """
                <!DOCTYPE html>
                <html lang="vi">
                <head>
                    <meta charset="UTF-8">
                    <style>
                        @page {
                            size: A4;
                            margin: 2cm;
                        }
                        body {
                            font-family: 'Times New Roman', serif;
                            font-size: 13pt;
                            line-height: 1.6;
                            color: #000;
                        }
                        .watermark {
                            position: fixed;
                            top: 50%%;
                            left: 50%%;
                            transform: translate(-50%%, -50%%) rotate(-45deg);
                            font-size: 80pt;
                            color: rgba(200, 200, 200, 0.3);
                            font-weight: bold;
                            z-index: -1;
                            pointer-events: none;
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 30px;
                        }
                        .header h1 {
                            font-size: 16pt;
                            font-weight: bold;
                            text-transform: uppercase;
                            margin: 10px 0;
                        }
                        .header p {
                            font-style: italic;
                            font-size: 12pt;
                            margin: 5px 0;
                        }
                        .section {
                            margin: 20px 0;
                            text-align: justify;
                        }
                        .section h2 {
                            font-size: 14pt;
                            font-weight: bold;
                            margin: 15px 0 10px 0;
                        }
                        .party {
                            margin-left: 20px;
                            margin-bottom: 10px;
                        }
                        .signature-section {
                            margin-top: 50px;
                            display: flex;
                            justify-content: space-between;
                        }
                        .signature-box {
                            width: 45%%;
                            text-align: center;
                        }
                        .signature-box p {
                            margin: 5px 0;
                        }
                        .signature-space {
                            height: 80px;
                            position: relative;
                        }
                        .digital-signature {
                            font-family: 'Brush Script MT', cursive;
                            font-size: 24pt;
                            color: #000080;
                            margin: 10px 0;
                        }
                        .signature-badge {
                            display: inline-block;
                            background: #28a745;
                            color: white;
                            padding: 5px 15px;
                            border-radius: 20px;
                            font-size: 10pt;
                            margin-top: 5px;
                        }
                        .signature-info {
                            font-size: 10pt;
                            color: #666;
                            font-style: italic;
                        }
                        .bold {
                            font-weight: bold;
                        }
                        .indent {
                            margin-left: 30px;
                        }
                        .footer {
                            margin-top: 30px;
                            font-size: 11pt;
                            font-style: italic;
                            text-align: center;
                        }
                    </style>
                </head>
                <body>
                    %s
                    
                    <div class="header">
                        <p>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                        <p class="bold">Độc lập - Tự do - Hạnh phúc</p>
                        <p style="margin-top: 20px;">———————————————</p>
                        <h1>HỢP ĐỒNG THUÊ NHÀ</h1>
                        <p>Số: %s</p>
                    </div>
                
                    <div class="section">
                        <p>- Căn cứ Bộ luật Dân sự số 91/2015/QH13 được Quốc hội thông qua ngày 24/11/2015;</p>
                        <p>- Căn cứ Luật Nhà ở số 65/2014/QH13 được Quốc hội thông qua ngày 25/11/2014;</p>
                        <p>- Căn cứ vào nhu cầu và khả năng của các bên;</p>
                        <p style="margin-top: 15px;">Hôm nay, ngày %s, tại TP. Hồ Chí Minh, chúng tôi gồm:</p>
                    </div>
                
                    <div class="section">
                        <h2>BÊN CHO THUÊ (Bên A):</h2>
                        <div class="party">
                            <p><span class="bold">Họ và tên:</span> %s</p>
                            <p><span class="bold">Số CMND/CCCD:</span> %s</p>
                            <p><span class="bold">Hộ khẩu thường trú:</span> %s</p>
                            <p><span class="bold">Số điện thoại:</span> %s</p>
                        </div>
                    </div>
                
                    <div class="section">
                        <h2>BÊN THUÊ (Bên B):</h2>
                        <div class="party">
                            <p><span class="bold">Họ và tên:</span> %s</p>
                            <p><span class="bold">Số CMND/CCCD:</span> %s</p>
                            <p><span class="bold">Hộ khẩu thường trú:</span> %s</p>
                            <p><span class="bold">Số điện thoại:</span> %s</p>
                        </div>
                    </div>
                
                    <div class="section">
                        <p>Sau khi bàn bạc, hai bên thống nhất ký kết hợp đồng với các điều khoản sau:</p>
                    </div>
                
                    <div class="section">
                        <h2>ĐIỀU 1: ĐỐI TƯỢNG CỦA HỢP ĐỒNG</h2>
                        <p>Bên A đồng ý cho Bên B thuê nhà ở tại địa chỉ:</p>
                        <div class="indent">
                            <p><span class="bold">Địa chỉ:</span> %s</p>
                            <p><span class="bold">Mã tài sản:</span> %s</p>
                            <p><span class="bold">Diện tích:</span> %s m²</p>
                            <p><span class="bold">Kết cấu:</span> %s</p>
                        </div>
                    </div>
                
                    <div class="section">
                        <h2>ĐIỀU 2: THỜI HẠN THUÊ</h2>
                        <p>Thời hạn thuê là: <span class="bold">%s</span> tháng</p>
                        <p>Bắt đầu từ ngày: <span class="bold">%s</span></p>
                        <p>Kết thúc vào ngày: <span class="bold">%s</span></p>
                    </div>
                
                    <div class="section">
                        <h2>ĐIỀU 3: GIÁ THUÊ VÀ PHƯƠNG THỨC THANH TOÁN</h2>
                        <p><span class="bold">3.1.</span> Giá thuê nhà: <span class="bold">%s/tháng</span></p>
                        <p class="indent">(Bằng chữ: %s)</p>
                        <p><span class="bold">3.2.</span> Phương thức thanh toán: Bên B thanh toán cho Bên A bằng tiền mặt/chuyển khoản vào ngày <span class="bold">%s/tháng</span> hàng tháng.</p>
                        <p><span class="bold">3.3.</span> Tiền đặt cọc: <span class="bold">%s</span>, sẽ được hoàn trả khi hết hạn hợp đồng nếu Bên B không vi phạm các điều khoản.</p>
                    </div>
                
                    <div class="section">
                        <h2>ĐIỀU 4: TRÁCH NHIỆM CỦA BÊN CHO THUÊ</h2>
                        <p><span class="bold">4.1.</span> Giao nhà và trang thiết bị (nếu có) cho Bên B đúng thời hạn đã thỏa thuận.</p>
                        <p><span class="bold">4.2.</span> Bảo đảm quyền sử dụng của Bên B trong suốt thời gian thuê.</p>
                        <p><span class="bold">4.3.</span> Bảo trì, sửa chữa các hư hỏng về kết cấu của nhà.</p>
                    </div>
                
                    <div class="section">
                        <h2>ĐIỀU 5: TRÁCH NHIỆM CỦA BÊN THUÊ</h2>
                        <p><span class="bold">5.1.</span> Sử dụng nhà đúng mục đích, giữ gìn nhà và trang thiết bị như tài sản của mình.</p>
                        <p><span class="bold">5.2.</span> Thanh toán đầy đủ và đúng hạn tiền thuê nhà.</p>
                        <p><span class="bold">5.3.</span> Thanh toán các chi phí điện, nước, internet và các dịch vụ khác phát sinh.</p>
                        <p><span class="bold">5.4.</span> Không được tự ý sửa chữa, cải tạo nhà khi chưa có sự đồng ý của Bên A.</p>
                        <p><span class="bold">5.5.</span> Trả nhà cho Bên A khi hết hạn hợp đồng.</p>
                    </div>
                
                    <div class="section">
                        <h2>ĐIỀU 6: ĐIỀU KHOẢN CHUNG</h2>
                        <p><span class="bold">6.1.</span> Hai bên cam kết thực hiện đúng các điều khoản đã thỏa thuận.</p>
                        <p><span class="bold">6.2.</span> Trong quá trình thực hiện, nếu có vướng mắc, hai bên cùng bàn bạc giải quyết trên tinh thần hợp tác.</p>
                        <p><span class="bold">6.3.</span> Hợp đồng có hiệu lực kể từ ngày ký.</p>
                        <p><span class="bold">6.4.</span> Hợp đồng được lập thành 02 bản có giá trị pháp lý như nhau, mỗi bên giữ 01 bản.</p>
                    </div>
                
                    %s
                
                    <div class="footer">
                        <p>Hợp đồng được tạo tự động bởi hệ thống Roomie</p>
                        <p>Mã hợp đồng: %s | Ngày tạo: %s</p>
                    </div>
                </body>
                </html>
                """.formatted(
                // Watermark for preview
                includeSignatures ? "" : "<div class=\"watermark\">BẢN XEM TRƯỚC</div>",
                // Header
                contract.getId() != null ? contract.getId() : "DRAFT",
                currentDate,
                // Bên A - Landlord
                landlordName,
                landlordId,
                landlordAddress,
                landlordPhone,
                // Bên B - Tenant
                tenantName,
                tenantId,
                tenantAddress,
                tenantPhone,
                // Property
                propertyAddress,
                contract.getPropertyId() != null ? contract.getPropertyId() : "___________",
                propertySize,
                propertyStructure,
                // Duration
                monthsDuration,
                startDate,
                endDate,
                // Payment
                monthlyRent,
                convertNumberToWords(property != null ? property.getRentalDeposit() : null),
                paymentDate,
                deposit,
                // Signature section
                signatureSection,
                // Footer
                contract.getId() != null ? contract.getId() : "DRAFT",
                createdDateTime
        );
    }

    /**
     * Build signature section for PREVIEW (no actual signatures)
     */
    private String buildPreviewSignatureSection(String landlordName, String tenantName) {
        return """
    <div class="signature-section">
        <div class="signature-box">
            <p class="bold">ĐẠI DIỆN BÊN CHO THUÊ</p>
            <p style="font-style: italic; font-size: 11pt;">(Ký, ghi rõ họ tên)</p>
            <div class="signature-space">
                <p style="color: #999; margin-top: 30px;">Chưa ký</p>
            </div>
            <p>%s</p>
        </div>
        <div class="signature-box">
            <p class="bold">ĐẠI DIỆN BÊN THUÊ</p>
            <p style="font-style: italic; font-size: 11pt;">(Ký, ghi rõ họ tên)</p>
            <div class="signature-space">
                <p style="color: #999; margin-top: 30px;">Chưa ký</p>
            </div>
            <p>%s</p>
        </div>
    </div>
        """.formatted(landlordName, tenantName);
    }

    /**
     * Build signature section for FINAL (with actual digital signatures)
     */
    private String buildSignatureSection(Contract contract, String landlordName, String tenantName) {
        String landlordSignature = contract.isLandlordSigned()
                ? """
                <div class="signature-space">
                    <div class="digital-signature">%s</div>
                    <div class="signature-badge">✓ Đã ký điện tử</div>
                    <p class="signature-info">Ngày ký: %s</p>
                </div>
                """.formatted(
                landlordName,
                contract.getUpdatedAt() != null
                        ? DATETIME_FORMATTER.format(contract.getUpdatedAt())
                        : "___"
        )
                : """
                <div class="signature-space">
                    <p style="color: #dc3545; margin-top: 30px;">Chưa ký</p>
                </div>
                """;

        String tenantSignature = contract.isTenantSigned()
                ? """
                <div class="signature-space">
                    <div class="digital-signature">%s</div>
                    <div class="signature-badge">✓ Đã ký điện tử</div>
                    <p class="signature-info">Ngày ký: %s</p>
                </div>
                """.formatted(
                tenantName,
                contract.getUpdatedAt() != null
                        ? DATETIME_FORMATTER.format(contract.getUpdatedAt())
                        : "___"
        )
                : """
                <div class="signature-space">
                    <p style="color: #dc3545; margin-top: 30px;">Chưa ký</p>
                </div>
                """;

        return """
    <div class="signature-section">
        <div class="signature-box">
            <p class="bold">ĐẠI DIỆN BÊN CHO THUÊ</p>
            <p style="font-style: italic; font-size: 11pt;">(Ký điện tử)</p>
            %s
            <p>%s</p>
        </div>
        <div class="signature-box">
            <p class="bold">ĐẠI DIỆN BÊN THUÊ</p>
            <p style="font-style: italic; font-size: 11pt;">(Ký điện tử)</p>
            %s
            <p>%s</p>
        </div>
    </div>
        """.formatted(landlordSignature, landlordName, tenantSignature, tenantName);
    }

    /**
     * Template hợp đồng đơn giản (minimal)
     */
    public String buildSimpleContractHtml(Contract contract) {
        UserProfileResponse tenant = fetchUserProfile(contract.getTenantId());
        PropertyResponse property = fetchProperty(contract.getPropertyId());

        String tenantName = tenant != null ? tenant.getLastName() + " " + tenant.getFirstName() : "N/A";
        String propertyAddress = property != null && property.getAddress() != null
                ? property.getAddress().getFullAddress() : "N/A";

        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; padding: 40px; }
                        h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
                        .info-row { margin: 15px 0; padding: 10px; background: #f8f9fa; border-left: 4px solid #3498db; }
                        .label { font-weight: bold; color: #34495e; }
                        .value { color: #2c3e50; }
                    </style>
                </head>
                <body>
                    <h1>HỢP ĐỒNG THUÊ NHÀ</h1>
                    <div class="info-row">
                        <span class="label">Mã hợp đồng:</span> 
                        <span class="value">%s</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Địa chỉ tài sản:</span> 
                        <span class="value">%s</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Người thuê:</span> 
                        <span class="value">%s</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Thời gian:</span> 
                        <span class="value">%s đến %s</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Số tiền cọc:</span> 
                        <span class="value">%s</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Số tiền thuê hàng tháng:</span> 
                        <span class="value">%s</span>
                    </div>
                </body>
                </html>
                """.formatted(
                contract.getId() != null ? contract.getId() : "N/A",
                propertyAddress,
                tenantName,
                contract.getStartDate() != null ? DATE_FORMATTER.format(contract.getStartDate()) : "N/A",
                contract.getEndDate() != null ? DATE_FORMATTER.format(contract.getEndDate()) : "N/A",
                property != null && property.getRentalDeposit() != null ? CURRENCY_FORMATTER.format(property.getRentalDeposit()) : "0",
                property != null && property.getMonthlyRent() != null ? CURRENCY_FORMATTER.format(property.getMonthlyRent()) : "0"
        );
    }

    // Helper methods

    private UserProfileResponse fetchUserProfile(String userId) {
        if (userId == null) return null;
        try {
            var response = userProfileClient.getProfile(userId);
            return response != null ? response.getResult() : null;
        } catch (Exception e) {
            log.warn("Failed to fetch user profile for userId: {}", userId, e);
            return null;
        }
    }

    private PropertyResponse fetchProperty(String propertyId) {
        if (propertyId == null) return null;
        try {
            var response = propertyClient.getProperty(propertyId);
            return response != null ? response.getResult() : null;
        } catch (Exception e) {
            log.warn("Failed to fetch property for propertyId: {}", propertyId, e);
            return null;
        }
    }

    private String buildPropertyStructure(PropertyResponse property) {
        if (property == null) return "___________";

        StringBuilder structure = new StringBuilder();
        if (property.getRooms() != null) {
            structure.append(property.getRooms()).append(" phòng");
        }
        if (property.getBedrooms() != null) {
            if (structure.length() > 0) structure.append(", ");
            structure.append(property.getBedrooms()).append(" phòng ngủ");
        }
        if (property.getBathrooms() != null) {
            if (structure.length() > 0) structure.append(", ");
            structure.append(property.getBathrooms()).append(" phòng tắm");
        }

        return structure.length() > 0 ? structure.toString() : "___________";
    }

    private String translatePropertyType(String type) {
        if (type == null) return "___________";
        return switch (type.toUpperCase()) {
            case "APARTMENT" -> "Căn hộ";
            case "HOUSE" -> "Nhà riêng";
            case "VILLA" -> "Biệt thự";
            case "ROOM" -> "Phòng trọ";
            case "OFFICE" -> "Văn phòng";
            default -> type;
        };
    }

    private String calculateMonthsDuration(Instant start, Instant end) {
        if (start == null || end == null) return "___";

        LocalDate startDate = start.atZone(ZoneId.of("Asia/Ho_Chi_Minh")).toLocalDate();
        LocalDate endDate = end.atZone(ZoneId.of("Asia/Ho_Chi_Minh")).toLocalDate();

        Period period = Period.between(startDate, endDate);
        long totalMonths = period.getYears() * 12L + period.getMonths();

        if (endDate.getDayOfMonth() < startDate.getDayOfMonth()) {
            totalMonths += 1;
        }

        return String.valueOf(totalMonths);
    }

    private String convertNumberToWords(java.math.BigDecimal amount) {
        if (amount == null) return "___________";
        return String.format("(%s đồng chẵn)", CURRENCY_FORMATTER.format(amount));
    }
}