package com.first.pfm.service;

import com.first.pfm.config.SecurityUtils;
import com.first.pfm.dto.RecurringExpenseDto;
import com.first.pfm.exception.ResourceNotFoundException;
import com.first.pfm.model.Expense;
import com.first.pfm.model.RecurringExpense;
import com.first.pfm.repository.CategoryRepository;
import com.first.pfm.repository.ExpenseRepository;
import com.first.pfm.repository.RecurringExpenseRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
public class RecurringExpenseService {

    private final RecurringExpenseRepository recurringRepo;
    private final ExpenseRepository expenseRepository;
    private final CategoryRepository categoryRepository;
    private final SecurityUtils securityUtils;

    public RecurringExpenseService(RecurringExpenseRepository recurringRepo,
                                   ExpenseRepository expenseRepository,
                                   CategoryRepository categoryRepository,
                                   SecurityUtils securityUtils) {
        this.recurringRepo = recurringRepo;
        this.expenseRepository = expenseRepository;
        this.categoryRepository = categoryRepository;
        this.securityUtils = securityUtils;
    }

    public List<RecurringExpenseDto> getAll() {
        Long userId = securityUtils.getCurrentUser().getId();
        return recurringRepo.findByUserId(userId).stream().map(this::toDto).toList();
    }

    public RecurringExpenseDto create(RecurringExpenseDto dto) {
        Long userId = securityUtils.getCurrentUser().getId();
        RecurringExpense re = new RecurringExpense();
        re.setUserId(userId);
        re.setCategoryId(dto.getCategoryId());
        re.setAmount(dto.getAmount());
        re.setDescription(dto.getDescription());
        re.setDayOfMonth(dto.getDayOfMonth() < 1 ? 1 : Math.min(dto.getDayOfMonth(), 28));
        re.setStartDate(dto.getStartDate() != null ? dto.getStartDate() : LocalDate.now());
        re.setActive(true);
        return toDto(recurringRepo.save(re));
    }

    public RecurringExpenseDto toggleActive(Long id) {
        Long userId = securityUtils.getCurrentUser().getId();
        RecurringExpense re = recurringRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Recurring expense not found"));
        if (!userId.equals(re.getUserId())) throw new IllegalArgumentException("Access denied");
        re.setActive(!re.isActive());
        return toDto(recurringRepo.save(re));
    }

    public void delete(Long id) {
        Long userId = securityUtils.getCurrentUser().getId();
        RecurringExpense re = recurringRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Recurring expense not found"));
        if (!userId.equals(re.getUserId())) throw new IllegalArgumentException("Access denied");
        recurringRepo.delete(re);
    }

    /**
     * Runs daily at midnight. For each active recurring expense,
     * checks if an expense was already created this month; if not, creates it.
     */
    @Scheduled(cron = "0 0 0 * * *")
    public void processRecurring() {
        LocalDate today = LocalDate.now();
        YearMonth currentMonth = YearMonth.now();
        LocalDate monthStart = currentMonth.atDay(1);
        LocalDate monthEnd = currentMonth.atEndOfMonth();

        for (RecurringExpense re : recurringRepo.findByActiveTrue()) {
            if (re.getStartDate() != null && re.getStartDate().isAfter(today)) continue;

            int day = Math.min(re.getDayOfMonth(), currentMonth.lengthOfMonth());
            LocalDate targetDate = currentMonth.atDay(day);
            if (today.isBefore(targetDate)) continue; // not yet due this month

            // Check if already logged this month (note contains the recurring marker)
            boolean alreadyLogged = expenseRepository
                    .findByUserIdAndDateBetweenOrderByDateDesc(re.getUserId(), monthStart, monthEnd)
                    .stream()
                    .anyMatch(e -> e.getCategoryId().equals(re.getCategoryId())
                            && e.getAmount().compareTo(re.getAmount()) == 0
                            && ("[recurring]").equals(e.getNote() != null ? e.getNote().substring(0, Math.min(e.getNote().length(), 11)) : ""));

            if (!alreadyLogged) {
                Expense expense = new Expense();
                expense.setUserId(re.getUserId());
                expense.setCategoryId(re.getCategoryId());
                expense.setAmount(re.getAmount());
                expense.setDate(targetDate);
                expense.setNote("[recurring] " + (re.getDescription() != null ? re.getDescription() : ""));
                expenseRepository.save(expense);
            }
        }
    }

    private RecurringExpenseDto toDto(RecurringExpense re) {
        RecurringExpenseDto dto = new RecurringExpenseDto();
        dto.setId(re.getId());
        dto.setCategoryId(re.getCategoryId());
        dto.setAmount(re.getAmount());
        dto.setDescription(re.getDescription());
        dto.setDayOfMonth(re.getDayOfMonth());
        dto.setStartDate(re.getStartDate());
        dto.setActive(re.isActive());
        categoryRepository.findById(re.getCategoryId()).ifPresent(cat -> {
            dto.setCategoryName(cat.getName());
            dto.setCategoryColor(cat.getColor());
        });
        return dto;
    }
}
