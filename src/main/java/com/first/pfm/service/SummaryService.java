package com.first.pfm.service;

import com.first.pfm.config.SecurityUtils;
import com.first.pfm.dto.SummaryDto;
import com.first.pfm.model.Category;
import com.first.pfm.repository.CategoryRepository;
import com.first.pfm.repository.ExpenseRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Year;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class SummaryService {

    private final ExpenseRepository expenseRepository;
    private final CategoryRepository categoryRepository;
    private final SecurityUtils securityUtils;

    public SummaryService(ExpenseRepository expenseRepository,
                          CategoryRepository categoryRepository,
                          SecurityUtils securityUtils) {
        this.expenseRepository = expenseRepository;
        this.categoryRepository = categoryRepository;
        this.securityUtils = securityUtils;
    }

    public SummaryDto daily(LocalDate date) {
        Long userId = securityUtils.getCurrentUser().getId();
        return buildSummary(userId, date, date);
    }

    public SummaryDto monthly(String month) {
        Long userId = securityUtils.getCurrentUser().getId();
        YearMonth ym = YearMonth.parse(month);
        return buildSummary(userId, ym.atDay(1), ym.atEndOfMonth());
    }

    public SummaryDto yearly(int year) {
        Long userId = securityUtils.getCurrentUser().getId();
        LocalDate start = Year.of(year).atDay(1);
        LocalDate end = LocalDate.of(year, 12, 31);
        return buildSummary(userId, start, end);
    }

    private SummaryDto buildSummary(Long userId, LocalDate start, LocalDate end) {
        BigDecimal total = expenseRepository.totalBetween(userId, start, end);
        if (total == null) total = BigDecimal.ZERO;

        List<Object[]> rows = expenseRepository.sumByCategoryBetween(userId, start, end);

        // Batch-load all categories in one query
        Set<Long> catIds = rows.stream()
                .map(row -> ((Number) row[0]).longValue())
                .collect(Collectors.toSet());
        Map<Long, Category> catMap = categoryRepository.findAllById(catIds).stream()
                .collect(Collectors.toMap(Category::getId, c -> c));

        BigDecimal finalTotal = total;
        List<SummaryDto.CategoryBreakdown> breakdown = rows.stream().map(row -> {
            Long catId = ((Number) row[0]).longValue();
            BigDecimal amount = (BigDecimal) row[1];
            String name = "Unknown";
            String color = "#6366f1";
            Category cat = catMap.get(catId);
            if (cat != null) {
                name = cat.getName();
                color = cat.getColor() != null ? cat.getColor() : color;
            }
            double pct = finalTotal.compareTo(BigDecimal.ZERO) > 0
                    ? amount.divide(finalTotal, 4, RoundingMode.HALF_UP)
                            .multiply(BigDecimal.valueOf(100)).doubleValue()
                    : 0.0;
            return new SummaryDto.CategoryBreakdown(catId, name, color, amount, pct);
        }).toList();

        return new SummaryDto(finalTotal, breakdown);
    }
}
