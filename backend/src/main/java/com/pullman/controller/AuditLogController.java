package com.pullman.controller;

import com.pullman.domain.AuditLog;
import com.pullman.service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;

@RestController
@RequestMapping("/api/audit-logs")
public class AuditLogController {
    @Autowired
    private AuditLogService auditLogService;

    @GetMapping
    public List<AuditLog> getAll() {
        return auditLogService.findAll();
    }

    // Endpoints optimizados para búsquedas específicas
    @GetMapping("/by-user")
    public List<AuditLog> getByUserId(@RequestParam Long userId) {
        return auditLogService.findByUserId(userId);
    }

    @GetMapping("/by-action")
    public List<AuditLog> getByAction(@RequestParam String action) {
        return auditLogService.findByAction(action);
    }

    @GetMapping("/by-date")
    public List<AuditLog> getByDate(@RequestParam java.time.LocalDate date) {
        return auditLogService.findByDate(date);
    }

    @GetMapping("/by-date-range")
    public List<AuditLog> getByDateRange(@RequestParam java.time.LocalDateTime startDate, 
                                        @RequestParam java.time.LocalDateTime endDate) {
        return auditLogService.findByTimestampBetween(startDate, endDate);
    }

    @GetMapping("/by-user-action")
    public List<AuditLog> getByUserIdAndAction(@RequestParam Long userId, @RequestParam String action) {
        return auditLogService.findByUserIdAndAction(userId, action);
    }

    @GetMapping("/stats-by-user")
    public List<Object[]> getStatsByUser() {
        return auditLogService.getAuditStatsByUser();
    }

    @GetMapping("/stats-by-action")
    public List<Object[]> getStatsByAction() {
        return auditLogService.getAuditStatsByAction();
    }

    @GetMapping("/recent")
    public List<AuditLog> getRecentLogs() {
        return auditLogService.findRecentLogs();
    }

    @GetMapping("/paged")
    public Page<AuditLog> getAllPaged(@PageableDefault(size = 20) Pageable pageable) {
        return auditLogService.findAll(pageable);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuditLog> getById(@PathVariable Long id) {
        return auditLogService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public AuditLog create(@RequestBody AuditLog auditLog) {
        return auditLogService.save(auditLog);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AuditLog> update(@PathVariable Long id, @RequestBody AuditLog auditLog) {
        return auditLogService.findById(id)
                .map(existing -> {
                    auditLog.setId(id);
                    return ResponseEntity.ok(auditLogService.save(auditLog));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (auditLogService.findById(id).isPresent()) {
            auditLogService.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
} 