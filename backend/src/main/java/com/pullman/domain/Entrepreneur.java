package com.pullman.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "entrepreneurs")
public class Entrepreneur {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;

    private String rut;

    @ManyToOne
    @JoinColumn(name = "zona_id")
    private Zone zona;

    // Getters y setters
    public void setId(Long id) {
        this.id = id;
    }
} 