package com.financeapp.service;

import com.financeapp.dto.request.GoalRequest;
import com.financeapp.dto.response.GoalResponse;
import com.financeapp.entity.FinancialGoal;
import com.financeapp.entity.User;
import com.financeapp.exception.ResourceNotFoundException;
import com.financeapp.repository.FinancialGoalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FinancialGoalService {

    private final FinancialGoalRepository goalRepository;
    private final UserService userService;

    public List<GoalResponse> getAllGoals() {
        Long userId = userService.getCurrentUserId();
        return goalRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public GoalResponse getGoalById(Long id) {
        return mapToResponse(getGoalEntity(id));
    }

    @Transactional
    public GoalResponse createGoal(GoalRequest request) {
        User user = userService.getCurrentUser();

        FinancialGoal goal = FinancialGoal.builder()
                .name(request.getName())
                .targetAmount(request.getTargetAmount())
                .currentAmount(request.getCurrentAmount() != null ? request.getCurrentAmount() : BigDecimal.ZERO)
                .startDate(request.getStartDate())
                .targetDate(request.getTargetDate())
                .status("IN_PROGRESS")
                .user(user)
                .build();

        return mapToResponse(goalRepository.save(goal));
    }

    @Transactional
    public GoalResponse updateGoal(Long id, GoalRequest request) {
        FinancialGoal goal = getGoalEntity(id);
        goal.setName(request.getName());
        goal.setTargetAmount(request.getTargetAmount());
        if (request.getCurrentAmount() != null) {
            goal.setCurrentAmount(request.getCurrentAmount());
        }
        goal.setStartDate(request.getStartDate());
        goal.setTargetDate(request.getTargetDate());

        // Auto-complete if target reached
        if (goal.getCurrentAmount().compareTo(goal.getTargetAmount()) >= 0) {
            goal.setStatus("COMPLETED");
        }

        return mapToResponse(goalRepository.save(goal));
    }

    @Transactional
    public GoalResponse updateProgress(Long id, BigDecimal amount) {
        FinancialGoal goal = getGoalEntity(id);
        goal.setCurrentAmount(amount);

        if (goal.getCurrentAmount().compareTo(goal.getTargetAmount()) >= 0) {
            goal.setStatus("COMPLETED");
        }

        return mapToResponse(goalRepository.save(goal));
    }

    @Transactional
    public void deleteGoal(Long id) {
        FinancialGoal goal = getGoalEntity(id);
        goalRepository.delete(goal);
    }

    public List<GoalResponse> getActiveGoals() {
        Long userId = userService.getCurrentUserId();
        return goalRepository.findByUserIdAndStatus(userId, "IN_PROGRESS").stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private FinancialGoal getGoalEntity(Long id) {
        Long userId = userService.getCurrentUserId();
        FinancialGoal goal = goalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Financial Goal", "id", id));
        if (!goal.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Financial Goal", "id", id);
        }
        return goal;
    }

    private GoalResponse mapToResponse(FinancialGoal goal) {
        double progress = goal.getTargetAmount().compareTo(BigDecimal.ZERO) > 0 ?
                goal.getCurrentAmount().multiply(BigDecimal.valueOf(100))
                        .divide(goal.getTargetAmount(), 2, RoundingMode.HALF_UP).doubleValue() : 0;

        return GoalResponse.builder()
                .id(goal.getId())
                .name(goal.getName())
                .targetAmount(goal.getTargetAmount())
                .currentAmount(goal.getCurrentAmount())
                .progressPercentage(Math.min(progress, 100.0))
                .startDate(goal.getStartDate())
                .targetDate(goal.getTargetDate())
                .status(goal.getStatus())
                .build();
    }
}
