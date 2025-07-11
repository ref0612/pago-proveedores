package com.pullman.controller;

import com.pullman.domain.Entrepreneur;
import com.pullman.service.EntrepreneurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;

import java.util.List;

@RestController
@RequestMapping("/api/entrepreneurs")
public class EntrepreneurController {
    @Autowired
    private EntrepreneurService entrepreneurService;

    @GetMapping
    public org.springframework.data.domain.Page<Entrepreneur> getAllEntrepreneurs(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        return entrepreneurService.findAll(pageable);
    }

    @GetMapping("/paged")
    public Page<Entrepreneur> getAllPaged(@PageableDefault(size = 20) Pageable pageable) {
        return entrepreneurService.findAll(pageable);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Entrepreneur> getById(@PathVariable Long id) {
        return entrepreneurService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Entrepreneur create(@RequestBody Entrepreneur entrepreneur) {
        return entrepreneurService.save(entrepreneur);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Entrepreneur> update(@PathVariable Long id, @RequestBody Entrepreneur entrepreneur) {
        return entrepreneurService.findById(id)
                .map(existing -> {
                    entrepreneur.setId(id);
                    return ResponseEntity.ok(entrepreneurService.save(entrepreneur));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (entrepreneurService.findById(id).isPresent()) {
            entrepreneurService.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
} 