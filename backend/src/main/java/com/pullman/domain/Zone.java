package com.pullman.domain;

import jakarta.persistence.*;
import java.util.Set;

@Entity
@Table(name = "zones")
public class Zone {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;

    private double porcentaje;

    // Relaciones (ejemplo)
    // @OneToMany(mappedBy = "zona")
    // private Set<Entrepreneur> empresarios;

    // Getters y setters
    public void setId(Long id) {
        this.id = id;
    }
} 