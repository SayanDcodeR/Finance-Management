package com.financeapp.service;

import com.financeapp.dto.response.BudgetResponse;
import com.financeapp.dto.response.DashboardResponse;
import com.financeapp.dto.response.GoalResponse;
import com.financeapp.dto.response.TransactionResponse;
import com.financeapp.repository.IncomeRepository;
import com.financeapp.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final IncomeRepository incomeRepository;
    private final ExpenseRepository expenseRepository;
    private final TransactionService transactionService;
    private final BudgetService budgetService;
    private final FinancialGoalService goalService;
    private final UserService userService;

    public DashboardResponse getDashboardSummary() {
        Long userId = userService.getCurrentUserId();
        LocalDate now = LocalDate.now();
        LocalDate startOfMonth = now.withDayOfMonth(1);
        LocalDate endOfMonth = now.withDayOfMonth(now.lengthOfMonth());

        BigDecimal totalIncome = incomeRepository.sumAmountByUserId(userId);
        BigDecimal totalExpenses = expenseRepository.sumAmountByUserId(userId);
        BigDecimal balance = totalIncome.subtract(totalExpenses);

        BigDecimal monthlyIncome = incomeRepository.sumAmountByUserIdAndDateBetween(userId, startOfMonth, endOfMonth);
        BigDecimal monthlyExpenses = expenseRepository.sumAmountByUserIdAndDateBetween(userId, startOfMonth, endOfMonth);
        BigDecimal monthlyBalance = monthlyIncome.subtract(monthlyExpenses);

        List<TransactionResponse> recentTransactions = transactionService.getRecentTransactions();
        List<BudgetResponse> budgetAlerts = budgetService.getBudgetAlerts();
        List<GoalResponse> activeGoals = goalService.getActiveGoals();

        return DashboardResponse.builder()
                .totalIncome(totalIncome)
                .totalExpenses(totalExpenses)
                .balance(balance)
                .monthlyIncome(monthlyIncome)
                .monthlyExpenses(monthlyExpenses)
                .monthlyBalance(monthlyBalance)
                .recentTransactions(recentTransactions)
                .budgetAlerts(budgetAlerts)
                .activeGoals(activeGoals)
                .build();
    }
}
