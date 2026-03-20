package com.first.pfm.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
public class MonthlyReportDto {
    private String month;
    private BigDecimal totalSpent;
    private BigDecimal salary;
    private BigDecimal savings;
    private List<SummaryDto.CategoryBreakdown> categoryBreakdown;
    // day -> total spent that day  (key = day-of-month as string)
    private Map<String, BigDecimal> dailyTotals;
}
