package com.pullman.repository;

import com.pullman.domain.Production;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductionRepository extends JpaRepository<Production, Long> {
    
    // Consulta optimizada para buscar producciones por decena
    @Query("SELECT p FROM Production p WHERE p.decena = :decena")
    List<Production> findByDecena(@Param("decena") String decena);
    
    // Consulta optimizada para buscar producciones pendientes
    @Query("SELECT p FROM Production p WHERE p.validado = false")
    List<Production> findPendientes();
    
    // Consulta optimizada para buscar producciones por empresario y decena
    @Query("SELECT p FROM Production p WHERE p.entrepreneur.id = :entrepreneurId AND p.decena = :decena")
    Optional<Production> findByEntrepreneurAndDecena(@Param("entrepreneurId") Long entrepreneurId, @Param("decena") String decena);
    
    // Consulta optimizada para buscar producciones por estado de validación
    @Query("SELECT p FROM Production p WHERE p.validado = :validado")
    List<Production> findByValidado(@Param("validado") boolean validado);
    
    // Consulta optimizada para buscar producciones por rango de fechas de validación
    @Query("SELECT p FROM Production p WHERE p.fechaValidacion BETWEEN :startDate AND :endDate")
    List<Production> findByFechaValidacionBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    // Consulta optimizada para obtener estadísticas de producciones por decena
    @Query("SELECT p.decena, COUNT(p), SUM(p.total) FROM Production p GROUP BY p.decena")
    List<Object[]> getProductionStatsByDecena();
    
    // Consulta optimizada para buscar producciones por empresario
    @Query("SELECT p FROM Production p WHERE p.entrepreneur.id = :entrepreneurId")
    List<Production> findByEntrepreneurId(@Param("entrepreneurId") Long entrepreneurId);
    
    // Consulta optimizada para verificar si existe una producción
    @Query("SELECT COUNT(p) > 0 FROM Production p WHERE p.entrepreneur.id = :entrepreneurId AND p.decena = :decena")
    boolean existsByEntrepreneurAndDecena(@Param("entrepreneurId") Long entrepreneurId, @Param("decena") String decena);
} 