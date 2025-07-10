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
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public LocalDate getFecha() {
        return fecha;
    }
    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }
    public String getOrigen() {
        return origen;
    }
    public void setOrigen(String origen) {
        this.origen = origen;
    }
    public String getDestino() {
        return destino;
    }
    public void setDestino(String destino) {
        this.destino = destino;
    }
    public String getHorario() {
        return horario;
    }
    public void setHorario(String horario) {
        this.horario = horario;
    }
    public String getTipologia() {
        return tipologia;
    }
    public void setTipologia(String tipologia) {
        this.tipologia = tipologia;
    }
    public Double getKilometraje() {
        return kilometraje;
    }
    public void setKilometraje(Double kilometraje) {
        this.kilometraje = kilometraje;
    }
    public boolean isEditable() {
        return editable;
    }
    public void setEditable(boolean editable) {
        this.editable = editable;
    }
    public Zone getZona() {
        return zona;
    }
    public void setZona(Zone zona) {
        this.zona = zona;
    }
    public Entrepreneur getEntrepreneur() {
        return entrepreneur;
    }
    public void setEntrepreneur(Entrepreneur entrepreneur) {
        this.entrepreneur = entrepreneur;
    }
    public User getCreadoPor() {
        return creadoPor;
    }
    public void setCreadoPor(User creadoPor) {
        this.creadoPor = creadoPor;
    }
} 