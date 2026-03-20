package com.first.pfm.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class CategoryBudgetDto {
    private Long categoryId;
    private String categoryName;
    private String categoryColor;
    private BigDecimal limitAmount;
    private BigDecimal spent;
    private double percentUsed;
}
