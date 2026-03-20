package com.first.pfm.repository;

import com.first.pfm.model.BudgetProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BudgetProfileRepository extends JpaRepository<BudgetProfile, Long> {
    Optional<BudgetProfile> findByUserId(Long userId);
}
