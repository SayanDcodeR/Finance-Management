package com.financeapp.controller;

import com.financeapp.dto.response.ApiResponse;
import com.financeapp.dto.response.TransactionResponse;
import com.financeapp.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@Tag(name = "Transaction", description = "Transaction history APIs")
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping
    @Operation(summary = "Get paginated and filtered transactions")
    public ResponseEntity<ApiResponse<Page<TransactionResponse>>> getTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(ApiResponse.success(
                transactionService.getTransactions(page, size, type, categoryId, startDate, endDate)));
    }

    @GetMapping("/search")
    @Operation(summary = "Search transactions by description")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> searchTransactions(@RequestParam String query) {
        return ResponseEntity.ok(ApiResponse.success(transactionService.searchTransactions(query)));
    }

    @GetMapping("/recent")
    @Operation(summary = "Get 5 most recent transactions")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getRecentTransactions() {
        return ResponseEntity.ok(ApiResponse.success(transactionService.getRecentTransactions()));
    }
}
