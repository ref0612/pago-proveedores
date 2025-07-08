package com.pullman.repository;

import com.pullman.domain.Production;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductionRepository extends JpaRepository<Production, Long> {
} 