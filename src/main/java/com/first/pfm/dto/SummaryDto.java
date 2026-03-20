package com.first.pfm.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
public class SummaryDto {
    private BigDecimal total;
    private List<CategoryBreakdown> breakdown;

    @Data
    @AllArgsConstructor
    public static class CategoryBreakdown {
        private Long categoryId;
        private String categoryName;
        private String categoryColor;
        private BigDecimal amount;
        private double percentage;
    }
}
