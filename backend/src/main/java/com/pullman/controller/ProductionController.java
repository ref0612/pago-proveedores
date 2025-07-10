package com.pullman.controller;

import com.pullman.domain.Production;
import com.pullman.service.ProductionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productions")
public class ProductionController {
    @Autowired
    private ProductionService productionService;

    @GetMapping
    public List<Production> getAll() {
        return productionService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Production> getById(@PathVariable Long id) {
        return productionService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Production create(@RequestBody Production production) {
        return productionService.save(production);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Production> update(@PathVariable Long id, @RequestBody Production production) {
        return productionService.findById(id)
                .map(existing -> {
                    production.setId(id);
                    return ResponseEntity.ok(productionService.save(production));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (productionService.findById(id).isPresent()) {
            productionService.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
} 