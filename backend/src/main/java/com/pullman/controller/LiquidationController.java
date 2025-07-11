package com.pullman.controller;

import com.pullman.domain.Liquidation;
import com.pullman.service.LiquidationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import com.pullman.domain.Production;
import com.pullman.domain.Entrepreneur;
import java.util.stream.Collectors;

// DTO para exponer solo los datos necesarios
class LiquidationDto {
    public Long id;
    public String decena;
    public Double monto;
    public String estado;
    public String empresario;
    public boolean validado;
    public String comentarios;
    public String fechaAprobacion;
    public String fechaPago;

    public LiquidationDto(Liquidation l) {
        this.id = l.getId();
        this.monto = l.getMonto();
        this.estado = l.getEstado();
        this.fechaAprobacion = l.getFechaAprobacion() != null ? l.getFechaAprobacion().toString() : null;
        this.fechaPago = l.getFechaPago() != null ? l.getFechaPago().toString() : null;
        Production p = l.getProduction();
        if (p != null) {
            this.decena = p.getDecena();
            this.validado = p.isValidado();
            this.comentarios = p.getComentarios();
            Entrepreneur e = p.getEntrepreneur();
            this.empresario = e != null ? e.getNombre() : null;
        }
    }
}

@RestController
@RequestMapping("/api/liquidations")
public class LiquidationController {
    @Autowired
    private LiquidationService liquidationService;

    @GetMapping
    public List<LiquidationDto> getAll() {
        return liquidationService.findAll().stream()
            .map(LiquidationDto::new)
            .collect(Collectors.toList());
    }

    @GetMapping("/paged")
    public Page<LiquidationDto> getAllPaged(@PageableDefault(size = 20) Pageable pageable) {
        return liquidationService.findAll(pageable).map(LiquidationDto::new);
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

    // Nuevo endpoint: registrar pago (setea fechaPago)
    @PostMapping("/{id}/registrar-pago")
    public ResponseEntity<Liquidation> registrarPago(@PathVariable Long id) {
        Optional<Liquidation> opt = liquidationService.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        Liquidation liq = opt.get();
        liq.setFechaPago(LocalDate.now());
        return ResponseEntity.ok(liquidationService.save(liq));
    }

    // Nuevo endpoint: aprobar liquidación (setea fechaAprobacion)
    @PostMapping("/{id}/aprobar")
    public ResponseEntity<Liquidation> aprobarLiquidacion(@PathVariable Long id) {
        Optional<Liquidation> opt = liquidationService.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        Liquidation liq = opt.get();
        liq.setFechaAprobacion(LocalDate.now());
        return ResponseEntity.ok(liquidationService.save(liq));
    }

    // Endpoint para subir comprobante de pago
    @PostMapping("/{id}/comprobante")
    public ResponseEntity<?> uploadComprobantePago(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        Optional<Liquidation> opt = liquidationService.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        try {
            Liquidation liq = opt.get();
            liq.setComprobantePago(file.getBytes());
            liquidationService.save(liq);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al guardar comprobante: " + e.getMessage());
        }
    }

    // Endpoint para descargar/ver comprobante de pago
    @GetMapping("/{id}/comprobante")
    public ResponseEntity<byte[]> downloadComprobantePago(@PathVariable Long id) {
        Optional<Liquidation> opt = liquidationService.findById(id);
        if (opt.isEmpty() || opt.get().getComprobantePago() == null) {
            return ResponseEntity.notFound().build();
        }
        Liquidation liq = opt.get();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=comprobante_" + id)
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(liq.getComprobantePago());
    }
} 