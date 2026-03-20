package com.first.pfm.controller;

import com.first.pfm.dto.MonthlyReportDto;
import com.first.pfm.service.ReportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.YearMonth;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/monthly")
    public MonthlyReportDto monthly(@RequestParam(defaultValue = "") String month) {
        if (month.isBlank()) month = YearMonth.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
        return reportService.monthlyReport(month);
    }

    @GetMapping("/monthly/csv")
    public ResponseEntity<byte[]> monthlyCSV(@RequestParam(defaultValue = "") String month) {
        if (month.isBlank()) month = YearMonth.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
        String csv = reportService.monthlyCSV(month);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"expenses-" + month + ".csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv.getBytes());
    }
}
