package com.pullman.controller;

import com.pullman.domain.Route;
import com.pullman.service.RouteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;

@RestController
@RequestMapping("/api/routes")
public class RouteController {
    @Autowired
    private RouteService routeService;

    @GetMapping
    public org.springframework.data.domain.Page<Route> getAllRoutes(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        return routeService.findAll(pageable);
    }

    @GetMapping("/paged")
    public Page<Route> getAllPaged(@PageableDefault(size = 20) Pageable pageable) {
        return routeService.findAll(pageable);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Route> getById(@PathVariable Long id) {
        return routeService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/by-zone/{zoneId}")
    public List<Route> getByZone(@PathVariable Long zoneId) {
        return routeService.findByZonaId(zoneId);
    }

    @PostMapping
    public Route create(@RequestBody Route route) {
        return routeService.save(route);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Route> update(@PathVariable Long id, @RequestBody Route route) {
        return routeService.findById(id)
                .map(existing -> {
                    route.setId(id);
                    return ResponseEntity.ok(routeService.save(route));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (routeService.findById(id).isPresent()) {
            routeService.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
} 