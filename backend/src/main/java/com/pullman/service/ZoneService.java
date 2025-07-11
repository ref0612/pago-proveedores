package com.pullman.service;

import com.pullman.domain.Zone;
import com.pullman.repository.ZoneRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ZoneService {
    @Autowired
    private ZoneRepository zoneRepository;

    public Page<Zone> findAll(Pageable pageable) {
        return zoneRepository.findAll(pageable);
    }

    public Optional<Zone> findById(Long id) {
        return zoneRepository.findById(id);
    }

    public Zone save(Zone zone) {
        return zoneRepository.save(zone);
    }

    public void deleteById(Long id) {
        zoneRepository.deleteById(id);
    }
} 