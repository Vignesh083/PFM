package com.first.pfm.service;

import com.first.pfm.config.SecurityUtils;
import com.first.pfm.dto.BudgetProfileDto;
import com.first.pfm.dto.CategoryBudgetDto;
import com.first.pfm.model.BudgetProfile;
import com.first.pfm.model.Category;
import com.first.pfm.model.CategoryBudget;
import com.first.pfm.repository.BudgetProfileRepository;
import com.first.pfm.repository.CategoryBudgetRepository;
import com.first.pfm.repository.CategoryRepository;
import com.first.pfm.repository.ExpenseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class BudgetService {

    private final BudgetProfileRepository budgetProfileRepository;
    private final CategoryBudgetRepository categoryBudgetRepository;
    private final CategoryRepository categoryRepository;
    private final ExpenseRepository expenseRepository;
    private final SecurityUtils securityUtils;

    public BudgetService(BudgetProfileRepository budgetProfileRepository,
                         CategoryBudgetRepository categoryBudgetRepository,
                         CategoryRepository categoryRepository,
                         ExpenseRepository expenseRepository,
                         SecurityUtils securityUtils) {
        this.budgetProfileRepository = budgetProfileRepository;
        this.categoryBudgetRepository = categoryBudgetRepository;
        this.categoryRepository = categoryRepository;
        this.expenseRepository = expenseRepository;
        this.securityUtils = securityUtils;
    }

    public BudgetProfileDto getProfile() {
        Long userId = securityUtils.getCurrentUser().getId();
        return budgetProfileRepository.findByUserId(userId)
                .map(this::toProfileDto)
                .orElseGet(() -> {
                    BudgetProfileDto dto = new BudgetProfileDto();
                    dto.setMonthlySalary(BigDecimal.ZERO);
                    dto.setCurrency("INR");
                    return dto;
                });
    }

    @Transactional
    public BudgetProfileDto saveProfile(BudgetProfileDto dto) {
        Long userId = securityUtils.getCurrentUser().getId();
        BudgetProfile profile = budgetProfileRepository.findByUserId(userId)
                .orElseGet(BudgetProfile::new);
        profile.setUserId(userId);
        profile.setMonthlySalary(dto.getMonthlySalary());
        profile.setCurrency(dto.getCurrency() != null ? dto.getCurrency() : "INR");
        return toProfileDto(budgetProfileRepository.save(profile));
    }

    public List<CategoryBudgetDto> getCategoryBudgets() {
        Long userId = securityUtils.getCurrentUser().getId();
        List<CategoryBudget> budgets = categoryBudgetRepository.findByUserId(userId);
        if (budgets.isEmpty()) return List.of();

        Set<Long> catIds = budgets.stream().map(CategoryBudget::getCategoryId).collect(Collectors.toSet());
        Map<Long, Category> catMap = categoryRepository.findAllById(catIds).stream()
                .collect(Collectors.toMap(Category::getId, c -> c));

        return budgets.stream().map(cb -> toCategoryBudgetDto(cb, catMap)).toList();
    }

    @Transactional
    public CategoryBudgetDto setCategoryBudget(Long categoryId, BigDecimal limit) {
        Long userId = securityUtils.getCurrentUser().getId();
        CategoryBudget cb = categoryBudgetRepository.findByUserIdAndCategoryId(userId, categoryId)
                .orElseGet(CategoryBudget::new);
        cb.setUserId(userId);
        cb.setCategoryId(categoryId);
        cb.setLimitAmount(limit);
        CategoryBudget saved = categoryBudgetRepository.save(cb);

        Map<Long, Category> catMap = categoryRepository.findAllById(List.of(categoryId)).stream()
                .collect(Collectors.toMap(Category::getId, c -> c));
        return toCategoryBudgetDto(saved, catMap);
    }

    @Transactional
    public void deleteCategoryBudget(Long categoryId) {
        Long userId = securityUtils.getCurrentUser().getId();
        categoryBudgetRepository.findByUserIdAndCategoryId(userId, categoryId)
                .ifPresent(categoryBudgetRepository::delete);
    }

    public List<CategoryBudgetDto> getComparison(String month) {
        Long userId = securityUtils.getCurrentUser().getId();
        YearMonth ym = YearMonth.parse(month);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        List<CategoryBudget> budgets = categoryBudgetRepository.findByUserId(userId);
        if (budgets.isEmpty()) return List.of();

        // Single query for all category spending
        Map<Long, BigDecimal> spentByCategory = expenseRepository.sumByCategoryBetween(userId, start, end)
                .stream().collect(Collectors.toMap(
                        row -> ((Number) row[0]).longValue(),
                        row -> (BigDecimal) row[1]));

        // Batch-load all categories
        Set<Long> catIds = budgets.stream().map(CategoryBudget::getCategoryId).collect(Collectors.toSet());
        Map<Long, Category> catMap = categoryRepository.findAllById(catIds).stream()
                .collect(Collectors.toMap(Category::getId, c -> c));

        return budgets.stream().map(cb -> {
            BigDecimal catSpent = spentByCategory.getOrDefault(cb.getCategoryId(), BigDecimal.ZERO);
            CategoryBudgetDto dto = new CategoryBudgetDto();
            dto.setCategoryId(cb.getCategoryId());
            dto.setLimitAmount(cb.getLimitAmount());
            dto.setSpent(catSpent);
            Category cat = catMap.get(cb.getCategoryId());
            if (cat != null) {
                dto.setCategoryName(cat.getName());
                dto.setCategoryColor(cat.getColor());
            }
            if (cb.getLimitAmount() != null && cb.getLimitAmount().compareTo(BigDecimal.ZERO) > 0) {
                dto.setPercentUsed(catSpent.divide(cb.getLimitAmount(), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100)).doubleValue());
            }
            return dto;
        }).toList();
    }

    private BudgetProfileDto toProfileDto(BudgetProfile p) {
        BudgetProfileDto dto = new BudgetProfileDto();
        dto.setMonthlySalary(p.getMonthlySalary());
        dto.setCurrency(p.getCurrency());
        return dto;
    }

    private CategoryBudgetDto toCategoryBudgetDto(CategoryBudget cb, Map<Long, Category> catMap) {
        CategoryBudgetDto dto = new CategoryBudgetDto();
        dto.setCategoryId(cb.getCategoryId());
        dto.setLimitAmount(cb.getLimitAmount());
        dto.setSpent(BigDecimal.ZERO);
        Category cat = catMap.get(cb.getCategoryId());
        if (cat != null) {
            dto.setCategoryName(cat.getName());
            dto.setCategoryColor(cat.getColor());
        }
        return dto;
    }
}
