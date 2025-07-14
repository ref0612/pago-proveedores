package com.pullman.repository;

import com.pullman.domain.Notificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {
    List<Notificacion> findByRolDestinoOrderByFechaDesc(String rolDestino);
} 