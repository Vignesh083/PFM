package com.first.pfm.controller;

import com.first.pfm.dto.BudgetProfileDto;
import com.first.pfm.dto.CategoryBudgetDto;
import com.first.pfm.service.BudgetService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/budget")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @GetMapping("/profile")
    public BudgetProfileDto getProfile() {
        return budgetService.getProfile();
    }

    @PutMapping("/profile")
    public BudgetProfileDto saveProfile(@RequestBody BudgetProfileDto dto) {
        return budgetService.saveProfile(dto);
    }

    @GetMapping("/categories")
    public List<CategoryBudgetDto> getCategoryBudgets() {
        return budgetService.getCategoryBudgets();
    }

    @PutMapping("/categories/{categoryId}")
    public CategoryBudgetDto setCategoryBudget(
            @PathVariable Long categoryId,
            @RequestParam BigDecimal limit) {
        return budgetService.setCategoryBudget(categoryId, limit);
    }

    @DeleteMapping("/categories/{categoryId}")
    public ResponseEntity<Void> deleteCategoryBudget(@PathVariable Long categoryId) {
        budgetService.deleteCategoryBudget(categoryId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/comparison")
    public List<CategoryBudgetDto> getComparison(
            @RequestParam(defaultValue = "") String month) {
        if (month.isBlank()) {
            month = YearMonth.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
        }
        return budgetService.getComparison(month);
    }
}
