package com.pullman.controller;

import com.pullman.domain.AuditLog;
import com.pullman.service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
public class AuditLogController {
    @Autowired
    private AuditLogService auditLogService;

    @GetMapping
    public List<AuditLog> getAll() {
        return auditLogService.findAll();
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