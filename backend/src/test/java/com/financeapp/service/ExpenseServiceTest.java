package com.financeapp.service;

import com.financeapp.dto.request.ExpenseRequest;
import com.financeapp.dto.response.ExpenseResponse;
import com.financeapp.entity.Category;
import com.financeapp.entity.Expense;
import com.financeapp.entity.User;
import com.financeapp.repository.BudgetRepository;
import com.financeapp.repository.ExpenseRepository;
import com.financeapp.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExpenseServiceTest {

    @Mock private ExpenseRepository expenseRepository;
    @Mock private TransactionRepository transactionRepository;
    @Mock private BudgetRepository budgetRepository;
    @Mock private CategoryService categoryService;
    @Mock private UserService userService;

    @InjectMocks private ExpenseService expenseService;

    private User testUser;
    private Category testCategory;

    @BeforeEach
    void setUp() {
        testUser = User.builder().id(1L).username("testuser").build();
        testCategory = Category.builder().id(1L).name("Food").type("EXPENSE").user(testUser).build();
    }

    @Test
    @DisplayName("Should return all expenses for current user")
    void testGetAllExpenses() {
        Expense e1 = Expense.builder().id(1L).title("Groceries").amount(new BigDecimal("2000")).date(LocalDate.now()).user(testUser).category(testCategory).build();
        Expense e2 = Expense.builder().id(2L).title("Dinner").amount(new BigDecimal("500")).date(LocalDate.now()).user(testUser).build();

        when(userService.getCurrentUserId()).thenReturn(1L);
        when(expenseRepository.findByUserIdOrderByDateDesc(1L)).thenReturn(Arrays.asList(e1, e2));

        List<ExpenseResponse> result = expenseService.getAllExpenses();

        assertEquals(2, result.size());
        assertEquals("Groceries", result.get(0).getTitle());
    }

    @Test
    @DisplayName("Should create expense with transaction record")
    void testCreateExpense() {
        ExpenseRequest request = new ExpenseRequest("Rent", new BigDecimal("15000"), LocalDate.now(), "Monthly rent", null);
        Expense saved = Expense.builder().id(1L).title("Rent").amount(new BigDecimal("15000")).date(LocalDate.now()).user(testUser).build();

        when(userService.getCurrentUser()).thenReturn(testUser);
        when(expenseRepository.save(any(Expense.class))).thenReturn(saved);
        when(transactionRepository.save(any())).thenReturn(null);

        ExpenseResponse result = expenseService.createExpense(request);

        assertNotNull(result);
        assertEquals("Rent", result.getTitle());
        assertEquals(new BigDecimal("15000"), result.getAmount());
        verify(transactionRepository, times(1)).save(any());
    }
}
