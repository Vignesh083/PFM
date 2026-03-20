package com.first.pfm.service;

import com.first.pfm.config.SecurityUtils;
import com.first.pfm.dto.MonthlyReportDto;
import com.first.pfm.dto.SummaryDto;
import com.first.pfm.model.BudgetProfile;
import com.first.pfm.repository.BudgetProfileRepository;
import com.first.pfm.repository.CategoryRepository;
import com.first.pfm.repository.ExpenseRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReportService {

    private final ExpenseRepository expenseRepository;
    private final CategoryRepository categoryRepository;
    private final BudgetProfileRepository budgetProfileRepository;
    private final SecurityUtils securityUtils;

    public ReportService(ExpenseRepository expenseRepository,
                         CategoryRepository categoryRepository,
                         BudgetProfileRepository budgetProfileRepository,
                         SecurityUtils securityUtils) {
        this.expenseRepository = expenseRepository;
        this.categoryRepository = categoryRepository;
        this.budgetProfileRepository = budgetProfileRepository;
        this.securityUtils = securityUtils;
    }

    public MonthlyReportDto monthlyReport(String month) {
        Long userId = securityUtils.getCurrentUser().getId();
        YearMonth ym = YearMonth.parse(month);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        BigDecimal total = expenseRepository.totalBetween(userId, start, end);
        if (total == null) total = BigDecimal.ZERO;

        // category breakdown
        List<Object[]> rows = expenseRepository.sumByCategoryBetween(userId, start, end);
        BigDecimal finalTotal = total;
        List<SummaryDto.CategoryBreakdown> breakdown = rows.stream().map(row -> {
            Long catId = ((Number) row[0]).longValue();
            BigDecimal amount = (BigDecimal) row[1];
            String name = "Unknown"; String color = "#6366f1";
            var cat = categoryRepository.findById(catId);
            if (cat.isPresent()) { name = cat.get().getName(); color = cat.get().getColor() != null ? cat.get().getColor() : color; }
            double pct = finalTotal.compareTo(BigDecimal.ZERO) > 0
                    ? amount.divide(finalTotal, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue() : 0;
            return new SummaryDto.CategoryBreakdown(catId, name, color, amount, pct);
        }).toList();

        // daily totals
        Map<String, BigDecimal> dailyTotals = new LinkedHashMap<>();
        for (int d = 1; d <= ym.lengthOfMonth(); d++) {
            LocalDate day = ym.atDay(d);
            BigDecimal dayTotal = expenseRepository.totalBetween(userId, day, day);
            dailyTotals.put(String.valueOf(d), dayTotal != null ? dayTotal : BigDecimal.ZERO);
        }

        BigDecimal salary = budgetProfileRepository.findByUserId(userId)
                .map(BudgetProfile::getMonthlySalary)
                .orElse(BigDecimal.ZERO);
        BigDecimal savings = salary.subtract(total);

        return new MonthlyReportDto(month, total, salary, savings, breakdown, dailyTotals);
    }

    public String monthlyCSV(String month) {
        Long userId = securityUtils.getCurrentUser().getId();
        YearMonth ym = YearMonth.parse(month);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        var expenses = expenseRepository.findByUserIdAndDateBetweenOrderByDateDesc(userId, start, end);
        StringBuilder sb = new StringBuilder("Date,Category,Amount,Note\n");
        for (var e : expenses) {
            String catName = categoryRepository.findById(e.getCategoryId())
                    .map(c -> c.getName()).orElse("Unknown");
            String note = e.getNote() != null ? e.getNote().replace(",", ";") : "";
            sb.append(e.getDate()).append(",")
              .append(catName).append(",")
              .append(e.getAmount()).append(",")
              .append(note).append("\n");
        }
        return sb.toString();
    }
}
