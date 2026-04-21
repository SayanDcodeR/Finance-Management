package com.financeapp.service;

import com.financeapp.dto.request.ExpenseRequest;
import com.financeapp.dto.response.ExpenseResponse;
import com.financeapp.entity.*;
import com.financeapp.exception.ResourceNotFoundException;
import com.financeapp.repository.BudgetRepository;
import com.financeapp.repository.ExpenseRepository;
import com.financeapp.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;
    private final CategoryService categoryService;
    private final UserService userService;

    public List<ExpenseResponse> getAllExpenses() {
        Long userId = userService.getCurrentUserId();
        return expenseRepository.findByUserIdOrderByDateDesc(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ExpenseResponse getExpenseById(Long id) {
        return mapToResponse(getExpenseEntity(id));
    }

    public List<ExpenseResponse> getExpensesByDateRange(LocalDate startDate, LocalDate endDate) {
        Long userId = userService.getCurrentUserId();
        return expenseRepository.findByUserIdAndDateBetweenOrderByDateDesc(userId, startDate, endDate).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ExpenseResponse createExpense(ExpenseRequest request) {
        User user = userService.getCurrentUser();
        Category category = request.getCategoryId() != null ?
                categoryService.getCategoryEntity(request.getCategoryId()) : null;

        Expense expense = Expense.builder()
                .title(request.getTitle())
                .amount(request.getAmount())
                .date(request.getDate())
                .description(request.getDescription())
                .category(category)
                .user(user)
                .build();

        Expense savedExpense = expenseRepository.save(expense);

        // Create corresponding transaction record
        Transaction transaction = Transaction.builder()
                .type("EXPENSE")
                .amount(savedExpense.getAmount())
                .date(savedExpense.getDate())
                .description(savedExpense.getTitle() + (savedExpense.getDescription() != null ? " - " + savedExpense.getDescription() : ""))
                .category(category)
                .user(user)
                .referenceId(savedExpense.getId())
                .build();
        transactionRepository.save(transaction);

        // Update budget spent amount if category budget exists
        if (category != null) {
            updateBudgetSpent(user.getId(), category.getId(), savedExpense.getDate());
        }

        return mapToResponse(savedExpense);
    }

    @Transactional
    public ExpenseResponse updateExpense(Long id, ExpenseRequest request) {
        Expense expense = getExpenseEntity(id);
        Category category = request.getCategoryId() != null ?
                categoryService.getCategoryEntity(request.getCategoryId()) : null;

        expense.setTitle(request.getTitle());
        expense.setAmount(request.getAmount());
        expense.setDate(request.getDate());
        expense.setDescription(request.getDescription());
        expense.setCategory(category);

        ExpenseResponse response = mapToResponse(expenseRepository.save(expense));

        // Recalculate budget
        if (category != null) {
            updateBudgetSpent(expense.getUser().getId(), category.getId(), expense.getDate());
        }

        return response;
    }

    @Transactional
    public void deleteExpense(Long id) {
        Expense expense = getExpenseEntity(id);
        expenseRepository.delete(expense);
    }

    private void updateBudgetSpent(Long userId, Long categoryId, LocalDate date) {
        int month = date.getMonthValue();
        int year = date.getYear();

        budgetRepository.findByUserIdAndCategoryIdAndMonthAndYear(userId, categoryId, month, year)
                .ifPresent(budget -> {
                    LocalDate startOfMonth = LocalDate.of(year, month, 1);
                    LocalDate endOfMonth = startOfMonth.withDayOfMonth(startOfMonth.lengthOfMonth());
                    BigDecimal totalSpent = expenseRepository.sumAmountByUserIdAndCategoryIdAndDateBetween(
                            userId, categoryId, startOfMonth, endOfMonth);
                    budget.setAmountSpent(totalSpent);
                    budgetRepository.save(budget);
                });
    }

    private Expense getExpenseEntity(Long id) {
        Long userId = userService.getCurrentUserId();
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense", "id", id));
        if (!expense.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Expense", "id", id);
        }
        return expense;
    }

    private ExpenseResponse mapToResponse(Expense expense) {
        return ExpenseResponse.builder()
                .id(expense.getId())
                .title(expense.getTitle())
                .amount(expense.getAmount())
                .date(expense.getDate())
                .description(expense.getDescription())
                .categoryId(expense.getCategory() != null ? expense.getCategory().getId() : null)
                .categoryName(expense.getCategory() != null ? expense.getCategory().getName() : null)
                .createdAt(expense.getCreatedAt())
                .build();
    }
}
