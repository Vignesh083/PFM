package com.first.pfm.model;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;

@Entity
@Table(name = "budget_profiles")
@Data
public class BudgetProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private Long userId;

    private BigDecimal monthlySalary;

    private String currency = "INR";
}
