package com.financeapp.service;

import com.financeapp.dto.request.IncomeRequest;
import com.financeapp.dto.response.IncomeResponse;
import com.financeapp.entity.Category;
import com.financeapp.entity.Income;
import com.financeapp.entity.User;
import com.financeapp.exception.ResourceNotFoundException;
import com.financeapp.repository.IncomeRepository;
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
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class IncomeServiceTest {

    @Mock private IncomeRepository incomeRepository;
    @Mock private TransactionRepository transactionRepository;
    @Mock private CategoryService categoryService;
    @Mock private UserService userService;

    @InjectMocks private IncomeService incomeService;

    private User testUser;
    private Category testCategory;

    @BeforeEach
    void setUp() {
        testUser = User.builder().id(1L).username("testuser").email("test@email.com").build();
        testCategory = Category.builder().id(1L).name("Salary").type("INCOME").user(testUser).build();
    }

    @Test
    @DisplayName("Should return all incomes for current user")
    void testGetAllIncomes() {
        Income income1 = Income.builder().id(1L).source("Salary").amount(new BigDecimal("50000")).date(LocalDate.now()).user(testUser).category(testCategory).build();
        Income income2 = Income.builder().id(2L).source("Freelance").amount(new BigDecimal("15000")).date(LocalDate.now()).user(testUser).build();

        when(userService.getCurrentUserId()).thenReturn(1L);
        when(incomeRepository.findByUserIdOrderByDateDesc(1L)).thenReturn(Arrays.asList(income1, income2));

        List<IncomeResponse> result = incomeService.getAllIncomes();

        assertEquals(2, result.size());
        assertEquals("Salary", result.get(0).getSource());
        assertEquals(new BigDecimal("50000"), result.get(0).getAmount());
        assertEquals("Freelance", result.get(1).getSource());
    }

    @Test
    @DisplayName("Should create income and return response")
    void testCreateIncome() {
        IncomeRequest request = new IncomeRequest("Bonus", new BigDecimal("10000"), LocalDate.now(), "Year-end bonus", 1L);
        Income savedIncome = Income.builder().id(3L).source("Bonus").amount(new BigDecimal("10000")).date(LocalDate.now()).description("Year-end bonus").category(testCategory).user(testUser).build();

        when(userService.getCurrentUser()).thenReturn(testUser);
        when(categoryService.getCategoryEntity(1L)).thenReturn(testCategory);
        when(incomeRepository.save(any(Income.class))).thenReturn(savedIncome);
        when(transactionRepository.save(any())).thenReturn(null);

        IncomeResponse result = incomeService.createIncome(request);

        assertNotNull(result);
        assertEquals("Bonus", result.getSource());
        assertEquals(new BigDecimal("10000"), result.getAmount());
        assertEquals("Salary", result.getCategoryName());
        verify(incomeRepository, times(1)).save(any(Income.class));
        verify(transactionRepository, times(1)).save(any());
    }

    @Test
    @DisplayName("Should throw exception when income not found")
    void testGetIncomeByIdNotFound() {
        when(userService.getCurrentUserId()).thenReturn(1L);
        when(incomeRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> incomeService.getIncomeById(999L));
    }

    @Test
    @DisplayName("Should delete income successfully")
    void testDeleteIncome() {
        Income income = Income.builder().id(1L).source("Test").amount(new BigDecimal("1000")).user(testUser).build();

        when(userService.getCurrentUserId()).thenReturn(1L);
        when(incomeRepository.findById(1L)).thenReturn(Optional.of(income));
        doNothing().when(incomeRepository).delete(income);

        assertDoesNotThrow(() -> incomeService.deleteIncome(1L));
        verify(incomeRepository, times(1)).delete(income);
    }
}
