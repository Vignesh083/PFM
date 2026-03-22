package com.first.pfm.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "alerts", indexes = {
    @Index(name = "idx_alert_user_read", columnList = "user_id,is_read"),
    @Index(name = "idx_alert_dedup", columnList = "user_id,category_id,threshold_percent,triggered_at")
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

    @Column(name = "is_read")
    private boolean read = false;

    private LocalDateTime triggeredAt;
}
