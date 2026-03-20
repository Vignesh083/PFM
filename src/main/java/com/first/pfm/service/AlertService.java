package com.first.pfm.service;

import com.first.pfm.model.Alert;
import com.first.pfm.model.CategoryBudget;
import com.first.pfm.repository.AlertRepository;
import com.first.pfm.repository.BudgetProfileRepository;
import com.first.pfm.repository.CategoryBudgetRepository;
import com.first.pfm.repository.CategoryRepository;
import com.first.pfm.repository.ExpenseRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;

@Service
public class AlertService {

    private static final int[] THRESHOLDS = {80, 90, 100};

    private final AlertRepository alertRepository;
    private final BudgetProfileRepository budgetProfileRepository;
    private final CategoryBudgetRepository categoryBudgetRepository;
    private final ExpenseRepository expenseRepository;
    private final CategoryRepository categoryRepository;

    public AlertService(AlertRepository alertRepository,
                        BudgetProfileRepository budgetProfileRepository,
                        CategoryBudgetRepository categoryBudgetRepository,
                        ExpenseRepository expenseRepository,
                        CategoryRepository categoryRepository) {
        this.alertRepository = alertRepository;
        this.budgetProfileRepository = budgetProfileRepository;
        this.categoryBudgetRepository = categoryBudgetRepository;
        this.expenseRepository = expenseRepository;
        this.categoryRepository = categoryRepository;
    }

    /** Called after every expense is created/updated. */
    public void evaluate(Long userId) {
        YearMonth ym = YearMonth.now();
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();
        LocalDateTime monthStart = start.atStartOfDay();

        // 1. Per-category alerts
        List<CategoryBudget> limits = categoryBudgetRepository.findByUserId(userId);
        for (CategoryBudget limit : limits) {
            if (limit.getLimitAmount() == null || limit.getLimitAmount().compareTo(BigDecimal.ZERO) == 0) continue;

            BigDecimal catSpent = expenseRepository.sumByCategoryBetween(userId, start, end)
                    .stream()
                    .filter(row -> limit.getCategoryId().equals(((Number) row[0]).longValue()))
                    .map(row -> (BigDecimal) row[1])
                    .findFirst().orElse(BigDecimal.ZERO);

            double pct = catSpent.divide(limit.getLimitAmount(), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100)).doubleValue();

            String catName = categoryRepository.findById(limit.getCategoryId())
                    .map(c -> c.getName()).orElse("Unknown");

            for (int threshold : THRESHOLDS) {
                if (pct >= threshold) {
                    boolean alreadyFired = alertRepository
                            .existsByUserIdAndCategoryIdAndThresholdPercentAndTriggeredAtAfter(
                                    userId, limit.getCategoryId(), threshold, monthStart);
                    if (!alreadyFired) {
                        Alert alert = new Alert();
                        alert.setUserId(userId);
                        alert.setCategoryId(limit.getCategoryId());
                        alert.setCategoryName(catName);
                        alert.setThresholdPercent(threshold);
                        alert.setMessage(catName + " budget is " + threshold + "% used ("
                                + catSpent.toPlainString() + " / " + limit.getLimitAmount().toPlainString() + ")");
                        alert.setTriggeredAt(LocalDateTime.now());
                        alertRepository.save(alert);
                    }
                }
            }
        }

        // 2. Total salary alert
        budgetProfileRepository.findByUserId(userId).ifPresent(profile -> {
            if (profile.getMonthlySalary() == null || profile.getMonthlySalary().compareTo(BigDecimal.ZERO) == 0) return;
            BigDecimal totalSpent = expenseRepository.totalBetween(userId, start, end);
            if (totalSpent == null) totalSpent = BigDecimal.ZERO;
            double pct = totalSpent.divide(profile.getMonthlySalary(), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100)).doubleValue();
            for (int threshold : THRESHOLDS) {
                if (pct >= threshold) {
                    boolean alreadyFired = alertRepository
                            .existsByUserIdAndCategoryIdAndThresholdPercentAndTriggeredAtAfter(
                                    userId, null, threshold, monthStart);
                    if (!alreadyFired) {
                        Alert alert = new Alert();
                        alert.setUserId(userId);
                        alert.setCategoryId(null);
                        alert.setCategoryName("Total Budget");
                        alert.setThresholdPercent(threshold);
                        alert.setMessage("You have used " + threshold + "% of your monthly salary ("
                                + totalSpent.toPlainString() + " / " + profile.getMonthlySalary().toPlainString() + ")");
                        alert.setTriggeredAt(LocalDateTime.now());
                        alertRepository.save(alert);
                    }
                }
            }
        });
    }

    public List<Alert> getUnread(Long userId) {
        return alertRepository.findByUserIdAndReadFalseOrderByTriggeredAtDesc(userId);
    }

    public List<Alert> getAll(Long userId) {
        return alertRepository.findByUserIdOrderByTriggeredAtDesc(userId);
    }

    public void markRead(Long alertId) {
        alertRepository.findById(alertId).ifPresent(a -> {
            a.setRead(true);
            alertRepository.save(a);
        });
    }

    public void markAllRead(Long userId) {
        List<Alert> unread = alertRepository.findByUserIdAndReadFalseOrderByTriggeredAtDesc(userId);
        unread.forEach(a -> a.setRead(true));
        alertRepository.saveAll(unread);
    }
}
