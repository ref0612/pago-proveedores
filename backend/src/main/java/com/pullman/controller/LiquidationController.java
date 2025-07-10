package com.pullman.controller;

import com.pullman.domain.Liquidation;
import com.pullman.service.LiquidationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/liquidations")
public class LiquidationController {
    @Autowired
    private LiquidationService liquidationService;

    @GetMapping
    public List<Liquidation> getAll() {
        return liquidationService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Liquidation> getById(@PathVariable Long id) {
        return liquidationService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Liquidation create(@RequestBody Liquidation liquidation) {
        return liquidationService.save(liquidation);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Liquidation> update(@PathVariable Long id, @RequestBody Liquidation liquidation) {
        return liquidationService.findById(id)
                .map(existing -> {
                    liquidation.setId(id);
                    return ResponseEntity.ok(liquidationService.save(liquidation));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (liquidationService.findById(id).isPresent()) {
            liquidationService.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
} 