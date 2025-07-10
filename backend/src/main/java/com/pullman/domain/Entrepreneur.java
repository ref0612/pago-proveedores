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
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getRut() {
        return rut;
    }

    public void setRut(String rut) {
        this.rut = rut;
    }

    public Zone getZona() {
        return zona;
    }

    public void setZona(Zone zona) {
        this.zona = zona;
    }
} 