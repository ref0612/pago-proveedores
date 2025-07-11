package com.pullman.repository;

import com.pullman.domain.Liquidation;
import com.pullman.domain.Production;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface LiquidationRepository extends JpaRepository<Liquidation, Long> {
    
    // Consulta optimizada para buscar liquidaciones por producción
    @Query("SELECT l FROM Liquidation l WHERE l.production.id = :productionId")
    Optional<Liquidation> findByProductionId(@Param("productionId") Long productionId);
    
    // Consulta optimizada para buscar liquidaciones por empresario
    @Query("SELECT l FROM Liquidation l WHERE l.production.entrepreneur.id = :entrepreneurId")
    List<Liquidation> findByEntrepreneurId(@Param("entrepreneurId") Long entrepreneurId);
    
    // Consulta optimizada para buscar liquidaciones por fecha de aprobación
    @Query("SELECT l FROM Liquidation l WHERE l.fechaAprobacion BETWEEN :startDate AND :endDate")
    List<Liquidation> findByFechaAprobacionBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    // Consulta optimizada para buscar liquidaciones pendientes de pago
    @Query("SELECT l FROM Liquidation l WHERE l.estado = 'Pendiente'")
    List<Liquidation> findPendientesDePago();
    
    // Consulta optimizada para obtener estadísticas de liquidaciones por empresario
    @Query("SELECT l.production.entrepreneur.nombre, COUNT(l), SUM(l.monto) FROM Liquidation l GROUP BY l.production.entrepreneur.id, l.production.entrepreneur.nombre")
    List<Object[]> getLiquidationStatsByEntrepreneur();
    
    // Consulta optimizada para verificar si existe una liquidación para una producción
    @Query("SELECT COUNT(l) > 0 FROM Liquidation l WHERE l.production.id = :productionId")
    boolean existsByProductionId(@Param("productionId") Long productionId);
    
    // Consulta optimizada para buscar liquidaciones por monto
    @Query("SELECT l FROM Liquidation l WHERE l.monto BETWEEN :minAmount AND :maxAmount")
    List<Liquidation> findByMontoBetween(@Param("minAmount") Double minAmount, @Param("maxAmount") Double maxAmount);
    
    // Consulta optimizada para obtener liquidaciones con comprobantes de pago
    @Query("SELECT l FROM Liquidation l WHERE l.comprobantePago IS NOT NULL")
    List<Liquidation> findWithPaymentProof();
} 