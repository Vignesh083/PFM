package com.first.pfm.service;

import com.first.pfm.config.SecurityUtils;
import com.first.pfm.dto.RecurringExpenseDto;
import com.first.pfm.exception.ResourceNotFoundException;
import com.first.pfm.model.Category;
import com.first.pfm.model.Expense;
import com.first.pfm.model.RecurringExpense;
import com.first.pfm.repository.CategoryRepository;
import com.first.pfm.repository.ExpenseRepository;
import com.first.pfm.repository.RecurringExpenseRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class RecurringExpenseService {

    private static final Logger log = LoggerFactory.getLogger(RecurringExpenseService.class);

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
        List<RecurringExpense> items = recurringRepo.findByUserId(userId);
        return toDtos(items);
    }

    @Transactional
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
        RecurringExpense saved = recurringRepo.save(re);
        Map<Long, Category> catMap = categoryRepository.findAllById(List.of(saved.getCategoryId())).stream()
                .collect(Collectors.toMap(Category::getId, c -> c));
        return toDto(saved, catMap);
    }

    @Transactional
    public RecurringExpenseDto toggleActive(Long id) {
        Long userId = securityUtils.getCurrentUser().getId();
        RecurringExpense re = recurringRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Recurring expense not found"));
        if (!userId.equals(re.getUserId())) throw new IllegalArgumentException("Access denied");
        re.setActive(!re.isActive());
        RecurringExpense saved = recurringRepo.save(re);
        Map<Long, Category> catMap = categoryRepository.findAllById(List.of(saved.getCategoryId())).stream()
                .collect(Collectors.toMap(Category::getId, c -> c));
        return toDto(saved, catMap);
    }

    @Transactional
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
    @Transactional
    public void processRecurring() {
        try {
            LocalDate today = LocalDate.now();
            YearMonth currentMonth = YearMonth.now();
            LocalDate monthStart = currentMonth.atDay(1);
            LocalDate monthEnd = currentMonth.atEndOfMonth();

            List<RecurringExpense> active = recurringRepo.findByActiveTrue();
            if (active.isEmpty()) return;

            // Group by userId to load expenses per user once (avoid N+1)
            Map<Long, List<RecurringExpense>> byUser = active.stream()
                    .collect(Collectors.groupingBy(RecurringExpense::getUserId));

            for (Map.Entry<Long, List<RecurringExpense>> entry : byUser.entrySet()) {
                Long userId = entry.getKey();
                List<RecurringExpense> userRecurring = entry.getValue();

                // Load all this user's expenses for the month once
                List<Expense> monthExpenses = expenseRepository
                        .findByUserIdAndDateBetweenOrderByDateDesc(userId, monthStart, monthEnd);

                for (RecurringExpense re : userRecurring) {
                    if (re.getStartDate() != null && re.getStartDate().isAfter(today)) continue;

                    int day = Math.min(re.getDayOfMonth(), currentMonth.lengthOfMonth());
                    LocalDate targetDate = currentMonth.atDay(day);
                    if (today.isBefore(targetDate)) continue;

                    // Check if already logged this month using the [recurring] marker
                    boolean alreadyLogged = monthExpenses.stream()
                            .anyMatch(e -> re.getCategoryId().equals(e.getCategoryId())
                                    && re.getAmount().compareTo(e.getAmount()) == 0
                                    && e.getNote() != null
                                    && e.getNote().startsWith("[recurring]"));

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
        } catch (Exception e) {
            log.error("Error in processRecurring scheduler", e);
        }
    }

    private List<RecurringExpenseDto> toDtos(List<RecurringExpense> items) {
        if (items.isEmpty()) return List.of();
        Set<Long> catIds = items.stream().map(RecurringExpense::getCategoryId).collect(Collectors.toSet());
        Map<Long, Category> catMap = categoryRepository.findAllById(catIds).stream()
                .collect(Collectors.toMap(Category::getId, c -> c));
        return items.stream().map(re -> toDto(re, catMap)).toList();
    }

    private RecurringExpenseDto toDto(RecurringExpense re, Map<Long, Category> catMap) {
        RecurringExpenseDto dto = new RecurringExpenseDto();
        dto.setId(re.getId());
        dto.setCategoryId(re.getCategoryId());
        dto.setAmount(re.getAmount());
        dto.setDescription(re.getDescription());
        dto.setDayOfMonth(re.getDayOfMonth());
        dto.setStartDate(re.getStartDate());
        dto.setActive(re.isActive());
        Category cat = catMap.get(re.getCategoryId());
        if (cat != null) {
            dto.setCategoryName(cat.getName());
            dto.setCategoryColor(cat.getColor());
        }
        return dto;
    }
}
