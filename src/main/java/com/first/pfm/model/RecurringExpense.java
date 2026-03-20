package com.first.pfm.model;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "recurring_expenses")
@Data
public class RecurringExpense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private Long categoryId;

    private BigDecimal amount;

    private String description;

    // 1-28: which day of month to auto-log
    private int dayOfMonth;

    private LocalDate startDate;

    private boolean active = true;
}
