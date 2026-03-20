package com.first.pfm.repository;

import com.first.pfm.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    // system defaults (userId is null) + user-created ones
    List<Category> findByUserIdIsNull();
    List<Category> findByUserId(Long userId);
}
