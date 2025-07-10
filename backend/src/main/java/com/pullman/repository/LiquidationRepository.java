package com.pullman.repository;

import com.pullman.domain.Liquidation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LiquidationRepository extends JpaRepository<Liquidation, Long> {
} 