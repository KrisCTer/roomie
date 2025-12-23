package com.roomie.services.billing_service.service;

import com.roomie.services.billing_service.entity.Bill;
import com.roomie.services.billing_service.repository.BillRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

/**
 * Bill Export Service
 * Exports bills to Excel/CSV format
 */
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class BillExportService {

    BillRepository billRepository;

    private static final NumberFormat CURRENCY_FORMAT =
            NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));

    private static final DateTimeFormatter DATE_FORMAT =
            DateTimeFormatter.ofPattern("dd/MM/yyyy");

    /**
     * Export bills to Excel or CSV
     */
    public Resource exportBills(String format, String contractId, String from, String to) {
        log.info("Exporting bills: format={}, contractId={}, from={}, to={}",
                format, contractId, from, to);

        // Get bills with filters
        List<Bill> bills = getBillsWithFilters(contractId, from, to);

        if ("excel".equalsIgnoreCase(format)) {
            return exportToExcel(bills);
        } else {
            return exportToCsv(bills);
        }
    }

    /**
     * Export to Excel
     */
    private Resource exportToExcel(List<Bill> bills) {
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Bills");

            // Create header style
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle currencyStyle = createCurrencyStyle(workbook);
            CellStyle dateStyle = createDateStyle(workbook);

            // Create header row
            Row headerRow = sheet.createRow(0);
            String[] headers = {
                    "Bill ID", "Contract ID", "Billing Month", "Due Date",
                    "Electricity (kWh)", "Electricity Amount",
                    "Water (m³)", "Water Amount",
                    "Internet", "Parking", "Cleaning", "Maintenance",
                    "Monthly Rent", "Total Amount", "Status", "Created At"
            };

            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Create data rows
            int rowNum = 1;
            for (Bill bill : bills) {
                Row row = sheet.createRow(rowNum++);

                // Bill ID
                row.createCell(0).setCellValue(bill.getId());

                // Contract ID
                row.createCell(1).setCellValue(bill.getContractId());

                // Billing Month
                Cell monthCell = row.createCell(2);
                monthCell.setCellValue(formatDate(bill.getBillingMonth()));
                monthCell.setCellStyle(dateStyle);

                // Due Date
                Cell dueCell = row.createCell(3);
                dueCell.setCellValue(formatDate(bill.getDueDate()));
                dueCell.setCellStyle(dateStyle);

                // Electricity
                row.createCell(4).setCellValue(bill.getElectricityConsumption());
                Cell elecAmtCell = row.createCell(5);
                elecAmtCell.setCellValue(bill.getElectricityAmount().doubleValue());
                elecAmtCell.setCellStyle(currencyStyle);

                // Water
                row.createCell(6).setCellValue(bill.getWaterConsumption());
                Cell waterAmtCell = row.createCell(7);
                waterAmtCell.setCellValue(bill.getWaterAmount().doubleValue());
                waterAmtCell.setCellStyle(currencyStyle);

                // Services
                Cell internetCell = row.createCell(8);
                internetCell.setCellValue(bill.getInternetPrice().doubleValue());
                internetCell.setCellStyle(currencyStyle);

                Cell parkingCell = row.createCell(9);
                parkingCell.setCellValue(bill.getParkingPrice().doubleValue());
                parkingCell.setCellStyle(currencyStyle);

                Cell cleaningCell = row.createCell(10);
                cleaningCell.setCellValue(bill.getCleaningPrice().doubleValue());
                cleaningCell.setCellStyle(currencyStyle);

                Cell maintenanceCell = row.createCell(11);
                maintenanceCell.setCellValue(bill.getMaintenancePrice().doubleValue());
                maintenanceCell.setCellStyle(currencyStyle);

                // Rent
                Cell rentCell = row.createCell(12);
                rentCell.setCellValue(bill.getMonthlyRent().doubleValue());
                rentCell.setCellStyle(currencyStyle);

                // Total
                Cell totalCell = row.createCell(13);
                totalCell.setCellValue(bill.getTotalAmount().doubleValue());
                totalCell.setCellStyle(currencyStyle);

                // Status
                row.createCell(14).setCellValue(bill.getStatus().toString());

                // Created At
                Cell createdCell = row.createCell(15);
                createdCell.setCellValue(bill.getCreatedAt().toString());
                createdCell.setCellStyle(dateStyle);
            }

            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(baos);
            return new ByteArrayResource(baos.toByteArray());

        } catch (IOException e) {
            log.error("Error exporting to Excel", e);
            throw new RuntimeException("Failed to export to Excel", e);
        }
    }

    /**
     * Export to CSV
     */
    private Resource exportToCsv(List<Bill> bills) {
        StringBuilder csv = new StringBuilder();

        // Header
        csv.append("Bill ID,Contract ID,Billing Month,Due Date,")
                .append("Electricity (kWh),Electricity Amount,Water (m³),Water Amount,")
                .append("Internet,Parking,Cleaning,Maintenance,Monthly Rent,")
                .append("Total Amount,Status,Created At\n");

        // Data rows
        for (Bill bill : bills) {
            csv.append(bill.getId()).append(",")
                    .append(bill.getContractId()).append(",")
                    .append(formatDate(bill.getBillingMonth())).append(",")
                    .append(formatDate(bill.getDueDate())).append(",")
                    .append(bill.getElectricityConsumption()).append(",")
                    .append(bill.getElectricityAmount()).append(",")
                    .append(bill.getWaterConsumption()).append(",")
                    .append(bill.getWaterAmount()).append(",")
                    .append(bill.getInternetPrice()).append(",")
                    .append(bill.getParkingPrice()).append(",")
                    .append(bill.getCleaningPrice()).append(",")
                    .append(bill.getMaintenancePrice()).append(",")
                    .append(bill.getMonthlyRent()).append(",")
                    .append(bill.getTotalAmount()).append(",")
                    .append(bill.getStatus()).append(",")
                    .append(bill.getCreatedAt())
                    .append("\n");
        }

        return new ByteArrayResource(csv.toString().getBytes());
    }

    /**
     * Get bills with filters
     */
    private List<Bill> getBillsWithFilters(String contractId, String from, String to) {
        String landlordId = getCurrentUserId();
        List<Bill> bills = billRepository.findByLandlordId(landlordId);

        // Filter by contract
        if (contractId != null && !contractId.isBlank()) {
            bills = bills.stream()
                    .filter(b -> contractId.equals(b.getContractId()))
                    .collect(Collectors.toList());
        }

        // Filter by date range
        if (from != null && !from.isBlank()) {
            LocalDate fromDate = LocalDate.parse(from + "-01");
            bills = bills.stream()
                    .filter(b -> !b.getBillingMonth().isBefore(fromDate))
                    .collect(Collectors.toList());
        }

        if (to != null && !to.isBlank()) {
            LocalDate toDate = LocalDate.parse(to + "-01");
            bills = bills.stream()
                    .filter(b -> !b.getBillingMonth().isAfter(toDate))
                    .collect(Collectors.toList());
        }

        return bills;
    }

    // ==================== EXCEL STYLES ====================

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        return style;
    }

    private CellStyle createCurrencyStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        DataFormat format = workbook.createDataFormat();
        style.setDataFormat(format.getFormat("#,##0 ₫"));
        return style;
    }

    private CellStyle createDateStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        DataFormat format = workbook.createDataFormat();
        style.setDataFormat(format.getFormat("dd/MM/yyyy"));
        return style;
    }

    // ==================== HELPERS ====================

    private String formatDate(LocalDate date) {
        return date != null ? date.format(DATE_FORMAT) : "";
    }

    private String getCurrentUserId() {
        return SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();
    }
}