package com.first.pfm.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "alerts", indexes = {
    @Index(name = "idx_alert_user_read", columnList = "userId,read"),
    @Index(name = "idx_alert_dedup", columnList = "userId,categoryId,thresholdPercent,triggeredAt")
})
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
