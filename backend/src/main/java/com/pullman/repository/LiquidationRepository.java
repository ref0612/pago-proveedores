package com.pullman.repository;

import com.pullman.domain.Liquidation;
import com.pullman.domain.Production;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LiquidationRepository extends JpaRepository<Liquidation, Long> {
    Optional<Liquidation> findByProduction(Production production);
} 