package com.first.pfm.service;

import com.first.pfm.config.SecurityUtils;
import com.first.pfm.dto.ExpenseDto;
import com.first.pfm.exception.ResourceNotFoundException;
import com.first.pfm.model.Category;
import com.first.pfm.model.Expense;
import com.first.pfm.repository.CategoryRepository;
import com.first.pfm.repository.ExpenseRepository;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final CategoryRepository categoryRepository;
    private final SecurityUtils securityUtils;
    private final AlertService alertService;

    public ExpenseService(ExpenseRepository expenseRepository,
                          CategoryRepository categoryRepository,
                          SecurityUtils securityUtils,
                          @Lazy AlertService alertService) {
        this.expenseRepository = expenseRepository;
        this.categoryRepository = categoryRepository;
        this.securityUtils = securityUtils;
        this.alertService = alertService;
    }

    public List<ExpenseDto> getByMonth(String month) {
        Long userId = securityUtils.getCurrentUser().getId();
        YearMonth ym = YearMonth.parse(month);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();
        List<Expense> expenses = expenseRepository.findByUserIdAndDateBetweenOrderByDateDesc(userId, start, end);
        return toDtos(expenses);
    }

    public List<ExpenseDto> search(String month, Long categoryId, String keyword) {
        Long userId = securityUtils.getCurrentUser().getId();
        YearMonth ym = YearMonth.parse(month);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();
        String kw = (keyword != null && !keyword.isBlank()) ? keyword.trim() : null;
        List<Expense> expenses = expenseRepository.search(userId, categoryId, start, end, kw);
        return toDtos(expenses);
    }

    @Transactional
    public ExpenseDto create(ExpenseDto dto) {
        Long userId = securityUtils.getCurrentUser().getId();
        Expense expense = new Expense();
        expense.setUserId(userId);
        expense.setCategoryId(dto.getCategoryId());
        expense.setAmount(dto.getAmount());
        expense.setNote(dto.getNote());
        expense.setDate(dto.getDate() != null ? dto.getDate() : LocalDate.now());
        ExpenseDto saved = toDto(expenseRepository.save(expense));
        alertService.evaluate(userId);
        return saved;
    }

    @Transactional
    public ExpenseDto update(Long id, ExpenseDto dto) {
        Long userId = securityUtils.getCurrentUser().getId();
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));
        if (!userId.equals(expense.getUserId())) {
            throw new IllegalArgumentException("Access denied");
        }
        expense.setCategoryId(dto.getCategoryId());
        expense.setAmount(dto.getAmount());
        expense.setNote(dto.getNote());
        if (dto.getDate() != null) expense.setDate(dto.getDate());
        ExpenseDto saved = toDto(expenseRepository.save(expense));
        alertService.evaluate(userId);
        return saved;
    }

    @Transactional
    public void delete(Long id) {
        Long userId = securityUtils.getCurrentUser().getId();
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));
        if (!userId.equals(expense.getUserId())) {
            throw new IllegalArgumentException("Access denied");
        }
        expenseRepository.delete(expense);
    }

    /** Batch-load categories for a list of expenses (avoids N+1). */
    private List<ExpenseDto> toDtos(List<Expense> expenses) {
        Set<Long> catIds = expenses.stream().map(Expense::getCategoryId).collect(Collectors.toSet());
        Map<Long, Category> catMap = categoryRepository.findAllById(catIds).stream()
                .collect(Collectors.toMap(Category::getId, c -> c));
        return expenses.stream().map(e -> toDto(e, catMap)).toList();
    }

    private ExpenseDto toDto(Expense e, Map<Long, Category> catMap) {
        ExpenseDto dto = new ExpenseDto();
        dto.setId(e.getId());
        dto.setCategoryId(e.getCategoryId());
        dto.setAmount(e.getAmount());
        dto.setNote(e.getNote());
        dto.setDate(e.getDate());
        Category cat = catMap.get(e.getCategoryId());
        if (cat != null) {
            dto.setCategoryName(cat.getName());
            dto.setCategoryColor(cat.getColor());
        }
        return dto;
    }

    public ExpenseDto toDto(Expense e) {
        ExpenseDto dto = new ExpenseDto();
        dto.setId(e.getId());
        dto.setCategoryId(e.getCategoryId());
        dto.setAmount(e.getAmount());
        dto.setNote(e.getNote());
        dto.setDate(e.getDate());
        categoryRepository.findById(e.getCategoryId()).ifPresent(cat -> {
            dto.setCategoryName(cat.getName());
            dto.setCategoryColor(cat.getColor());
        });
        return dto;
    }
}
