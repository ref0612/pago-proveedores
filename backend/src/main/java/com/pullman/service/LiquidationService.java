package com.pullman.service;

import com.pullman.domain.Liquidation;
import com.pullman.domain.Production;
import com.pullman.repository.LiquidationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class LiquidationService {
    @Autowired
    private LiquidationRepository liquidationRepository;

    public Page<Liquidation> findAll(Pageable pageable) {
        return liquidationRepository.findAll(pageable);
    }

    public Optional<Liquidation> findById(Long id) {
        return liquidationRepository.findById(id);
    }

    public Liquidation save(Liquidation liquidation) {
        return liquidationRepository.save(liquidation);
    }

    public void deleteById(Long id) {
        liquidationRepository.deleteById(id);
    }

    // Método optimizado para buscar liquidaciones por producción
    public Optional<Liquidation> findByProductionId(Long productionId) {
        return liquidationRepository.findByProductionId(productionId);
    }

    // Método optimizado para buscar liquidaciones por empresario
    public List<Liquidation> findByEntrepreneurId(Long entrepreneurId) {
        return liquidationRepository.findByEntrepreneurId(entrepreneurId);
    }

    // Método optimizado para buscar liquidaciones por fecha de aprobación
    public List<Liquidation> findByFechaAprobacionBetween(LocalDate startDate, LocalDate endDate) {
        return liquidationRepository.findByFechaAprobacionBetween(startDate, endDate);
    }

    // Método optimizado para buscar liquidaciones pendientes de pago
    public List<Liquidation> findPendientesDePago() {
        return liquidationRepository.findPendientesDePago();
    }

    // Método optimizado para obtener estadísticas de liquidaciones
    public List<Object[]> getLiquidationStatsByEntrepreneur() {
        return liquidationRepository.getLiquidationStatsByEntrepreneur();
    }

    // Método optimizado para verificar si existe una liquidación
    public boolean existsByProductionId(Long productionId) {
        return liquidationRepository.existsByProductionId(productionId);
    }

    // Método optimizado para buscar liquidaciones por monto
    public List<Liquidation> findByMontoBetween(Double minAmount, Double maxAmount) {
        return liquidationRepository.findByMontoBetween(minAmount, maxAmount);
    }

    // Método optimizado para obtener liquidaciones con comprobantes de pago
    public List<Liquidation> findWithPaymentProof() {
        return liquidationRepository.findWithPaymentProof();
    }

    // Método optimizado para crear liquidación si no existe
    public Liquidation createIfNotExistsForProduction(Production production) {
        // Verificar si ya existe una liquidación para esta producción
        if (!liquidationRepository.existsByProductionId(production.getId())) {
            Liquidation liquidation = new Liquidation();
            liquidation.setProduction(production);
            liquidation.setMonto(production.getTotal());
            liquidation.setEstado("PENDIENTE");
            liquidation.setFechaAprobacion(LocalDate.now());
            liquidation.setFecha(LocalDate.now());
            return liquidationRepository.save(liquidation);
        }
        
        // Si ya existe, actualizar la fecha de aprobación
        Optional<Liquidation> existingLiquidation = liquidationRepository.findByProductionId(production.getId());
        if (existingLiquidation.isPresent()) {
            Liquidation liquidation = existingLiquidation.get();
            liquidation.setFechaAprobacion(LocalDate.now());
            return liquidationRepository.save(liquidation);
        }
        
        return null;
    }

    // Método optimizado para obtener todas las liquidaciones (mantener compatibilidad)
    public List<Liquidation> findAll() {
        return liquidationRepository.findAll();
    }
} 