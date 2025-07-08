package com.pullman.repository;

import com.pullman.domain.Entrepreneur;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EntrepreneurRepository extends JpaRepository<Entrepreneur, Long> {
} 