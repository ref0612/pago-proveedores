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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;

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
    public org.springframework.data.domain.Page<Zone> getAllZones(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        return zoneService.findAll(pageable);
    }

    @GetMapping("/paged")
    public Page<Zone> getAllPaged(@PageableDefault(size = 20) Pageable pageable) {
        return zoneService.findAll(pageable);
    }

    @GetMapping("/unconfigured-tramos")
    public Map<String, List<Map<String, String>>> getUnconfiguredTramos() {
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
        
        // Obtener tramos ya configurados en zonas y rutas con zona nula
        Set<String> tramosConfiguradosNorm = new HashSet<>();
        List<Map<String, String>> rutasSinZona = new ArrayList<>();
        routeRepository.findAll().forEach(route -> {
            if (route.getOrigen() != null && route.getDestino() != null) {
                String key = normalize(route.getOrigen()) + "->" + normalize(route.getDestino());
                tramosConfiguradosNorm.add(key);
                if (route.getZona() == null) {
                    Map<String, String> tramo = new HashMap<>();
                    tramo.put("origen", route.getOrigen().trim());
                    tramo.put("destino", route.getDestino().trim());
                    rutasSinZona.add(tramo);
                }
            }
        });
        
        // Filtrar tramos no configurados (no existen como ruta)
        List<Map<String, String>> tramosNoConfigurados = new ArrayList<>();
        for (Map<String, String> tramo : tramosInTripsOriginal) {
            String key = normalize(tramo.get("origen")) + "->" + normalize(tramo.get("destino"));
            boolean configurado = tramosConfiguradosNorm.contains(key);
            if (!configurado) {
                tramosNoConfigurados.add(tramo);
            }
        }
        Map<String, List<Map<String, String>>> resultado = new HashMap<>();
        resultado.put("tramosNoConfigurados", tramosNoConfigurados);
        resultado.put("rutasSinZona", rutasSinZona);
        return resultado;
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