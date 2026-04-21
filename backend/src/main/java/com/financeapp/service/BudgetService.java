package com.financeapp.service;

import com.financeapp.dto.request.BudgetRequest;
import com.financeapp.dto.response.BudgetResponse;
import com.financeapp.entity.Budget;
import com.financeapp.entity.Category;
import com.financeapp.entity.User;
import com.financeapp.exception.ResourceNotFoundException;
import com.financeapp.repository.BudgetRepository;
import com.financeapp.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final ExpenseRepository expenseRepository;
    private final CategoryService categoryService;
    private final UserService userService;

    public List<BudgetResponse> getAllBudgets() {
        Long userId = userService.getCurrentUserId();
        return budgetRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<BudgetResponse> getBudgetsByMonthAndYear(Integer month, Integer year) {
        Long userId = userService.getCurrentUserId();
        return budgetRepository.findByUserIdAndMonthAndYear(userId, month, year).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public BudgetResponse createBudget(BudgetRequest request) {
        User user = userService.getCurrentUser();
        Category category = request.getCategoryId() != null ?
                categoryService.getCategoryEntity(request.getCategoryId()) : null;

        Budget budget = Budget.builder()
                .amountLimit(request.getAmountLimit())
                .amountSpent(BigDecimal.ZERO)
                .month(request.getMonth())
                .year(request.getYear())
                .category(category)
                .user(user)
                .build();

        // Calculate current spent amount
        if (category != null) {
            LocalDate startOfMonth = LocalDate.of(request.getYear(), request.getMonth(), 1);
            LocalDate endOfMonth = startOfMonth.withDayOfMonth(startOfMonth.lengthOfMonth());
            BigDecimal spent = expenseRepository.sumAmountByUserIdAndCategoryIdAndDateBetween(
                    user.getId(), category.getId(), startOfMonth, endOfMonth);
            budget.setAmountSpent(spent);
        }

        return mapToResponse(budgetRepository.save(budget));
    }

    @Transactional
    public BudgetResponse updateBudget(Long id, BudgetRequest request) {
        Budget budget = getBudgetEntity(id);
        Category category = request.getCategoryId() != null ?
                categoryService.getCategoryEntity(request.getCategoryId()) : null;

        budget.setAmountLimit(request.getAmountLimit());
        budget.setMonth(request.getMonth());
        budget.setYear(request.getYear());
        budget.setCategory(category);

        return mapToResponse(budgetRepository.save(budget));
    }

    @Transactional
    public void deleteBudget(Long id) {
        Budget budget = getBudgetEntity(id);
        budgetRepository.delete(budget);
    }

    public List<BudgetResponse> getBudgetAlerts() {
        Long userId = userService.getCurrentUserId();
        LocalDate now = LocalDate.now();
        return budgetRepository.findByUserIdAndMonthAndYear(userId, now.getMonthValue(), now.getYear()).stream()
                .map(this::mapToResponse)
                .filter(BudgetResponse::isAlert)
                .collect(Collectors.toList());
    }

    private Budget getBudgetEntity(Long id) {
        Long userId = userService.getCurrentUserId();
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Budget", "id", id));
        if (!budget.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Budget", "id", id);
        }
        return budget;
    }

    private BudgetResponse mapToResponse(Budget budget) {
        BigDecimal remaining = budget.getAmountLimit().subtract(budget.getAmountSpent());
        double percentageUsed = budget.getAmountLimit().compareTo(BigDecimal.ZERO) > 0 ?
                budget.getAmountSpent().multiply(BigDecimal.valueOf(100))
                        .divide(budget.getAmountLimit(), 2, RoundingMode.HALF_UP).doubleValue() : 0;

        return BudgetResponse.builder()
                .id(budget.getId())
                .amountLimit(budget.getAmountLimit())
                .amountSpent(budget.getAmountSpent())
                .remaining(remaining)
                .percentageUsed(percentageUsed)
                .month(budget.getMonth())
                .year(budget.getYear())
                .categoryId(budget.getCategory() != null ? budget.getCategory().getId() : null)
                .categoryName(budget.getCategory() != null ? budget.getCategory().getName() : null)
                .alert(percentageUsed >= 80)
                .build();
    }
}
