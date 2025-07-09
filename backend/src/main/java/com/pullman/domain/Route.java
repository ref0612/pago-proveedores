package com.pullman.domain;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "routes")
public class Route {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate fecha;
    private String origen;
    private String destino;
    private String horario;
    private String tipologia;
    private Double kilometraje;
    private boolean editable;

    @ManyToOne
    @JoinColumn(name = "zona_id")
    private Zone zona;

    @ManyToOne
    @JoinColumn(name = "entrepreneur_id")
    private Entrepreneur entrepreneur;

    @ManyToOne
    @JoinColumn(name = "creado_por")
    private User creadoPor;

    // Getters y setters
    public void setId(Long id) {
        this.id = id;
    }
} 