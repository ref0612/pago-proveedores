package com.pullman.service;

import com.pullman.domain.AuditLog;
import com.pullman.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AuditLogService {
    @Autowired
    private AuditLogRepository auditLogRepository;

    public Page<AuditLog> findAll(Pageable pageable) {
        return auditLogRepository.findAll(pageable);
    }

    public Optional<AuditLog> findById(Long id) {
        return auditLogRepository.findById(id);
    }

    public AuditLog save(AuditLog auditLog) {
        return auditLogRepository.save(auditLog);
    }

    public void deleteById(Long id) {
        auditLogRepository.deleteById(id);
    }

    // Método optimizado para buscar logs por usuario
    public List<AuditLog> findByUserId(Long userId) {
        return auditLogRepository.findByUserId(userId);
    }

    // Método optimizado para buscar logs por acción
    public List<AuditLog> findByAction(String action) {
        return auditLogRepository.findByAction(action);
    }

    // Método optimizado para buscar logs por fecha
    public List<AuditLog> findByDate(java.time.LocalDate date) {
        return auditLogRepository.findByDate(date);
    }

    // Método optimizado para buscar logs por rango de fechas
    public List<AuditLog> findByTimestampBetween(java.time.LocalDateTime startDate, java.time.LocalDateTime endDate) {
        return auditLogRepository.findByTimestampBetween(startDate, endDate);
    }

    // Método optimizado para buscar logs por usuario y acción
    public List<AuditLog> findByUserIdAndAction(Long userId, String action) {
        return auditLogRepository.findByUserIdAndAction(userId, action);
    }

    // Método optimizado para obtener estadísticas de auditoría por usuario
    public List<Object[]> getAuditStatsByUser() {
        return auditLogRepository.getAuditStatsByUser();
    }

    // Método optimizado para obtener estadísticas de auditoría por acción
    public List<Object[]> getAuditStatsByAction() {
        return auditLogRepository.getAuditStatsByAction();
    }

    // Método optimizado para obtener logs recientes
    public List<AuditLog> findRecentLogs() {
        return auditLogRepository.findRecentLogs();
    }

    // Método optimizado para verificar si existe un log
    public boolean existsById(Long id) {
        return auditLogRepository.existsById(id);
    }

    // Método optimizado para obtener todas las auditorías (mantener compatibilidad)
    public List<AuditLog> findAll() {
        return auditLogRepository.findAll();
    }
} 