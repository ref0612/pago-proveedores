package com.pullman.repository;

import com.pullman.domain.Route;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RouteRepository extends JpaRepository<Route, Long> {
    List<Route> findByZonaId(Long zonaId);
} 