package com.financeapp.controller;

import com.financeapp.dto.request.RecurringTransactionRequest;
import com.financeapp.dto.response.ApiResponse;
import com.financeapp.dto.response.RecurringTransactionResponse;
import com.financeapp.service.RecurringTransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recurring")
@RequiredArgsConstructor
@Tag(name = "Recurring Transactions", description = "Recurring transaction management APIs")
public class RecurringTransactionController {

    private final RecurringTransactionService recurringService;

    @GetMapping
    @Operation(summary = "Get all recurring transactions")
    public ResponseEntity<ApiResponse<List<RecurringTransactionResponse>>> getAllRecurring() {
        return ResponseEntity.ok(ApiResponse.success(recurringService.getAllRecurring()));
    }

    @PostMapping
    @Operation(summary = "Create a new recurring transaction")
    public ResponseEntity<ApiResponse<RecurringTransactionResponse>> createRecurring(
            @Valid @RequestBody RecurringTransactionRequest request) {
        return new ResponseEntity<>(ApiResponse.success("Recurring transaction created successfully",
                recurringService.createRecurring(request)), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a recurring transaction")
    public ResponseEntity<ApiResponse<RecurringTransactionResponse>> updateRecurring(
            @PathVariable Long id, @Valid @RequestBody RecurringTransactionRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Recurring transaction updated successfully",
                recurringService.updateRecurring(id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a recurring transaction")
    public ResponseEntity<ApiResponse<Void>> deleteRecurring(@PathVariable Long id) {
        recurringService.deleteRecurring(id);
        return ResponseEntity.ok(ApiResponse.success("Recurring transaction deleted successfully", null));
    }

    @PatchMapping("/{id}/toggle")
    @Operation(summary = "Toggle recurring transaction active/inactive")
    public ResponseEntity<ApiResponse<RecurringTransactionResponse>> toggleActive(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Status toggled successfully",
                recurringService.toggleActive(id)));
    }
}
