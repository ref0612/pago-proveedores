package com.pullman.domain;

import javax.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "liquidations")
public class Liquidation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double monto;
    private LocalDate fecha;
    private String estado;

    @ManyToOne
    @JoinColumn(name = "production_id")
    private Production production;

    @ManyToOne
    @JoinColumn(name = "generado_por")
    private User generadoPor;

    // Getters y setters
    // ...
} 