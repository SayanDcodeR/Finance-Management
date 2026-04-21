package com.financeapp.service;

import com.financeapp.dto.response.TransactionResponse;
import com.financeapp.entity.Transaction;
import com.financeapp.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserService userService;

    public Page<TransactionResponse> getTransactions(int page, int size, String type,
                                                      Long categoryId, LocalDate startDate, LocalDate endDate) {
        Long userId = userService.getCurrentUserId();
        Pageable pageable = PageRequest.of(page, size, Sort.by("date").descending());

        return transactionRepository.findByFilters(userId, type, categoryId, startDate, endDate, pageable)
                .map(this::mapToResponse);
    }

    public List<TransactionResponse> searchTransactions(String query) {
        Long userId = userService.getCurrentUserId();
        return transactionRepository.searchByDescription(userId, query).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<TransactionResponse> getRecentTransactions() {
        Long userId = userService.getCurrentUserId();
        return transactionRepository.findTop5ByUserIdOrderByDateDesc(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private TransactionResponse mapToResponse(Transaction transaction) {
        return TransactionResponse.builder()
                .id(transaction.getId())
                .type(transaction.getType())
                .amount(transaction.getAmount())
                .date(transaction.getDate())
                .description(transaction.getDescription())
                .categoryId(transaction.getCategory() != null ? transaction.getCategory().getId() : null)
                .categoryName(transaction.getCategory() != null ? transaction.getCategory().getName() : null)
                .createdAt(transaction.getCreatedAt())
                .build();
    }
}
