package com.first.pfm.controller;

import com.first.pfm.config.SecurityUtils;
import com.first.pfm.model.Alert;
import com.first.pfm.service.AlertService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    private final AlertService alertService;
    private final SecurityUtils securityUtils;

    public AlertController(AlertService alertService, SecurityUtils securityUtils) {
        this.alertService = alertService;
        this.securityUtils = securityUtils;
    }

    @GetMapping
    public List<Alert> getAll() {
        return alertService.getAll(securityUtils.getCurrentUser().getId());
    }

    @GetMapping("/unread")
    public List<Alert> getUnread() {
        return alertService.getUnread(securityUtils.getCurrentUser().getId());
    }

    @GetMapping("/unread/count")
    public int getUnreadCount() {
        return alertService.getUnread(securityUtils.getCurrentUser().getId()).size();
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markRead(@PathVariable Long id) {
        alertService.markRead(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllRead() {
        alertService.markAllRead(securityUtils.getCurrentUser().getId());
        return ResponseEntity.ok().build();
    }
}
