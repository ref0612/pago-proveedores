package com.pullman.repository;

import com.pullman.domain.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    
    // Consulta optimizada para buscar logs por usuario
    @Query("SELECT a FROM AuditLog a WHERE a.user.id = :userId")
    List<AuditLog> findByUserId(@Param("userId") Long userId);
    
    // Consulta optimizada para buscar logs por acción
    @Query("SELECT a FROM AuditLog a WHERE a.accion = :accion")
    List<AuditLog> findByAction(@Param("accion") String accion);
    
    // Consulta optimizada para buscar logs por fecha
    @Query("SELECT a FROM AuditLog a WHERE DATE(a.fecha) = :date")
    List<AuditLog> findByDate(@Param("date") java.time.LocalDate date);
    
    // Consulta optimizada para buscar logs por rango de fechas
    @Query("SELECT a FROM AuditLog a WHERE a.fecha BETWEEN :startDate AND :endDate")
    List<AuditLog> findByTimestampBetween(@Param("startDate") java.time.LocalDateTime startDate, @Param("endDate") java.time.LocalDateTime endDate);
    
    // Consulta optimizada para buscar logs por usuario y acción
    @Query("SELECT a FROM AuditLog a WHERE a.user.id = :userId AND a.accion = :accion")
    List<AuditLog> findByUserIdAndAction(@Param("userId") Long userId, @Param("accion") String accion);
    
    // Consulta optimizada para obtener estadísticas de auditoría por usuario
    @Query("SELECT a.user.email, COUNT(a), COUNT(DISTINCT a.accion) FROM AuditLog a GROUP BY a.user.id, a.user.email")
    List<Object[]> getAuditStatsByUser();
    
    // Consulta optimizada para obtener estadísticas de auditoría por acción
    @Query("SELECT a.accion, COUNT(a) FROM AuditLog a GROUP BY a.accion")
    List<Object[]> getAuditStatsByAction();
    
    // Consulta optimizada para obtener logs recientes
    @Query("SELECT a FROM AuditLog a ORDER BY a.fecha DESC")
    List<AuditLog> findRecentLogs();
    
    // Consulta optimizada para verificar si existe un log
    @Query("SELECT COUNT(a) > 0 FROM AuditLog a WHERE a.id = :id")
    boolean existsById(@Param("id") Long id);
} 