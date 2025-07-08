package com.pullman.domain;

import javax.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "payments")
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double monto;
    private String medio;
    private LocalDate fecha;
    private String comprobante;

    @ManyToOne
    @JoinColumn(name = "liquidation_id")
    private Liquidation liquidation;

    @ManyToOne
    @JoinColumn(name = "registrado_por")
    private User registradoPor;

    // Getters y setters
    // ...
} 