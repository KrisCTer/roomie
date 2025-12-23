package com.roomie.services.billing_service.service;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import com.itextpdf.text.pdf.draw.LineSeparator;
import com.roomie.services.billing_service.entity.Bill;
import com.roomie.services.billing_service.dto.response.ContractResponse;
import com.roomie.services.billing_service.dto.response.MoMoPaymentResponse;
import com.roomie.services.billing_service.dto.response.property.PropertyResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

/**
 * Professional PDF Invoice Generator with REAL MoMo Payment QR Code
 *
 * Uses MoMo API to generate actual payment transaction and QR code
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class BillPdfGeneratorService {

    private final MoMoPaymentService moMoPaymentService;

    @Value("${billing.payment.bank.code:VCB}")
    private String bankCode;

    @Value("${billing.payment.bank.account:1234567890}")
    private String bankAccount;

    @Value("${billing.payment.bank.name:ROOMIE TECHNOLOGIES LTD}")
    private String bankAccountName;

    private static final Font FONT_TITLE = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 24, BaseColor.DARK_GRAY);
    private static final Font FONT_HEADER = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, BaseColor.BLACK);
    private static final Font FONT_SUBHEADER = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, BaseColor.DARK_GRAY);
    private static final Font FONT_NORMAL = FontFactory.getFont(FontFactory.HELVETICA, 10, BaseColor.BLACK);
    private static final Font FONT_SMALL = FontFactory.getFont(FontFactory.HELVETICA, 8, BaseColor.GRAY);
    private static final Font FONT_TOTAL = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, BaseColor.BLUE);

    private static final BaseColor COLOR_HEADER = new BaseColor(41, 128, 185);
    private static final BaseColor COLOR_ROW_ODD = new BaseColor(245, 245, 245);
    private static final BaseColor COLOR_ROW_EVEN = BaseColor.WHITE;

    private static final NumberFormat VND_FORMAT = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    /**
     * Generate PDF invoice with REAL MoMo payment QR code
     */
    public byte[] generateInvoicePdf(
            Bill bill,
            ContractResponse contract,
            PropertyResponse property
    ) throws DocumentException, IOException {

        log.info("🎯 Generating PDF invoice with REAL MoMo QR code for bill: {}", bill.getId());

        Document document = new Document(PageSize.A4, 36, 36, 54, 54);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        try {
            PdfWriter writer = PdfWriter.getInstance(document, baos);

            HeaderFooterPageEvent event = new HeaderFooterPageEvent();
            writer.setPageEvent(event);

            document.open();

            // 1. Logo & Company Info
            addCompanyHeader(document);
            document.add(Chunk.NEWLINE);

            // 2. Invoice Title & Number
            addInvoiceTitle(document, bill);
            document.add(Chunk.NEWLINE);

            // 3. Contract & Property Info
            addContractInfo(document, contract, property);
            document.add(Chunk.NEWLINE);

            // 4. Billing Period
            addBillingPeriod(document, bill);
            document.add(Chunk.NEWLINE);

            // 5. Detailed Breakdown Table
            addDetailedBreakdown(document, bill);
            document.add(Chunk.NEWLINE);

            // 6. Payment Information with REAL MoMo QR Code
            addPaymentInfoWithRealMoMoQR(document, bill);
            document.add(Chunk.NEWLINE);

            // 7. Terms & Conditions
            addTermsAndConditions(document);

            log.info("✅ PDF invoice generated successfully");

        } finally {
            document.close();
        }

        return baos.toByteArray();
    }

    // ==================== SECTION BUILDERS ====================

    private void addCompanyHeader(Document document) throws DocumentException {
        PdfPTable headerTable = new PdfPTable(2);
        headerTable.setWidthPercentage(100);
        headerTable.setWidths(new float[]{1, 2});

        // Logo Cell
        PdfPCell logoCell = new PdfPCell();
        logoCell.setBorder(Rectangle.NO_BORDER);
        logoCell.setPadding(10);

        Paragraph logoText = new Paragraph("ROOMIE", FONT_TITLE);
        logoText.setAlignment(Element.ALIGN_LEFT);
        logoCell.addElement(logoText);

        Paragraph tagline = new Paragraph("Property Management Platform", FONT_SMALL);
        tagline.setAlignment(Element.ALIGN_LEFT);
        logoCell.addElement(tagline);

        headerTable.addCell(logoCell);

        // Company Info Cell
        PdfPCell infoCell = new PdfPCell();
        infoCell.setBorder(Rectangle.NO_BORDER);
        infoCell.setPadding(10);
        infoCell.setHorizontalAlignment(Element.ALIGN_RIGHT);

        Paragraph companyInfo = new Paragraph();
        companyInfo.add(new Chunk("Roomie Technologies Ltd.\n", FONT_NORMAL));
        companyInfo.add(new Chunk("123 Tech Street, District 1\n", FONT_SMALL));
        companyInfo.add(new Chunk("Ho Chi Minh City, Vietnam\n", FONT_SMALL));
        companyInfo.add(new Chunk("Tax ID: 0123456789\n", FONT_SMALL));
        companyInfo.add(new Chunk("Phone: +84 28 1234 5678\n", FONT_SMALL));
        companyInfo.add(new Chunk("Email: billing@roomie.vn\n", FONT_SMALL));
        companyInfo.setAlignment(Element.ALIGN_RIGHT);

        infoCell.addElement(companyInfo);
        headerTable.addCell(infoCell);

        document.add(headerTable);

        LineSeparator line = new LineSeparator();
        line.setLineColor(COLOR_HEADER);
        document.add(line);
    }

    private void addInvoiceTitle(Document document, Bill bill) throws DocumentException {
        PdfPTable titleTable = new PdfPTable(2);
        titleTable.setWidthPercentage(100);
        titleTable.setWidths(new float[]{3, 2});

        PdfPCell titleCell = new PdfPCell();
        titleCell.setBorder(Rectangle.NO_BORDER);

        Paragraph title = new Paragraph("RENTAL INVOICE", FONT_TITLE);
        title.setSpacingBefore(10);
        title.setSpacingAfter(5);
        titleCell.addElement(title);

        titleTable.addCell(titleCell);

        PdfPCell detailsCell = new PdfPCell();
        detailsCell.setBorder(Rectangle.NO_BORDER);
        detailsCell.setHorizontalAlignment(Element.ALIGN_RIGHT);

        Paragraph details = new Paragraph();
        details.add(new Chunk("Invoice #: " + bill.getId().substring(0, 12) + "\n", FONT_SUBHEADER));
        details.add(new Chunk("Date: " + DATE_FORMAT.format(LocalDate.now()) + "\n", FONT_NORMAL));
        details.add(new Chunk("Status: " + getStatusText(bill.getStatus().toString()) + "\n", FONT_NORMAL));
        details.setAlignment(Element.ALIGN_RIGHT);

        detailsCell.addElement(details);
        titleTable.addCell(detailsCell);

        document.add(titleTable);
    }

    private void addContractInfo(Document document, ContractResponse contract, PropertyResponse property)
            throws DocumentException {

        PdfPTable infoTable = new PdfPTable(2);
        infoTable.setWidthPercentage(100);
        infoTable.setWidths(new float[]{1, 1});
        infoTable.setSpacingBefore(10);

        PdfPCell propertyCell = new PdfPCell();
        propertyCell.setPadding(10);
        propertyCell.setBackgroundColor(new BaseColor(249, 249, 249));

        Paragraph propertyInfo = new Paragraph();
        propertyInfo.add(new Chunk("PROPERTY INFORMATION\n\n", FONT_SUBHEADER));
        propertyInfo.add(new Chunk(property.getTitle() + "\n", FONT_NORMAL));
        propertyInfo.add(new Chunk(property.getAddress().getFullAddress() + "\n", FONT_SMALL));
        propertyInfo.add(new Chunk("Type: " + property.getPropertyType() + "\n", FONT_SMALL));
        propertyInfo.add(new Chunk("Size: " + property.getSize() + " m²\n", FONT_SMALL));

        propertyCell.addElement(propertyInfo);
        infoTable.addCell(propertyCell);

        PdfPCell contractCell = new PdfPCell();
        contractCell.setPadding(10);
        contractCell.setBackgroundColor(new BaseColor(249, 249, 249));

        Paragraph contractInfo = new Paragraph();
        contractInfo.add(new Chunk("CONTRACT INFORMATION\n\n", FONT_SUBHEADER));
        contractInfo.add(new Chunk("Contract ID: " + contract.getId().substring(0, 12) + "...\n", FONT_SMALL));
        contractInfo.add(new Chunk("Start Date: " + formatDate(contract.getStartDate()) + "\n", FONT_SMALL));
        contractInfo.add(new Chunk("End Date: " + formatDate(contract.getEndDate()) + "\n", FONT_SMALL));
        contractInfo.add(new Chunk("Status: " + contract.getStatus() + "\n", FONT_SMALL));

        contractCell.addElement(contractInfo);
        infoTable.addCell(contractCell);

        document.add(infoTable);
    }

    private void addBillingPeriod(Document document, Bill bill) throws DocumentException {
        Paragraph period = new Paragraph();
        period.add(new Chunk("Billing Period: ", FONT_SUBHEADER));
        period.add(new Chunk(DATE_FORMAT.format(bill.getBillingMonth()), FONT_NORMAL));
        period.add(new Chunk(" | Due Date: ", FONT_SUBHEADER));
        period.add(new Chunk(DATE_FORMAT.format(bill.getDueDate()), FONT_NORMAL));
        period.setSpacingBefore(10);

        document.add(period);
    }

    private void addDetailedBreakdown(Document document, Bill bill) throws DocumentException {
        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{3, 2, 1.5f, 2});
        table.setSpacingBefore(15);

        addTableHeader(table, "Description");
        addTableHeader(table, "Details");
        addTableHeader(table, "Unit Price");
        addTableHeader(table, "Amount");

        int rowIndex = 0;

        if (bill.getMonthlyRent() != null && bill.getMonthlyRent().compareTo(BigDecimal.ZERO) > 0) {
            addTableRow(table, rowIndex++, "Monthly Rent", "1 month", "-",
                    formatCurrency(bill.getMonthlyRent()));
        }

        if (bill.getElectricityAmount() != null && bill.getElectricityAmount().compareTo(BigDecimal.ZERO) > 0) {
            String elecDetails = String.format("%.0f → %.0f kWh (%.0f kWh used)",
                    bill.getElectricityOld(), bill.getElectricityNew(), bill.getElectricityConsumption());
            addTableRow(table, rowIndex++, "Electricity", elecDetails,
                    formatCurrency(bill.getElectricityUnitPrice()),
                    formatCurrency(bill.getElectricityAmount()));
        }

        if (bill.getWaterAmount() != null && bill.getWaterAmount().compareTo(BigDecimal.ZERO) > 0) {
            String waterDetails = String.format("%.0f → %.0f m³ (%.0f m³ used)",
                    bill.getWaterOld(), bill.getWaterNew(), bill.getWaterConsumption());
            addTableRow(table, rowIndex++, "Water", waterDetails,
                    formatCurrency(bill.getWaterUnitPrice()),
                    formatCurrency(bill.getWaterAmount()));
        }

        if (bill.getInternetPrice() != null && bill.getInternetPrice().compareTo(BigDecimal.ZERO) > 0) {
            addTableRow(table, rowIndex++, "Internet", "Monthly service", "-",
                    formatCurrency(bill.getInternetPrice()));
        }

        if (bill.getParkingPrice() != null && bill.getParkingPrice().compareTo(BigDecimal.ZERO) > 0) {
            addTableRow(table, rowIndex++, "Parking", "Monthly fee", "-",
                    formatCurrency(bill.getParkingPrice()));
        }

        if (bill.getCleaningPrice() != null && bill.getCleaningPrice().compareTo(BigDecimal.ZERO) > 0) {
            addTableRow(table, rowIndex++, "Cleaning Service", "Monthly service", "-",
                    formatCurrency(bill.getCleaningPrice()));
        }

        if (bill.getMaintenancePrice() != null && bill.getMaintenancePrice().compareTo(BigDecimal.ZERO) > 0) {
            addTableRow(table, rowIndex++, "Maintenance", "Monthly fee", "-",
                    formatCurrency(bill.getMaintenancePrice()));
        }

        if (bill.getOtherPrice() != null && bill.getOtherPrice().compareTo(BigDecimal.ZERO) > 0) {
            String desc = bill.getOtherDescription() != null ? bill.getOtherDescription() : "Other Fees";
            addTableRow(table, rowIndex++, desc, "-", "-",
                    formatCurrency(bill.getOtherPrice()));
        }

        document.add(table);

        PdfPTable totalTable = new PdfPTable(2);
        totalTable.setWidthPercentage(100);
        totalTable.setWidths(new float[]{3, 1});
        totalTable.setSpacingBefore(10);

        PdfPCell totalLabelCell = new PdfPCell(new Phrase("TOTAL AMOUNT", FONT_TOTAL));
        totalLabelCell.setBorder(Rectangle.NO_BORDER);
        totalLabelCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        totalLabelCell.setPadding(10);
        totalTable.addCell(totalLabelCell);

        PdfPCell totalAmountCell = new PdfPCell(new Phrase(formatCurrency(bill.getTotalAmount()), FONT_TOTAL));
        totalAmountCell.setBorder(Rectangle.NO_BORDER);
        totalAmountCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        totalAmountCell.setPadding(10);
        totalAmountCell.setBackgroundColor(new BaseColor(230, 240, 255));
        totalTable.addCell(totalAmountCell);

        document.add(totalTable);
    }

    /**
     * Add Payment Information with REAL MoMo Payment QR Code
     *
     * Flow:
     * 1. Call MoMo API để tạo payment transaction
     * 2. Nhận về qrCodeUrl
     * 3. Download QR code image từ MoMo
     * 4. Embed vào PDF
     */

    private void addPaymentInfoWithRealMoMoQR(Document document, Bill bill) throws DocumentException {
        Paragraph paymentTitle = new Paragraph("PAYMENT INFORMATION", FONT_SUBHEADER);
        paymentTitle.setSpacingBefore(20);
        document.add(paymentTitle);

        try {
            log.info("🔄 Creating MoMo payment transaction for bill: {}", bill.getId());

            // 1. Call MoMo API để tạo payment
            String orderInfo = String.format("Thanh toan hoa don Roomie %s",
                    bill.getId().substring(0, 8).toUpperCase());

            long amount = bill.getTotalAmount().longValue();

            MoMoPaymentResponse momoResponse = moMoPaymentService.createPaymentQR(
                    bill.getId(),
                    amount,
                    orderInfo
            );

            log.info("✅ MoMo payment created");
            log.info("   Order ID: {}", momoResponse.getOrderId());
            log.info("   Pay URL: {}", momoResponse.getPayUrl());
            log.info("   QR Code URL: {}", momoResponse.getQrCodeUrl());

            // 2. Get QR code image - SMART METHOD
            // Tự động detect: có qrCodeUrl → download, không có → generate
            byte[] qrImageBytes = moMoPaymentService.getQRCodeImage(momoResponse, 200, 200);

            // 3. Convert to iText Image
            Image qrCodeImage = Image.getInstance(qrImageBytes);
            qrCodeImage.scaleAbsolute(150, 150);

            // 4. Create payment info table với QR code
            PdfPTable paymentTable = new PdfPTable(2);
            paymentTable.setWidthPercentage(100);
            paymentTable.setWidths(new float[]{3, 2});
            paymentTable.setSpacingBefore(10);

            // Left cell - Payment details
            PdfPCell detailsCell = new PdfPCell();
            detailsCell.setPadding(15);
            detailsCell.setBackgroundColor(new BaseColor(255, 250, 240));

            Paragraph paymentInfo = new Paragraph();
            paymentInfo.add(new Chunk("💳 Quét QR Code để thanh toán\n\n", FONT_SUBHEADER));
            paymentInfo.add(new Chunk("Phương thức: ", FONT_SUBHEADER));
            paymentInfo.add(new Chunk("Ví MoMo\n", FONT_NORMAL));
            paymentInfo.add(new Chunk("Số tiền: ", FONT_SUBHEADER));
            paymentInfo.add(new Chunk(formatCurrency(bill.getTotalAmount()) + "\n", FONT_NORMAL));
            paymentInfo.add(new Chunk("Mã đơn hàng: ", FONT_SUBHEADER));
            paymentInfo.add(new Chunk(momoResponse.getOrderId().substring(0, 12) + "...\n\n", FONT_SMALL));

            // Thêm note về QR code
            if (momoResponse.getQrCodeUrl() != null) {
                paymentInfo.add(new Chunk("✨ QR code chính thức từ MoMo\n\n", FONT_SMALL));
            } else {
                paymentInfo.add(new Chunk("💡 QR code được tạo từ payment URL\n\n", FONT_SMALL));
            }

            paymentInfo.add(new Chunk("--- HOẶC ---\n\n", FONT_SMALL));

            paymentInfo.add(new Chunk("Chuyển khoản ngân hàng:\n", FONT_SUBHEADER));
            paymentInfo.add(new Chunk("Ngân hàng: Vietcombank (VCB)\n", FONT_NORMAL));
            paymentInfo.add(new Chunk("STK: " + bankAccount + "\n", FONT_NORMAL));
            paymentInfo.add(new Chunk("Chủ TK: " + bankAccountName + "\n", FONT_NORMAL));
            paymentInfo.add(new Chunk("Nội dung: " + momoResponse.getOrderId().substring(0, 12) + "\n", FONT_NORMAL));

            detailsCell.addElement(paymentInfo);
            paymentTable.addCell(detailsCell);

            // Right cell - QR Code
            PdfPCell qrCell = new PdfPCell();
            qrCell.setPadding(15);
            qrCell.setBackgroundColor(BaseColor.WHITE);
            qrCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            qrCell.setVerticalAlignment(Element.ALIGN_MIDDLE);

            Paragraph qrLabel = new Paragraph("QR Code MoMo\n\n", FONT_SMALL);
            qrLabel.setAlignment(Element.ALIGN_CENTER);
            qrCell.addElement(qrLabel);

            qrCodeImage.setAlignment(Element.ALIGN_CENTER);
            qrCell.addElement(qrCodeImage);

            Paragraph qrNote = new Paragraph("\nMở app MoMo\nvà quét mã", FONT_SMALL);
            qrNote.setAlignment(Element.ALIGN_CENTER);
            qrCell.addElement(qrNote);

            paymentTable.addCell(qrCell);

            document.add(paymentTable);

            // Add payment URL for reference
            Paragraph paymentUrl = new Paragraph();
            paymentUrl.setSpacingBefore(10);
            paymentUrl.add(new Chunk("Hoặc thanh toán online tại: ", FONT_SMALL));

            // Truncate long URL for display
            String displayUrl = momoResponse.getPayUrl();
            if (displayUrl.length() > 80) {
                displayUrl = displayUrl.substring(0, 77) + "...";
            }

            paymentUrl.add(new Chunk(displayUrl,
                    FontFactory.getFont(FontFactory.HELVETICA, 7, Font.UNDERLINE, BaseColor.BLUE)));
            document.add(paymentUrl);


            log.info("✅ MoMo QR code added to PDF invoice successfully");

        } catch (Exception e) {
            log.error("❌ Failed to generate MoMo payment QR code", e);

            // Fallback to bank transfer info only
            PdfPTable fallbackTable = new PdfPTable(1);
            fallbackTable.setWidthPercentage(100);
            fallbackTable.setSpacingBefore(10);

            PdfPCell fallbackCell = new PdfPCell();
            fallbackCell.setPadding(15);
            fallbackCell.setBackgroundColor(new BaseColor(255, 250, 240));

            Paragraph fallbackInfo = new Paragraph();
            fallbackInfo.add(new Chunk("⚠️ Không thể tạo QR code MoMo\n\n", FONT_SUBHEADER));
            fallbackInfo.add(new Chunk("Vui lòng chuyển khoản ngân hàng:\n", FONT_SUBHEADER));
            fallbackInfo.add(new Chunk("Ngân hàng: Vietcombank (VCB)\n", FONT_NORMAL));
            fallbackInfo.add(new Chunk("Số tài khoản: " + bankAccount + "\n", FONT_NORMAL));
            fallbackInfo.add(new Chunk("Chủ tài khoản: " + bankAccountName + "\n", FONT_NORMAL));
            fallbackInfo.add(new Chunk("Số tiền: " + formatCurrency(bill.getTotalAmount()) + "\n", FONT_NORMAL));
            fallbackInfo.add(new Chunk("Nội dung: ROOMIE-" + bill.getId().substring(0, 8).toUpperCase() + "\n", FONT_NORMAL));

            fallbackCell.addElement(fallbackInfo);
            fallbackTable.addCell(fallbackCell);

            document.add(fallbackTable);
        }
    }

    private void addTermsAndConditions(Document document) throws DocumentException {
        Paragraph terms = new Paragraph();
        terms.setSpacingBefore(20);
        terms.add(new Chunk("Terms & Conditions:\n", FONT_SUBHEADER));
        terms.add(new Chunk("• Payment is due within 5 days of invoice date\n", FONT_SMALL));
        terms.add(new Chunk("• Late payments may incur additional fees\n", FONT_SMALL));
        terms.add(new Chunk("• QR code is valid for 15 minutes from generation time\n", FONT_SMALL));
        terms.add(new Chunk("• For questions, contact billing@roomie.vn\n", FONT_SMALL));

        document.add(terms);
    }

    // ==================== TABLE HELPERS ====================

    private void addTableHeader(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, BaseColor.WHITE)));
        cell.setBackgroundColor(COLOR_HEADER);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(8);
        table.addCell(cell);
    }

    private void addTableRow(PdfPTable table, int rowIndex, String desc, String details,
                             String unitPrice, String amount) {
        BaseColor bgColor = rowIndex % 2 == 0 ? COLOR_ROW_EVEN : COLOR_ROW_ODD;

        addTableCell(table, desc, Element.ALIGN_LEFT, bgColor);
        addTableCell(table, details, Element.ALIGN_LEFT, bgColor);
        addTableCell(table, unitPrice, Element.ALIGN_RIGHT, bgColor);
        addTableCell(table, amount, Element.ALIGN_RIGHT, bgColor);
    }

    private void addTableCell(PdfPTable table, String text, int alignment, BaseColor bgColor) {
        PdfPCell cell = new PdfPCell(new Phrase(text, FONT_NORMAL));
        cell.setHorizontalAlignment(alignment);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(6);
        cell.setBackgroundColor(bgColor);
        cell.setBorder(Rectangle.BOTTOM);
        cell.setBorderColor(BaseColor.LIGHT_GRAY);
        table.addCell(cell);
    }

    // ==================== FORMATTERS ====================

    private String formatCurrency(Object value) {
        if (value == null) return "-";

        if (value instanceof BigDecimal) {
            return VND_FORMAT.format((BigDecimal) value);
        } else if (value instanceof Double) {
            return VND_FORMAT.format((Double) value);
        }

        return value.toString();
    }

    private String formatDate(Object instant) {
        if (instant == null) return "-";

        if (instant instanceof java.time.Instant) {
            return DATE_FORMAT.format(
                    LocalDate.ofInstant((java.time.Instant) instant,
                            java.time.ZoneId.systemDefault())
            );
        }

        return instant.toString();
    }

    private String getStatusText(String status) {
        return switch (status) {
            case "DRAFT" -> "Draft";
            case "PENDING" -> "Pending Payment";
            case "PAID" -> "Paid";
            case "OVERDUE" -> "Overdue";
            default -> status;
        };
    }

    // ==================== HEADER/FOOTER EVENT ====================

    static class HeaderFooterPageEvent extends PdfPageEventHelper {
        @Override
        public void onEndPage(PdfWriter writer, Document document) {
            PdfContentByte cb = writer.getDirectContent();

            Phrase footer = new Phrase("Page " + writer.getPageNumber() +
                    " | Generated by Roomie Platform | www.roomie.vn", FONT_SMALL);

            ColumnText.showTextAligned(cb, Element.ALIGN_CENTER,
                    footer,
                    (document.right() - document.left()) / 2 + document.leftMargin(),
                    document.bottom() - 10, 0);
        }
    }
}