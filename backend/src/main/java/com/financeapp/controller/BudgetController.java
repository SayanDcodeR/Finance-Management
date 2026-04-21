package com.financeapp.controller;

import com.financeapp.dto.request.BudgetRequest;
import com.financeapp.dto.response.ApiResponse;
import com.financeapp.dto.response.BudgetResponse;
import com.financeapp.service.BudgetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
@Tag(name = "Budget", description = "Budget management APIs")
public class BudgetController {

    private final BudgetService budgetService;

    @GetMapping
    @Operation(summary = "Get all budgets")
    public ResponseEntity<ApiResponse<List<BudgetResponse>>> getAllBudgets() {
        return ResponseEntity.ok(ApiResponse.success(budgetService.getAllBudgets()));
    }

    @GetMapping("/month/{month}/year/{year}")
    @Operation(summary = "Get budgets by month and year")
    public ResponseEntity<ApiResponse<List<BudgetResponse>>> getBudgetsByMonthAndYear(
            @PathVariable Integer month, @PathVariable Integer year) {
        return ResponseEntity.ok(ApiResponse.success(budgetService.getBudgetsByMonthAndYear(month, year)));
    }

    @PostMapping
    @Operation(summary = "Create a new budget")
    public ResponseEntity<ApiResponse<BudgetResponse>> createBudget(@Valid @RequestBody BudgetRequest request) {
        return new ResponseEntity<>(ApiResponse.success("Budget created successfully",
                budgetService.createBudget(request)), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing budget")
    public ResponseEntity<ApiResponse<BudgetResponse>> updateBudget(@PathVariable Long id,
                                                                      @Valid @RequestBody BudgetRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Budget updated successfully",
                budgetService.updateBudget(id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a budget")
    public ResponseEntity<ApiResponse<Void>> deleteBudget(@PathVariable Long id) {
        budgetService.deleteBudget(id);
        return ResponseEntity.ok(ApiResponse.success("Budget deleted successfully", null));
    }

    @GetMapping("/alerts")
    @Operation(summary = "Get budget alerts (budgets > 80% used)")
    public ResponseEntity<ApiResponse<List<BudgetResponse>>> getBudgetAlerts() {
        return ResponseEntity.ok(ApiResponse.success(budgetService.getBudgetAlerts()));
    }
}
