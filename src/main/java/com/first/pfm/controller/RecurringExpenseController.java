package com.first.pfm.controller;

import com.first.pfm.dto.RecurringExpenseDto;
import com.first.pfm.service.RecurringExpenseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recurring")
public class RecurringExpenseController {

    private final RecurringExpenseService service;

    public RecurringExpenseController(RecurringExpenseService service) {
        this.service = service;
    }

    @GetMapping
    public List<RecurringExpenseDto> getAll() { return service.getAll(); }

    @PostMapping
    public RecurringExpenseDto create(@RequestBody RecurringExpenseDto dto) {
        return service.create(dto);
    }

    @PutMapping("/{id}/toggle")
    public RecurringExpenseDto toggle(@PathVariable Long id) {
        return service.toggleActive(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
