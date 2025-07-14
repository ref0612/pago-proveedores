package com.pullman.service;

import com.pullman.domain.Notificacion;
import com.pullman.repository.NotificacionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class NotificacionService {

    @Autowired
    private NotificacionRepository notificacionRepository;

    public Notificacion guardar(Notificacion notificacion) {
        if (notificacion.getFecha() == null) {
            notificacion.setFecha(LocalDateTime.now());
        }
        notificacion.setLeida(false);
        return notificacionRepository.save(notificacion);
    }

    public List<Notificacion> buscarPorRol(String rolDestino) {
        return notificacionRepository.findByRolDestinoOrderByFechaDesc(rolDestino);
    }

    public Optional<Notificacion> marcarComoLeida(Long id) {
        Optional<Notificacion> notificacionOpt = notificacionRepository.findById(id);
        notificacionOpt.ifPresent(n -> {
            n.setLeida(true);
            notificacionRepository.save(n);
        });
        return notificacionOpt;
    }

    public Optional<Notificacion> marcarComoNoLeida(Long id) {
        Optional<Notificacion> notificacionOpt = notificacionRepository.findById(id);
        notificacionOpt.ifPresent(n -> {
            n.setLeida(false);
            notificacionRepository.save(n);
        });
        return notificacionOpt;
    }
} 