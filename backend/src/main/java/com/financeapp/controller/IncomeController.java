package com.financeapp.controller;

import com.financeapp.dto.request.IncomeRequest;
import com.financeapp.dto.response.ApiResponse;
import com.financeapp.dto.response.IncomeResponse;
import com.financeapp.service.IncomeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/incomes")
@RequiredArgsConstructor
@Tag(name = "Income", description = "Income management APIs")
public class IncomeController {

    private final IncomeService incomeService;

    @GetMapping
    @Operation(summary = "Get all incomes for the current user")
    public ResponseEntity<ApiResponse<List<IncomeResponse>>> getAllIncomes() {
        return ResponseEntity.ok(ApiResponse.success(incomeService.getAllIncomes()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get income by ID")
    public ResponseEntity<ApiResponse<IncomeResponse>> getIncomeById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(incomeService.getIncomeById(id)));
    }

    @PostMapping
    @Operation(summary = "Create a new income record")
    public ResponseEntity<ApiResponse<IncomeResponse>> createIncome(@Valid @RequestBody IncomeRequest request) {
        return new ResponseEntity<>(ApiResponse.success("Income created successfully",
                incomeService.createIncome(request)), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing income")
    public ResponseEntity<ApiResponse<IncomeResponse>> updateIncome(@PathVariable Long id,
                                                                      @Valid @RequestBody IncomeRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Income updated successfully",
                incomeService.updateIncome(id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an income record")
    public ResponseEntity<ApiResponse<Void>> deleteIncome(@PathVariable Long id) {
        incomeService.deleteIncome(id);
        return ResponseEntity.ok(ApiResponse.success("Income deleted successfully", null));
    }

    @GetMapping("/date-range")
    @Operation(summary = "Get incomes by date range")
    public ResponseEntity<ApiResponse<List<IncomeResponse>>> getIncomesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(ApiResponse.success(incomeService.getIncomesByDateRange(startDate, endDate)));
    }
}
