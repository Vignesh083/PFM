package com.first.pfm.repository;

import com.first.pfm.model.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findByUserIdOrderByTriggeredAtDesc(Long userId);
    List<Alert> findByUserIdAndReadFalseOrderByTriggeredAtDesc(Long userId);
    boolean existsByUserIdAndCategoryIdAndThresholdPercentAndTriggeredAtAfter(
            Long userId, Long categoryId, int thresholdPercent, LocalDateTime since);
}
