package com.pullman.repository;

import com.pullman.domain.Notificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {
    List<Notificacion> findByRolDestinoAndEliminadaFalseOrderByFechaDesc(String rolDestino);
    
    @Modifying
    @Transactional
    @Query("UPDATE Notificacion n SET n.eliminada = true WHERE n.id = :id")
    void marcarComoEliminada(@Param("id") Long id);
}