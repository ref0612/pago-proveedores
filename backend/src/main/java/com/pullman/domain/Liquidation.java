package com.pullman.domain;

import jakarta.persistence.*;
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

    private LocalDate fechaPago; // Nueva columna: fecha en que se registra el pago
    private LocalDate fechaAprobacion; // Nueva columna: fecha en que se aprueba la liquidación

    @Lob
    private byte[] comprobantePago; // Comprobante de pago en binario

    @ManyToOne
    @JoinColumn(name = "production_id")
    private Production production;

    @ManyToOne
    @JoinColumn(name = "generado_por")
    private User generadoPor;

    // Getters y setters
    public void setId(Long id) {
        this.id = id;
    }
    public Long getId() { return id; }

    public Double getMonto() { return monto; }
    public void setMonto(Double monto) { this.monto = monto; }

    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public LocalDate getFechaPago() { return fechaPago; }
    public void setFechaPago(LocalDate fechaPago) { this.fechaPago = fechaPago; }

    public LocalDate getFechaAprobacion() { return fechaAprobacion; }
    public void setFechaAprobacion(LocalDate fechaAprobacion) { this.fechaAprobacion = fechaAprobacion; }

    public byte[] getComprobantePago() { return comprobantePago; }
    public void setComprobantePago(byte[] comprobantePago) { this.comprobantePago = comprobantePago; }

    public Production getProduction() { return production; }
    public void setProduction(Production production) { this.production = production; }

    public User getGeneradoPor() { return generadoPor; }
    public void setGeneradoPor(User generadoPor) { this.generadoPor = generadoPor; }
} 