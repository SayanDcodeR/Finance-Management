package com.financeapp.service;

import com.financeapp.dto.request.RecurringTransactionRequest;
import com.financeapp.dto.response.RecurringTransactionResponse;
import com.financeapp.entity.*;
import com.financeapp.exception.ResourceNotFoundException;
import com.financeapp.repository.IncomeRepository;
import com.financeapp.repository.ExpenseRepository;
import com.financeapp.repository.RecurringTransactionRepository;
import com.financeapp.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecurringTransactionService {

    private final RecurringTransactionRepository recurringRepository;
    private final TransactionRepository transactionRepository;
    private final IncomeRepository incomeRepository;
    private final ExpenseRepository expenseRepository;
    private final CategoryService categoryService;
    private final UserService userService;

    public List<RecurringTransactionResponse> getAllRecurring() {
        Long userId = userService.getCurrentUserId();
        return recurringRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public RecurringTransactionResponse createRecurring(RecurringTransactionRequest request) {
        User user = userService.getCurrentUser();
        Category category = request.getCategoryId() != null ?
                categoryService.getCategoryEntity(request.getCategoryId()) : null;

        RecurringTransaction recurring = RecurringTransaction.builder()
                .type(request.getType().toUpperCase())
                .title(request.getTitle())
                .amount(request.getAmount())
                .frequency(request.getFrequency().toUpperCase())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .nextExecutionDate(request.getStartDate())
                .active(true)
                .category(category)
                .user(user)
                .build();

        return mapToResponse(recurringRepository.save(recurring));
    }

    @Transactional
    public RecurringTransactionResponse updateRecurring(Long id, RecurringTransactionRequest request) {
        RecurringTransaction recurring = getRecurringEntity(id);
        Category category = request.getCategoryId() != null ?
                categoryService.getCategoryEntity(request.getCategoryId()) : null;

        recurring.setType(request.getType().toUpperCase());
        recurring.setTitle(request.getTitle());
        recurring.setAmount(request.getAmount());
        recurring.setFrequency(request.getFrequency().toUpperCase());
        recurring.setStartDate(request.getStartDate());
        recurring.setEndDate(request.getEndDate());
        recurring.setCategory(category);

        return mapToResponse(recurringRepository.save(recurring));
    }

    @Transactional
    public RecurringTransactionResponse toggleActive(Long id) {
        RecurringTransaction recurring = getRecurringEntity(id);
        recurring.setActive(!recurring.getActive());
        return mapToResponse(recurringRepository.save(recurring));
    }

    @Transactional
    public void deleteRecurring(Long id) {
        RecurringTransaction recurring = getRecurringEntity(id);
        recurringRepository.delete(recurring);
    }

    /**
     * Scheduled task that runs daily at midnight to process recurring transactions
     */
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void processRecurringTransactions() {
        LocalDate today = LocalDate.now();
        List<RecurringTransaction> dueTransactions =
                recurringRepository.findByActiveTrueAndNextExecutionDateLessThanEqual(today);

        for (RecurringTransaction recurring : dueTransactions) {
            try {
                // Create transaction record
                Transaction transaction = Transaction.builder()
                        .type(recurring.getType())
                        .amount(recurring.getAmount())
                        .date(today)
                        .description("[Recurring] " + recurring.getTitle())
                        .category(recurring.getCategory())
                        .user(recurring.getUser())
                        .build();
                transactionRepository.save(transaction);

                // Create income/expense record
                if ("INCOME".equals(recurring.getType())) {
                    Income income = Income.builder()
                            .source(recurring.getTitle())
                            .amount(recurring.getAmount())
                            .date(today)
                            .description("[Recurring] " + recurring.getTitle())
                            .category(recurring.getCategory())
                            .user(recurring.getUser())
                            .build();
                    incomeRepository.save(income);
                } else {
                    Expense expense = Expense.builder()
                            .title(recurring.getTitle())
                            .amount(recurring.getAmount())
                            .date(today)
                            .description("[Recurring] " + recurring.getTitle())
                            .category(recurring.getCategory())
                            .user(recurring.getUser())
                            .build();
                    expenseRepository.save(expense);
                }

                // Calculate next execution date
                LocalDate nextDate = calculateNextDate(recurring.getNextExecutionDate(), recurring.getFrequency());

                // Deactivate if past end date
                if (recurring.getEndDate() != null && nextDate.isAfter(recurring.getEndDate())) {
                    recurring.setActive(false);
                }

                recurring.setNextExecutionDate(nextDate);
                recurringRepository.save(recurring);

                log.info("Processed recurring transaction: {} for user: {}",
                        recurring.getTitle(), recurring.getUser().getUsername());
            } catch (Exception e) {
                log.error("Error processing recurring transaction {}: {}", recurring.getId(), e.getMessage());
            }
        }
    }

    private LocalDate calculateNextDate(LocalDate currentDate, String frequency) {
        return switch (frequency) {
            case "DAILY" -> currentDate.plusDays(1);
            case "WEEKLY" -> currentDate.plusWeeks(1);
            case "MONTHLY" -> currentDate.plusMonths(1);
            case "YEARLY" -> currentDate.plusYears(1);
            default -> currentDate.plusMonths(1);
        };
    }

    private RecurringTransaction getRecurringEntity(Long id) {
        Long userId = userService.getCurrentUserId();
        RecurringTransaction recurring = recurringRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Recurring Transaction", "id", id));
        if (!recurring.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Recurring Transaction", "id", id);
        }
        return recurring;
    }

    private RecurringTransactionResponse mapToResponse(RecurringTransaction recurring) {
        return RecurringTransactionResponse.builder()
                .id(recurring.getId())
                .type(recurring.getType())
                .title(recurring.getTitle())
                .amount(recurring.getAmount())
                .frequency(recurring.getFrequency())
                .startDate(recurring.getStartDate())
                .endDate(recurring.getEndDate())
                .nextExecutionDate(recurring.getNextExecutionDate())
                .active(recurring.getActive())
                .categoryId(recurring.getCategory() != null ? recurring.getCategory().getId() : null)
                .categoryName(recurring.getCategory() != null ? recurring.getCategory().getName() : null)
                .build();
    }
}
