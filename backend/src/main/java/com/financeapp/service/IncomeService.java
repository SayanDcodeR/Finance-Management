package com.financeapp.service;

import com.financeapp.dto.request.IncomeRequest;
import com.financeapp.dto.response.IncomeResponse;
import com.financeapp.entity.Category;
import com.financeapp.entity.Income;
import com.financeapp.entity.Transaction;
import com.financeapp.entity.User;
import com.financeapp.exception.ResourceNotFoundException;
import com.financeapp.repository.IncomeRepository;
import com.financeapp.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IncomeService {

    private final IncomeRepository incomeRepository;
    private final TransactionRepository transactionRepository;
    private final CategoryService categoryService;
    private final UserService userService;

    public List<IncomeResponse> getAllIncomes() {
        Long userId = userService.getCurrentUserId();
        return incomeRepository.findByUserIdOrderByDateDesc(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public IncomeResponse getIncomeById(Long id) {
        return mapToResponse(getIncomeEntity(id));
    }

    public List<IncomeResponse> getIncomesByDateRange(LocalDate startDate, LocalDate endDate) {
        Long userId = userService.getCurrentUserId();
        return incomeRepository.findByUserIdAndDateBetweenOrderByDateDesc(userId, startDate, endDate).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public IncomeResponse createIncome(IncomeRequest request) {
        User user = userService.getCurrentUser();
        Category category = request.getCategoryId() != null ?
                categoryService.getCategoryEntity(request.getCategoryId()) : null;

        Income income = Income.builder()
                .source(request.getSource())
                .amount(request.getAmount())
                .date(request.getDate())
                .description(request.getDescription())
                .category(category)
                .user(user)
                .build();

        Income savedIncome = incomeRepository.save(income);

        // Create corresponding transaction record
        Transaction transaction = Transaction.builder()
                .type("INCOME")
                .amount(savedIncome.getAmount())
                .date(savedIncome.getDate())
                .description(savedIncome.getSource() + (savedIncome.getDescription() != null ? " - " + savedIncome.getDescription() : ""))
                .category(category)
                .user(user)
                .referenceId(savedIncome.getId())
                .build();
        transactionRepository.save(transaction);

        return mapToResponse(savedIncome);
    }

    @Transactional
    public IncomeResponse updateIncome(Long id, IncomeRequest request) {
        Income income = getIncomeEntity(id);
        Category category = request.getCategoryId() != null ?
                categoryService.getCategoryEntity(request.getCategoryId()) : null;

        income.setSource(request.getSource());
        income.setAmount(request.getAmount());
        income.setDate(request.getDate());
        income.setDescription(request.getDescription());
        income.setCategory(category);

        return mapToResponse(incomeRepository.save(income));
    }

    @Transactional
    public void deleteIncome(Long id) {
        Income income = getIncomeEntity(id);
        incomeRepository.delete(income);
    }

    private Income getIncomeEntity(Long id) {
        Long userId = userService.getCurrentUserId();
        Income income = incomeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Income", "id", id));
        if (!income.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Income", "id", id);
        }
        return income;
    }

    private IncomeResponse mapToResponse(Income income) {
        return IncomeResponse.builder()
                .id(income.getId())
                .source(income.getSource())
                .amount(income.getAmount())
                .date(income.getDate())
                .description(income.getDescription())
                .categoryId(income.getCategory() != null ? income.getCategory().getId() : null)
                .categoryName(income.getCategory() != null ? income.getCategory().getName() : null)
                .createdAt(income.getCreatedAt())
                .build();
    }
}
