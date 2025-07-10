package com.pullman.domain;

import jakarta.persistence.*;
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
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public boolean isValidado() {
        return validado;
    }

    public void setValidado(boolean validado) {
        this.validado = validado;
    }

    public String getDecena() {
        return decena;
    }

    public void setDecena(String decena) {
        this.decena = decena;
    }

    public Double getTotal() {
        return total;
    }

    public void setTotal(Double total) {
        this.total = total;
    }

    public String getComentarios() {
        return comentarios;
    }

    public void setComentarios(String comentarios) {
        this.comentarios = comentarios;
    }

    public LocalDate getFechaValidacion() {
        return fechaValidacion;
    }

    public void setFechaValidacion(LocalDate fechaValidacion) {
        this.fechaValidacion = fechaValidacion;
    }

    public Entrepreneur getEntrepreneur() {
        return entrepreneur;
    }

    public void setEntrepreneur(Entrepreneur entrepreneur) {
        this.entrepreneur = entrepreneur;
    }

    public User getValidadoPor() {
        return validadoPor;
    }

    public void setValidadoPor(User validadoPor) {
        this.validadoPor = validadoPor;
    }
} 