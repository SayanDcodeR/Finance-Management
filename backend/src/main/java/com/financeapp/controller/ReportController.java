package com.financeapp.controller;

import com.financeapp.dto.response.ApiResponse;
import com.financeapp.dto.response.ReportResponse;
import com.financeapp.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Tag(name = "Reports", description = "Financial reports and analytics APIs")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/monthly")
    @Operation(summary = "Get monthly financial report")
    public ResponseEntity<ApiResponse<ReportResponse>> getMonthlyReport(
            @RequestParam int year, @RequestParam int month) {
        return ResponseEntity.ok(ApiResponse.success(reportService.getMonthlyReport(year, month)));
    }

    @GetMapping("/yearly")
    @Operation(summary = "Get yearly financial report with monthly trends")
    public ResponseEntity<ApiResponse<ReportResponse>> getYearlyReport(@RequestParam int year) {
        return ResponseEntity.ok(ApiResponse.success(reportService.getYearlyReport(year)));
    }

    @GetMapping("/category-wise")
    @Operation(summary = "Get category-wise financial report for a date range")
    public ResponseEntity<ApiResponse<ReportResponse>> getCategoryWiseReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(ApiResponse.success(reportService.getCategoryWiseReport(startDate, endDate)));
    }
}
