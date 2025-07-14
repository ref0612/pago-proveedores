package com.pullman.controller;

import com.pullman.domain.Notificacion;
import com.pullman.service.NotificacionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/notificaciones")
public class NotificacionController {

    @Autowired
    private NotificacionService notificacionService;

    @GetMapping("/{rolDestino}")
    public List<Notificacion> listarPorRol(@PathVariable String rolDestino) {
        return notificacionService.buscarPorRol(rolDestino);
    }

    @PostMapping
    public Notificacion crear(@RequestBody Notificacion notificacion) {
        return notificacionService.guardar(notificacion);
    }

    @PutMapping("/{id}/leida")
    public ResponseEntity<Notificacion> marcarComoLeida(@PathVariable Long id) {
        Optional<Notificacion> notificacionOpt = notificacionService.marcarComoLeida(id);
        return notificacionOpt.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/no-leida")
    public ResponseEntity<Notificacion> marcarComoNoLeida(@PathVariable Long id) {
        Optional<Notificacion> notificacionOpt = notificacionService.marcarComoNoLeida(id);
        return notificacionOpt.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
} 