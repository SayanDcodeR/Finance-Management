package com.financeapp.service;

import com.financeapp.dto.response.BudgetResponse;
import com.financeapp.entity.Budget;
import com.financeapp.entity.Category;
import com.financeapp.entity.User;
import com.financeapp.repository.BudgetRepository;
import com.financeapp.repository.ExpenseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BudgetServiceTest {

    @Mock private BudgetRepository budgetRepository;
    @Mock private ExpenseRepository expenseRepository;
    @Mock private CategoryService categoryService;
    @Mock private UserService userService;

    @InjectMocks private BudgetService budgetService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder().id(1L).username("testuser").build();
    }

    @Test
    @DisplayName("Should return all budgets for user")
    void testGetAllBudgets() {
        Category food = Category.builder().id(1L).name("Food").user(testUser).build();
        Budget b1 = Budget.builder().id(1L).amountLimit(new BigDecimal("10000")).amountSpent(new BigDecimal("8500")).month(4).year(2026).category(food).user(testUser).build();
        Budget b2 = Budget.builder().id(2L).amountLimit(new BigDecimal("5000")).amountSpent(new BigDecimal("2000")).month(4).year(2026).user(testUser).build();

        when(userService.getCurrentUserId()).thenReturn(1L);
        when(budgetRepository.findByUserId(1L)).thenReturn(Arrays.asList(b1, b2));

        List<BudgetResponse> result = budgetService.getAllBudgets();

        assertEquals(2, result.size());

        // First budget should trigger alert (85% used)
        BudgetResponse alert = result.get(0);
        assertTrue(alert.isAlert());
        assertEquals(85.0, alert.getPercentageUsed(), 0.1);

        // Second budget should not alert (40% used)
        BudgetResponse safe = result.get(1);
        assertFalse(safe.isAlert());
        assertEquals(40.0, safe.getPercentageUsed(), 0.1);
    }

    @Test
    @DisplayName("Should calculate remaining budget correctly")
    void testRemainingBudget() {
        Budget budget = Budget.builder().id(1L).amountLimit(new BigDecimal("20000")).amountSpent(new BigDecimal("12000")).month(4).year(2026).user(testUser).build();

        when(userService.getCurrentUserId()).thenReturn(1L);
        when(budgetRepository.findByUserId(1L)).thenReturn(Arrays.asList(budget));

        List<BudgetResponse> result = budgetService.getAllBudgets();

        assertEquals(new BigDecimal("8000"), result.get(0).getRemaining());
    }
}
