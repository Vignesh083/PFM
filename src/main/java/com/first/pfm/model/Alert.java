package com.first.pfm.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "alerts")
@Data
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    // null = total budget alert
    private Long categoryId;

    private String categoryName;

    private int thresholdPercent;

    private String message;

    private boolean read = false;

    private LocalDateTime triggeredAt;
}
