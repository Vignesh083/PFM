package com.first.pfm.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class RecurringExpenseDto {
    private Long id;
    private Long categoryId;
    private String categoryName;
    private String categoryColor;
    private BigDecimal amount;
    private String description;
    private int dayOfMonth;
    private LocalDate startDate;
    private boolean active;
}
