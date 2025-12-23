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

import java.math.BigDecimal;
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

    private static final DateTimeFormatter DAY_MONTH_YEAR_FORMATTER = DateTimeFormatter
            .ofPattern("dd 'tháng' MM 'năm' yyyy")
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
     * Main builder - tạo HTML theo mẫu hợp đồng chuẩn Việt Nam
     */
    private String buildContractHtml(Contract contract, boolean includeSignatures) {
        // Fetch data from services
        UserProfileResponse tenant = fetchUserProfile(contract.getTenantId());
        UserProfileResponse landlord = fetchUserProfile(contract.getLandlordId());
        PropertyResponse property = fetchProperty(contract.getPropertyId());

        // Get current date for contract signing
        LocalDate today = LocalDate.now();
        String contractDate = today.format(DAY_MONTH_YEAR_FORMATTER);

        // Format dates
        String startDate = contract.getStartDate() != null
                ? DATE_FORMATTER.format(contract.getStartDate())
                : "___/___/_______";

        String endDate = contract.getEndDate() != null
                ? DATE_FORMATTER.format(contract.getEndDate())
                : "___/___/_______";

        String paymentDay = contract.getStartDate() != null
                ? DAY_ONLY.format(contract.getStartDate())
                : "___";

        // Money formatting
        String depositAmount = property != null && property.getRentalDeposit() != null
                ? formatCurrency(property.getRentalDeposit())
                : "___________";

        String depositInWords = property != null && property.getRentalDeposit() != null
                ? convertNumberToWords(property.getRentalDeposit())
                : "___________";

        String monthlyRent = property != null && property.getMonthlyRent() != null
                ? formatCurrency(property.getMonthlyRent())
                : "___________";

        // Landlord info
        String landlordName = landlord != null
                ? (landlord.getLastName() + " " + landlord.getFirstName()).trim()
                : "___________";

        String landlordBirthYear = landlord != null && landlord.getDob() != null
                ? String.valueOf(landlord.getDob().getYear())
                : "___________";

        String landlordIdCard = landlord != null && landlord.getIdCardNumber() != null
                ? landlord.getIdCardNumber()
                : "___________";

        String landlordIdIssuePlace = landlord != null && landlord.getCurrentAddress() != null
                ? landlord.getCurrentAddress()
                : "___________";

        String landlordIdIssueDate = landlord != null && landlord.getDob() != null
                ? DATE_FORMATTER.format(landlord.getDob())
                : "___________";

        String landlordAddress = landlord != null && landlord.getPermanentAddress() != null
                ? landlord.getPermanentAddress()
                : "___________";

        // Tenant info
        String tenantName = tenant != null
                ? (tenant.getLastName() + " " + tenant.getFirstName()).trim()
                : "___________";

        String tenantBirthYear = tenant != null && tenant.getDob() != null
                ? String.valueOf(tenant.getDob().getYear())
                : "___________";

        String tenantIdCard = tenant != null && tenant.getIdCardNumber() != null
                ? tenant.getIdCardNumber()
                : "___________";

        String tenantIdIssuePlace = tenant != null && tenant.getCurrentAddress() != null
                ? tenant.getCurrentAddress()
                : "___________";
//can fix tenantIdIssueDate
        String tenantIdIssueDate = tenant != null && tenant.getDob() != null
                ? DATE_FORMATTER.format(tenant.getDob())
                : "___________";

        String tenantAddress = tenant != null && tenant.getPermanentAddress() != null
                ? tenant.getPermanentAddress()
                : "___________";

        // Property info
        String propertyAddress = property != null && property.getAddress() != null
                ? property.getAddress().getFullAddress()
                : "___________";

        String propertyType = property != null && property.getPropertyType() != null
                ? translatePropertyType(property.getPropertyType().toString())
                : "___________";

        String propertyPurpose = "để ở"; // Default purpose, can be changed if needed

        // Calculate duration
        String durationYears = calculateYearsDuration(contract.getStartDate(), contract.getEndDate());
        String durationYearsInWords = convertYearsToWords(durationYears);

        // Build signature section
        String signatureSection = includeSignatures
                ? buildSignatureSection(contract, landlordName, tenantName)
                : buildPreviewSignatureSection(landlordName, tenantName);

        return """
                <!DOCTYPE html>
                <html lang="vi">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Hợp Đồng Thuê Nhà</title>
                    <style>
                        @page {
                            size: A4;
                            margin: 2cm 2.5cm;
                        }
                        
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        
                        body {
                            font-family: 'Times New Roman', serif;
                            font-size: 13pt;
                            line-height: 1.5;
                            color: #000;
                            text-align: justify;
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
                        
                        .header-top {
                            text-transform: uppercase;
                            font-weight: bold;
                            font-size: 13pt;
                            margin-bottom: 5px;
                        }
                        
                        .header-subtitle {
                            font-style: italic;
                            font-size: 13pt;
                            margin-bottom: 15px;
                        }
                        
                        .header-divider {
                            margin: 10px auto;
                        }
                        
                        .contract-title {
                            font-size: 16pt;
                            font-weight: bold;
                            text-transform: uppercase;
                            margin: 20px 0;
                        }
                        
                        .basis {
                            margin: 20px 0;
                            line-height: 1.8;
                        }
                        
                        .party-section {
                            margin: 20px 0;
                        }
                        
                        .party-title {
                            font-weight: bold;
                            text-transform: uppercase;
                            margin-bottom: 5px;
                        }
                        
                        .party-detail {
                            margin-left: 0;
                            line-height: 1.8;
                        }
                        
                        .article {
                            margin: 25px 0;
                        }
                        
                        .article-title {
                            font-weight: bold;
                            text-align: center;
                            text-transform: uppercase;
                            margin: 15px 0 10px 0;
                        }
                        
                        .article-content {
                            text-indent: 0;
                            margin: 10px 0;
                        }
                        
                        .article-subsection {
                            margin-left: 0;
                            margin-top: 10px;
                        }
                        
                        .indent {
                            margin-left: 30px;
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
                        
                        .signature-space {
                            margin-top: 80px;
                        }
                        
                        .digital-signature {
                            font-family: 'Brush Script MT', cursive;
                            font-size: 18pt;
                            color: #0066cc;
                        }
                        
                        .signature-badge {
                            background: #28a745;
                            color: white;
                            padding: 5px 15px;
                            border-radius: 15px;
                            display: inline-block;
                            font-size: 11pt;
                            margin-top: 10px;
                        }
                        
                        .signature-info {
                            font-size: 11pt;
                            color: #666;
                            margin-top: 5px;
                        }
                        
                        .bold {
                            font-weight: bold;
                        }
                        
                        .italic {
                            font-style: italic;
                        }
                        
                        .center {
                            text-align: center;
                        }
                        
                        .note-section {
                            margin-top: 30px;
                            font-size: 12pt;
                            line-height: 1.6;
                        }
                        
                        .note-title {
                            font-weight: bold;
                        }
                        
                        ul {
                            margin-left: 30px;
                        }
                        
                        li {
                            margin: 5px 0;
                        }
                    </style>
                </head>
                <body>
                    %s
                    
                    <div class="header">
                        <p class="header-top">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                        <p class="header-subtitle">Độc lập - Tự do - Hạnh phúc</p>
                        <p class="header-divider">---------o0o---------</p>
                        <h1 class="contract-title">HỢP ĐỒNG THUÊ NHÀ</h1>
                    </div>
                    
                    <div class="basis">
                        <p>- Căn cứ Bộ Luật Dân sự của Quốc Hội nước CHXHCN Việt Nam năm 2015</p>
                        <p>- Căn cứ nhu cầu và khả năng của các Bên;</p>
                    </div>
                    
                    <p style="margin: 20px 0;">Hôm nay, ngày <strong>%s</strong>, tại <strong>%s</strong>, chúng tôi gồm:</p>
                    
                    <div class="party-section">
                        <p class="party-title">BÊN CHO THUÊ: (Sau đây gọi tắt là Bên A)</p>
                        <div class="party-detail">
                            <p>Ông/Bà: <strong>%s</strong></p>
                            <p>Sinh năm: <strong>%s</strong></p>
                            <p>CMND/CCCD/Hộ chiếu số: <strong>%s</strong> do <strong>%s</strong> cấp ngày <strong>%s</strong></p>
                            <p>Hộ khẩu thường trú tại: <strong>%s</strong></p>
                        </div>
                    </div>
                    
                    <div class="party-section">
                        <p class="party-title">BÊN THUÊ: (Sau đây gọi tắt là Bên B)</p>
                        <div class="party-detail">
                            <p>Ông/Bà: <strong>%s</strong></p>
                            <p>Sinh năm: <strong>%s</strong></p>
                            <p>CMND/CCCD/Hộ chiếu số: <strong>%s</strong> do <strong>%s</strong> cấp ngày <strong>%s</strong></p>
                            <p>Hộ khẩu thường trú tại: <strong>%s</strong></p>
                        </div>
                    </div>
                    
                    <p style="margin: 20px 0;">Hai Bên tự nguyện cùng nhau lập và ký Hợp đồng này để thực hiện việc cho thuê tài sản theo các thỏa thuận sau đây:</p>
                    
                    <!-- ĐIỀU 1 -->
                    <div class="article">
                        <h2 class="article-title">ĐIỀU 1<br/>DIỆN TÍCH CHO THUÊ VÀ MỤC ĐÍCH THUÊ</h2>
                        <p class="article-content"><strong>1.1</strong> Bên A đồng ý cho Bên B thuê, Bên B đồng ý thuê của Bên A toàn bộ <strong>%s</strong> tại địa chỉ: <strong>%s</strong> theo Giấy chứng nhận quyền sử dụng đất quyền sở hữu nhà ở và tài sản gắn liền với đất mang tên ông/bà <strong>%s</strong>.</p>
                        <p class="article-content">Diện tích, hiện trạng quyền sử dụng đất và tài sản gắn liền với đất được mô tả cụ thể trong Giấy chứng nhận quyền sử dụng đất quyền sở hữu nhà ở và tài sản gắn liền với đất nêu trên. (Sau đây gọi là "Tài sản" hoặc "Tài sản thuê")</p>
                        <p class="article-content"><strong>1.2</strong> Mục đích thuê: <strong>%s</strong></p>
                    </div>
                    
                    <!-- ĐIỀU 2 -->
                    <div class="article">
                        <h2 class="article-title">ĐIỀU 2<br/>THỜI HẠN THUÊ, GIA HẠN VÀ CHẤM DỨT HỢP ĐỒNG</h2>
                        <p class="article-content"><strong>2.1</strong> Thời hạn thuê là <strong>%s (%s)</strong> năm, được tính bắt đầu từ ngày <strong>%s</strong> đến ngày <strong>%s</strong>.</p>
                        <p class="article-content"><strong>2.2</strong> Bên A bàn giao quyền sử dụng đất và quyền sở hữu tài sản gắn liền với đất cho Bên B vào ngày <strong>%s</strong>.</p>
                        <p class="article-content"><strong>2.3</strong> Hợp đồng này có hiệu lực thi hành kể từ ngày ký</p>
                        <p class="article-content"><strong>2.4</strong> Hợp đồng sẽ đương nhiên chấm dứt khi xảy ra các trường hợp sau:</p>
                        <p class="article-content"><strong>2.5</strong> Hết thời hạn thuê hoặc không được gia hạn thuê theo quy định của Hợp đồng;</p>
                        <p class="article-content"><strong>2.6</strong> Nếu bên B không thanh toán tiền nhà sau 15 ngày đầu của mỗi đợt thanh toán thì bên A có quyền chấm dứt Hợp đồng và bên B không được bồi thường bất cứ một khoản chi phí nào.</p>
                        <p class="article-content"><strong>2.7</strong> Chấm dứt hợp đồng theo quy định của pháp luật;</p>
                        <p class="article-content"><strong>2.8</strong> Trường hợp bên A chấm dứt Hợp đồng trước thời hạn, bên A phải:</p>
                        <div class="indent">
                            <p>+ Thông báo cho bên B biết trước 1 tháng bằng văn bản.</p>
                            <p>+ Hoàn trả cho bên B số tiền thuê mà bên B đã trả trước cho khoảng thời gian bên B không sử dụng nhà (nếu có)</p>
                        </div>
                        <p class="article-content">Trường hợp bên B chấm dứt Hợp đồng trước thời hạn, bên B phải:</p>
                        <div class="indent">
                            <p>+ Thông báo cho bên A biết trước 30 ngày bằng văn bản</p>
                            <p>+ Thanh toán các chi phí tiện ích tính đến ngày bàn giao nhà</p>
                            <p>+ Được bên A hoàn trả số tiền nhà đã trả trước mà chưa sử dụng (nếu có)</p>
                        </div>
                        <p class="article-content"><strong>2.9</strong> Trường hợp một trong hai bên muốn chấm dứt Hợp đồng trước thời hạn thì Bên A được lấy lại tài sản trước thời hạn.</p>
                        <p class="article-content"><strong>2.10</strong> Việc một trong hai bên không thực hiện, thực hiện không đầy đủ hay thực hiện chậm các nghĩa vụ của mình theo Hợp đồng này sẽ không bị coi là vi phạm các nghĩa vụ đó hay là đối tượng để khiếu nại các nghĩa vụ đó nếu việc không thực hiện hay chậm trễ đó do thiên tai, động đất, chiến tranh và các trường hợp bất khả kháng theo quy định của pháp luật hiện hành.</p>
                    </div>
                    
                    <!-- ĐIỀU 3 -->
                    <div class="article">
                        <h2 class="article-title">ĐIỀU 3<br/>GIÁ THUÊ, ĐẶT CỌC VÀ PHƯƠNG THỨC THANH TOÁN</h2>
                        <p class="article-content"><strong>3.1</strong> Giá cho thuê:</p>
                        <div class="indent">
                            <p>Số tiền thuê là: <strong>%s/1 tháng</strong></p>
                        </div>
                        <p class="article-content">Giá trên đã bao gồm tiền các loại thuế, phí theo quy định của pháp luật.</p>
                        
                        <p class="article-content"><strong>3.2</strong> Tiền đặt cọc:</p>
                        <p class="article-content">Bên B sẽ giao cho Bên A một khoản tiền là <strong>%s</strong> (bằng chữ: <strong>%s</strong>) ngay sau khi ký hợp đồng này. Số tiền này là tiền đặt cọc để đảm bảo thực hiện Hợp đồng cho thuê nhà kể từ ngày hợp đồng có hiệu lực.</p>
                        <div class="indent">
                            <p>• Nếu Bên B đơn phương chấm dứt hợp đồng mà không thực hiện nghĩa vụ báo trước tới Bên A thì Bên A sẽ không phải hoàn trả lại Bên B số tiền đặt cọc này.</p>
                            <p>• Nếu Bên A đơn phương chấm dứt hợp đồng mà không thực hiện nghĩa vụ báo trước tới bên B thì bên A sẽ phải hoàn trả lại Bên B số tiền đặt cọc và phải bồi thường thêm một khoản bằng chính tiền đặt cọc.</p>
                            <p>• Vào thời điểm kết thúc Thời Hạn Thuê hoặc kể từ ngày Chấm dứt Hợp Đồng, Bên A sẽ hoàn lại cho Bên B số Tiền Đặt Cọc sau khi đã khấu trừ khoản tiền chi phí để khắc phục thiệt hại (nếu có).</p>
                        </div>
                        
                        <p class="article-content"><strong>3.3</strong> Bên B sẽ thanh toán tiền thuê tài sản cho Bên A vào ngày <strong>%s</strong> của mỗi tháng. Mỗi lần thanh toán Bên B sẽ nhận được một giấy biên nhận của Bên A. Việc thanh toán tiền thuê tài sản sẽ do các bên tự thực hiện.</p>
                        
                        <p class="article-content"><strong>3.4</strong> Phương thức thanh toán bằng tiền mặt hoặc chuyển khoản ngân hàng.</p>
                    </div>
                    
                    <!-- ĐIỀU 4 -->
                    <div class="article">
                        <h2 class="article-title">ĐIỀU 4<br/>PHÍ DỊCH VỤ</h2>
                        <p class="article-content"><strong>4.1</strong> Bên A sẽ không phải trả bất kỳ phí dịch vụ hay khoản thuế nào liên quan trong quá trình kinh doanh của Bên B.</p>
                        <p class="article-content"><strong>4.2</strong> Bên B trực tiếp thanh toán các chi phí sử dụng điện năng, nước, điện thoại, fax, internet và các dịch vụ khác theo khối lượng tiêu thụ hàng tháng với các nhà cung cấp và giá theo quy định của Nhà Nước.</p>
                        <p class="article-content"><strong>4.3</strong> Các khoản thuế, chi phí, lệ phí tách biệt riêng không bao gồm tiền thuê. Bên B chịu mọi chi phí, thuế liên quan đến việc kinh doanh trong quá trình thuê tài sản.</p>
                    </div>
                    
                    <!-- ĐIỀU 5 -->
                    <div class="article">
                        <h2 class="article-title">ĐIỀU 5<br/>QUYỀN VÀ NGHĨA VỤ CỦA BÊN A</h2>
                        <p class="article-content"><strong>5.1 Nghĩa vụ của Bên A:</strong></p>
                        <div class="indent">
                            <p>- Bàn giao tài sản cho bên thuê trong tình trạng vệ sinh sạch sẽ theo đúng thỏa thuận trong hợp đồng;</p>
                            <p>- Bảo đảm cho Bên thuê sử dụng ổn định tài sản trong thời hạn thuê;</p>
                            <p>- Tạo điều kiện để cho Bên B hoạt động kinh doanh được thuận lợi như: Điện, nước theo quy định của pháp luật; Có trách nhiệm đăng ký sổ tạm trú cho bên B tại công an địa phương. Trước khi sổ tạm trú hết hạn, bên A phải có trách nhiệm gia hạn sổ tạm trú cho bên B khi bên B cung cấp đầy đủ các giấy tờ tùy thân.</p>
                        </div>
                        
                        <p class="article-content"><strong>5.2 Quyền của Bên A:</strong></p>
                        <div class="indent">
                            <p>- Nhận đủ tiền thuê tài sản theo đúng kỳ hạn đã thỏa thuận;</p>
                            <p>- Cải tạo, sửa chữa, nâng cấp tài sản thuê khi được Bên B đồng ý;</p>
                        </div>
                    </div>
                    
                    <!-- ĐIỀU 6 -->
                    <div class="article">
                        <h2 class="article-title">ĐIỀU 6<br/>QUYỀN VÀ NGHĨA VỤ CỦA BÊN B</h2>
                        <p class="article-content"><strong>6.1 Nghĩa vụ của Bên B:</strong></p>
                        <div class="indent">
                            <p>- Sử dụng tài sản đúng mục đích đã thỏa thuận;</p>
                            <p>- Trả đủ tiền thuê tài sản đúng kỳ hạn đã thỏa thuận;</p>
                            <p>- Giữ gìn, sửa chữa những hư hỏng do mình gây ra;</p>
                            <p>- Tôn trọng quy tắc sinh hoạt công cộng;</p>
                            <p>- Trả tài sản cho bên A theo đúng thỏa thuận;</p>
                            <p>- Phải tự bảo quản tài sản của mình, bảo vệ tài sản chung, giữ gìn vệ sinh chung, an ninh trật tự chung, có trách nhiệm trong công tác phòng cháy chữa cháy;</p>
                            <p>- Không được tự ý thay đổi, sửa chữa hiện trạng ban đầu của tài sản thuê nếu không được sự đồng ý của Bên A;</p>
                            <p>- Nếu gây ra những hư hỏng do lỗi chủ quan của Bên B thì Bên B phải chịu trách nhiệm bồi thường thiệt hại theo giá thị trường;</p>
                            <p>- Không được sử dụng tài sản thuê để kinh doanh trái phép, tàng trữ và sử dụng các mặt hàng cấm mà pháp luật quy định.</p>
                        </div>
                        
                        <p class="article-content"><strong>6.2 Quyền của Bên B:</strong></p>
                        <div class="indent">
                            <p>- Nhận tài sản thuê theo đúng thỏa thuận.</p>
                        </div>
                    </div>
                    
                    <!-- ĐIỀU 7 -->
                    <div class="article">
                        <h2 class="article-title">ĐIỀU 7<br/>GIẢI QUYẾT TRANH CHẤP</h2>
                        <p class="article-content">Trong quá trình thực hiện Hợp đồng này, nếu phát sinh tranh chấp, các bên cùng nhau thương lượng giải quyết trên nguyên tắc tôn trọng quyền lợi của nhau; trong trường hợp không thương lượng được thì một trong hai bên có quyền khởi kiện để yêu cầu toà án có thẩm quyền giải quyết theo quy định của pháp luật.</p>
                    </div>
                    
                    <!-- ĐIỀU 8 -->
                    <div class="article">
                        <h2 class="article-title">ĐIỀU 8<br/>CÁC ĐIỀU KHOẢN CHUNG</h2>
                        <p class="article-content"><strong>8.1</strong> Hợp đồng này thay thế cho toàn bộ các thỏa thuận miệng, hoặc bằng văn bản trước đó được ký kết giữa hai Bên liên quan đến nội dung Hợp đồng.</p>
                        <p class="article-content"><strong>8.2</strong> Mọi sửa đổi hoặc bổ sung Hợp đồng này phải được lập thành văn bản và được ký bởi đại diện của các Bên tham gia Hợp đồng.</p>
                        <p class="article-content"><strong>8.3</strong> Hiệu lực của từng điều khoản của Hợp đồng mang tính độc lập. Việc một vài điều khoản vô hiệu không làm ảnh hưởng đến hiệu lực của các điều khoản còn lại của Hợp đồng trừ trường hợp pháp luật có quy định khác.</p>
                    </div>
                    
                    %s
                    
                    <div class="note-section">
                        <p class="note-title">Chú thích:</p>
                        <ul>
                            <li>Ghi theo Giấy chứng nhận quyền sử dụng đất</li>
                            <li>Ghi rõ mục đích thuê: để ở, để kinh doanh...</li>
                            <li>Giá thuê đã bao gồm hoặc chưa bao gồm các khoản sau đó</li>
                            <li>Ghi rõ phương thức thanh toán: chuyển khoản hoặc tiền mặt</li>
                        </ul>
                    </div>
                </body>
                </html>
                """.formatted(
                // Watermark
                includeSignatures ? "" : "<div class='watermark'>BẢN PREVIEW</div>",
                // Contract signing date and location
                contractDate,
                propertyAddress,
                // Landlord info
                landlordName,
                landlordBirthYear,
                landlordIdCard,
                landlordIdIssuePlace,
                landlordIdIssueDate,
                landlordAddress,
                // Tenant info
                tenantName,
                tenantBirthYear,
                tenantIdCard,
                tenantIdIssuePlace,
                tenantIdIssueDate,
                tenantAddress,
                // Property details
                propertyType,
                propertyAddress,
                landlordName,
                propertyPurpose,
                // Duration
                durationYears,
                durationYearsInWords,
                startDate,
                endDate,
                startDate,
                // Payment
                monthlyRent,
                depositAmount,
                depositInWords,
                paymentDay,
                // Signature section
                signatureSection
        );
    }

    /**
     * Build signature section for preview (no signatures)
     */
    private String buildPreviewSignatureSection(String landlordName, String tenantName) {
        return """
                <div class="signature-section">
                    <div class="signature-box">
                        <p class="bold">BÊN CHO THUÊ TÀI SẢN (Bên A)</p>
                        <p class="italic">(Ký/ điểm chỉ, ghi rõ họ tên)</p>
                        <div class="signature-space"></div>
                        <p>%s</p>
                    </div>
                    <div class="signature-box">
                        <p class="bold">BÊN THUÊ TÀI SẢN (Bên B)</p>
                        <p class="italic">(Ký/ điểm chỉ, ghi rõ họ tên)</p>
                        <div class="signature-space"></div>
                        <p>%s</p>
                    </div>
                </div>
                """.formatted(landlordName, tenantName);
    }

    /**
     * Build signature section with digital signatures
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
                        <p class="bold">BÊN CHO THUÊ TÀI SẢN (Bên A)</p>
                        <p class="italic">(Ký điện tử)</p>
                        %s
                        <p>%s</p>
                    </div>
                    <div class="signature-box">
                        <p class="bold">BÊN THUÊ TÀI SẢN (Bên B)</p>
                        <p class="italic">(Ký điện tử)</p>
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
                property != null && property.getRentalDeposit() != null ? formatCurrency(property.getRentalDeposit()) : "0",
                property != null && property.getMonthlyRent() != null ? formatCurrency(property.getMonthlyRent()) : "0"
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

    private String formatCurrency(BigDecimal amount) {
        if (amount == null) return "___________";
        return CURRENCY_FORMATTER.format(amount);
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

    private String calculateYearsDuration(Instant start, Instant end) {
        if (start == null || end == null) return "___";

        LocalDate startDate = start.atZone(ZoneId.of("Asia/Ho_Chi_Minh")).toLocalDate();
        LocalDate endDate = end.atZone(ZoneId.of("Asia/Ho_Chi_Minh")).toLocalDate();

        Period period = Period.between(startDate, endDate);
        return String.valueOf(period.getYears());
    }

    private String convertYearsToWords(String years) {
        if (years == null || years.equals("___")) return "___________";

        try {
            int yearNum = Integer.parseInt(years);
            String[] units = {"", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"};
            String[] tens = {"", "mười", "hai mươi", "ba mươi", "bốn mươi", "năm mươi",
                    "sáu mươi", "bảy mươi", "tám mươi", "chín mươi"};

            if (yearNum < 10) {
                return units[yearNum];
            } else if (yearNum < 100) {
                int ten = yearNum / 10;
                int unit = yearNum % 10;
                return tens[ten] + (unit > 0 ? " " + units[unit] : "");
            }
            return years;
        } catch (NumberFormatException e) {
            return years;
        }
    }

    private String convertNumberToWords(BigDecimal amount) {
        if (amount == null) return "___________";

        long amountLong = amount.longValue();
        String[] units = {"", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"};
        String[] tens = {"", "mười", "hai mươi", "ba mươi", "bốn mươi", "năm mươi",
                "sáu mươi", "bảy mươi", "tám mươi", "chín mươi"};

        if (amountLong == 0) return "không đồng";

        StringBuilder words = new StringBuilder();

        if (amountLong >= 1_000_000) {
            long millions = amountLong / 1_000_000;
            words.append(convertThreeDigits(millions, units, tens)).append(" triệu ");
            amountLong %= 1_000_000;
        }

        if (amountLong >= 1_000) {
            long thousands = amountLong / 1_000;
            words.append(convertThreeDigits(thousands, units, tens)).append(" nghìn ");
            amountLong %= 1_000;
        }

        if (amountLong > 0) {
            words.append(convertThreeDigits(amountLong, units, tens));
        }

        return words.toString().trim() + " đồng";
    }

    private String convertThreeDigits(long num, String[] units, String[] tens) {
        if (num == 0) return "";

        StringBuilder result = new StringBuilder();

        int hundred = (int) (num / 100);
        int remainder = (int) (num % 100);

        if (hundred > 0) {
            result.append(units[hundred]).append(" trăm ");
        }

        if (remainder >= 10) {
            int ten = remainder / 10;
            int unit = remainder % 10;
            result.append(tens[ten]);
            if (unit > 0) {
                result.append(" ").append(units[unit]);
            }
        } else if (remainder > 0) {
            if (hundred > 0) {
                result.append("lẻ ");
            }
            result.append(units[remainder]);
        }

        return result.toString().trim();
    }
}