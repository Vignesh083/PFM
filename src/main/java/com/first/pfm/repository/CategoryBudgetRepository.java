package com.first.pfm.repository;

import com.first.pfm.model.CategoryBudget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryBudgetRepository extends JpaRepository<CategoryBudget, Long> {
    List<CategoryBudget> findByUserId(Long userId);
    Optional<CategoryBudget> findByUserIdAndCategoryId(Long userId, Long categoryId);
}
