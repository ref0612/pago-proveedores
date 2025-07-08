package com.pullman.domain;

import javax.persistence.*;
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
    // ...
} 