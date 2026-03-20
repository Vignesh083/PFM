package com.first.pfm.controller;

import com.first.pfm.dto.ExpenseDto;
import com.first.pfm.service.ExpenseService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @GetMapping
    public List<ExpenseDto> getExpenses(
            @RequestParam(defaultValue = "") String month,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "") String search) {
        if (month.isBlank()) {
            month = YearMonth.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
        }
        if (categoryId != null || !search.isBlank()) {
            return expenseService.search(month, categoryId, search);
        }
        return expenseService.getByMonth(month);
    }

    @PostMapping
    public ExpenseDto create(@Valid @RequestBody ExpenseDto dto) {
        return expenseService.create(dto);
    }

    @PutMapping("/{id}")
    public ExpenseDto update(@PathVariable Long id, @Valid @RequestBody ExpenseDto dto) {
        return expenseService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        expenseService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
