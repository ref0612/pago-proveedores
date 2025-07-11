package com.pullman.service;

import com.pullman.domain.Liquidation;
import com.pullman.domain.Production;
import com.pullman.repository.LiquidationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class LiquidationService {
    @Autowired
    private LiquidationRepository liquidationRepository;

    public List<Liquidation> findAll() {
        return liquidationRepository.findAll();
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

    public Liquidation createIfNotExistsForProduction(Production production) {
        Optional<Liquidation> existingOpt = liquidationRepository.findByProduction(production);
        if (existingOpt.isPresent()) {
            Liquidation liq = existingOpt.get();
            // Si la producción está validada y la liquidación no tiene fechaAprobacion, setearla
            if (production.isValidado() && liq.getFechaAprobacion() == null) {
                liq.setFechaAprobacion(production.getFechaValidacion() != null ? production.getFechaValidacion() : LocalDate.now());
                return liquidationRepository.save(liq);
            }
            return liq;
        } else {
            Liquidation liq = new Liquidation();
            liq.setProduction(production);
            liq.setMonto(production.getTotal());
            liq.setFecha(LocalDate.now());
            liq.setEstado("PENDIENTE");
            if (production.isValidado()) {
                liq.setFechaAprobacion(production.getFechaValidacion() != null ? production.getFechaValidacion() : LocalDate.now());
            }
            return liquidationRepository.save(liq);
        }
    }
} 