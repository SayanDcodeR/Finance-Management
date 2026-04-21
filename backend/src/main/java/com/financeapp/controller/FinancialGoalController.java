package com.financeapp.controller;

import com.financeapp.dto.request.GoalRequest;
import com.financeapp.dto.response.ApiResponse;
import com.financeapp.dto.response.GoalResponse;
import com.financeapp.service.FinancialGoalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/goals")
@RequiredArgsConstructor
@Tag(name = "Financial Goals", description = "Savings goal management APIs")
public class FinancialGoalController {

    private final FinancialGoalService goalService;

    @GetMapping
    @Operation(summary = "Get all financial goals")
    public ResponseEntity<ApiResponse<List<GoalResponse>>> getAllGoals() {
        return ResponseEntity.ok(ApiResponse.success(goalService.getAllGoals()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get goal by ID")
    public ResponseEntity<ApiResponse<GoalResponse>> getGoalById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(goalService.getGoalById(id)));
    }

    @PostMapping
    @Operation(summary = "Create a new financial goal")
    public ResponseEntity<ApiResponse<GoalResponse>> createGoal(@Valid @RequestBody GoalRequest request) {
        return new ResponseEntity<>(ApiResponse.success("Goal created successfully",
                goalService.createGoal(request)), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing goal")
    public ResponseEntity<ApiResponse<GoalResponse>> updateGoal(@PathVariable Long id,
                                                                   @Valid @RequestBody GoalRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Goal updated successfully",
                goalService.updateGoal(id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a goal")
    public ResponseEntity<ApiResponse<Void>> deleteGoal(@PathVariable Long id) {
        goalService.deleteGoal(id);
        return ResponseEntity.ok(ApiResponse.success("Goal deleted successfully", null));
    }

    @PatchMapping("/{id}/progress")
    @Operation(summary = "Update goal progress (current amount)")
    public ResponseEntity<ApiResponse<GoalResponse>> updateProgress(@PathVariable Long id,
                                                                       @RequestBody Map<String, BigDecimal> body) {
        return ResponseEntity.ok(ApiResponse.success("Progress updated successfully",
                goalService.updateProgress(id, body.get("currentAmount"))));
    }
}
