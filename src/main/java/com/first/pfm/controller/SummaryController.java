package com.first.pfm.controller;

import com.first.pfm.dto.SummaryDto;
import com.first.pfm.service.SummaryService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/summary")
public class SummaryController {

    private final SummaryService summaryService;

    public SummaryController(SummaryService summaryService) {
        this.summaryService = summaryService;
    }

    @GetMapping("/daily")
    public SummaryDto daily(@RequestParam(defaultValue = "") String date) {
        LocalDate d = date.isBlank() ? LocalDate.now() : LocalDate.parse(date);
        return summaryService.daily(d);
    }

    @GetMapping("/monthly")
    public SummaryDto monthly(@RequestParam(defaultValue = "") String month) {
        if (month.isBlank()) {
            month = YearMonth.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
        }
        return summaryService.monthly(month);
    }

    @GetMapping("/yearly")
    public SummaryDto yearly(@RequestParam(defaultValue = "0") int year) {
        if (year == 0) year = LocalDate.now().getYear();
        return summaryService.yearly(year);
    }
}
