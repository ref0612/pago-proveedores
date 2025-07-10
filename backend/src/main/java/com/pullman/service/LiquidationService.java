package com.pullman.service;

import com.pullman.domain.Liquidation;
import com.pullman.repository.LiquidationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
} 