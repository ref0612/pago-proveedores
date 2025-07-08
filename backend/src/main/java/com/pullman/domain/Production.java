package com.pullman.domain;

import javax.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "productions")
public class Production {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String decena; // periodo
    private Double total;
    private boolean validado;
    private String comentarios;
    private LocalDate fechaValidacion;

    @ManyToOne
    @JoinColumn(name = "entrepreneur_id")
    private Entrepreneur entrepreneur;

    @ManyToOne
    @JoinColumn(name = "validado_por")
    private User validadoPor;

    // Getters y setters
    // ...
} 