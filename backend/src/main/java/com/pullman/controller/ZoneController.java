package com.pullman.controller;

import com.pullman.domain.Zone;
import com.pullman.service.ZoneService;
import com.pullman.repository.TripRepository;
import com.pullman.repository.RouteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.HashSet;
import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;
import java.text.Normalizer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/zones")
public class ZoneController {
    private static final Logger logger = LoggerFactory.getLogger(ZoneController.class);
    @Autowired
    private ZoneService zoneService;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private RouteRepository routeRepository;

    private String normalize(String input) {
        if (input == null) return "";
        String normalized = Normalizer.normalize(input.trim().toLowerCase(), Normalizer.Form.NFD)
            .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        return normalized.replaceAll("\\s+", " ");
    }

    @GetMapping
    public List<Zone> getAll() {
        return zoneService.findAll();
    }

    @GetMapping("/unconfigured-tramos")
    public List<Map<String, String>> getUnconfiguredTramos() {
        // Obtener todos los tramos (origen-destino) presentes en viajes
        Set<String> tramosInTripsNorm = new HashSet<>();
        List<Map<String, String>> tramosInTripsOriginal = new ArrayList<>();
        tripRepository.findAll().forEach(trip -> {
            if (trip.getOrigin() != null && !trip.getOrigin().isEmpty() && 
                trip.getDestination() != null && !trip.getDestination().isEmpty()) {
                String key = normalize(trip.getOrigin()) + "->" + normalize(trip.getDestination());
                tramosInTripsNorm.add(key);
                Map<String, String> tramo = new HashMap<>();
                tramo.put("origen", trip.getOrigin().trim());
                tramo.put("destino", trip.getDestination().trim());
                tramosInTripsOriginal.add(tramo);
            }
        });
        
        // Obtener tramos ya configurados en zonas
        Set<String> tramosConfiguradosNorm = new HashSet<>();
        routeRepository.findAll().forEach(route -> {
            if (route.getOrigen() != null && route.getDestino() != null) {
                String key = normalize(route.getOrigen()) + "->" + normalize(route.getDestino());
                tramosConfiguradosNorm.add(key);
            }
        });
        
        // Filtrar tramos no configurados
        List<Map<String, String>> tramosNoConfigurados = new ArrayList<>();
        for (Map<String, String> tramo : tramosInTripsOriginal) {
            String key = normalize(tramo.get("origen")) + "->" + normalize(tramo.get("destino"));
            boolean configurado = tramosConfiguradosNorm.contains(key);
            logger.info("Comparando tramo: {} -> {} | Normalizado: {} | Configurado: {}", tramo.get("origen"), tramo.get("destino"), key, configurado);
            if (!configurado) {
                tramosNoConfigurados.add(tramo);
            }
        }
        logger.info("Tramos configurados (normalizados): {}", tramosConfiguradosNorm);
        logger.info("Tramos no configurados: {}", tramosNoConfigurados);
        return tramosNoConfigurados;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Zone> getById(@PathVariable Long id) {
        return zoneService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Zone create(@RequestBody Zone zone) {
        return zoneService.save(zone);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Zone> update(@PathVariable Long id, @RequestBody Zone zone) {
        return zoneService.findById(id)
                .map(existing -> {
                    zone.setId(id);
                    return ResponseEntity.ok(zoneService.save(zone));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (zoneService.findById(id).isPresent()) {
            zoneService.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
} 