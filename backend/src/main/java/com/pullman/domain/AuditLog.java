package com.pullman.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String accion;
    private String entidad;
    private Long entidadId;
    private LocalDateTime fecha;
    private String detalle;

    // Getters y setters
    public void setId(Long id) {
        this.id = id;
    }

    public Long getId() { return id; }
    public User getUser() { return user; }
    public String getAccion() { return accion; }
    public String getEntidad() { return entidad; }
    public Long getEntidadId() { return entidadId; }
    public LocalDateTime getFecha() { return fecha; }
    public String getDetalle() { return detalle; }
} 