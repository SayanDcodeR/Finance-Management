package com.financeapp.service;

import com.financeapp.dto.response.ReportResponse;
import com.financeapp.entity.Expense;
import com.financeapp.entity.Income;
import com.financeapp.repository.ExpenseRepository;
import com.financeapp.repository.IncomeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final IncomeRepository incomeRepository;
    private final ExpenseRepository expenseRepository;
    private final UserService userService;

    public ReportResponse getMonthlyReport(int year, int month) {
        Long userId = userService.getCurrentUserId();
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

        return generateReport(userId, startDate, endDate);
    }

    public ReportResponse getYearlyReport(int year) {
        Long userId = userService.getCurrentUserId();
        LocalDate startDate = LocalDate.of(year, 1, 1);
        LocalDate endDate = LocalDate.of(year, 12, 31);

        ReportResponse report = generateReport(userId, startDate, endDate);

        // Add monthly trend data
        List<ReportResponse.MonthlyData> monthlyTrend = new ArrayList<>();
        for (int m = 1; m <= 12; m++) {
            LocalDate monthStart = LocalDate.of(year, m, 1);
            LocalDate monthEnd = monthStart.withDayOfMonth(monthStart.lengthOfMonth());

            BigDecimal monthIncome = incomeRepository.sumAmountByUserIdAndDateBetween(userId, monthStart, monthEnd);
            BigDecimal monthExpenses = expenseRepository.sumAmountByUserIdAndDateBetween(userId, monthStart, monthEnd);

            monthlyTrend.add(ReportResponse.MonthlyData.builder()
                    .month(Month.of(m).getDisplayName(TextStyle.SHORT, Locale.ENGLISH))
                    .income(monthIncome)
                    .expenses(monthExpenses)
                    .savings(monthIncome.subtract(monthExpenses))
                    .build());
        }
        report.setMonthlyTrend(monthlyTrend);

        return report;
    }

    public ReportResponse getCategoryWiseReport(LocalDate startDate, LocalDate endDate) {
        Long userId = userService.getCurrentUserId();
        return generateReport(userId, startDate, endDate);
    }

    private ReportResponse generateReport(Long userId, LocalDate startDate, LocalDate endDate) {
        BigDecimal totalIncome = incomeRepository.sumAmountByUserIdAndDateBetween(userId, startDate, endDate);
        BigDecimal totalExpenses = expenseRepository.sumAmountByUserIdAndDateBetween(userId, startDate, endDate);

        List<Income> incomes = incomeRepository.findByUserIdAndDateBetweenOrderByDateDesc(userId, startDate, endDate);
        List<Expense> expenses = expenseRepository.findByUserIdAndDateBetweenOrderByDateDesc(userId, startDate, endDate);

        // Category-wise expenses
        Map<String, BigDecimal> categoryWiseExpenses = expenses.stream()
                .filter(e -> e.getCategory() != null)
                .collect(Collectors.groupingBy(
                        e -> e.getCategory().getName(),
                        Collectors.reducing(BigDecimal.ZERO, Expense::getAmount, BigDecimal::add)
                ));

        // Category-wise income
        Map<String, BigDecimal> categoryWiseIncome = incomes.stream()
                .filter(i -> i.getCategory() != null)
                .collect(Collectors.groupingBy(
                        i -> i.getCategory().getName(),
                        Collectors.reducing(BigDecimal.ZERO, Income::getAmount, BigDecimal::add)
                ));

        return ReportResponse.builder()
                .totalIncome(totalIncome)
                .totalExpenses(totalExpenses)
                .netSavings(totalIncome.subtract(totalExpenses))
                .categoryWiseExpenses(categoryWiseExpenses)
                .categoryWiseIncome(categoryWiseIncome)
                .build();
    }
}
