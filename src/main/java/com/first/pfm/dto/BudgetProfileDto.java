package com.first.pfm.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class BudgetProfileDto {
    private BigDecimal monthlySalary;
    private String currency;
}
