package com.pullman.domain;

import jakarta.persistence.*;
import java.util.Set;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;

    @Column(unique = true, nullable = false)
    private String email;

    private String password;

    @Enumerated(EnumType.STRING)
    private Role rol;

    private boolean activo;

    // Privilegios de visualización de pestañas
    private boolean canViewTrips = true;
    private boolean canViewRecorridos = true;
    private boolean canViewProduccion = true;
    private boolean canViewValidacion = true;
    private boolean canViewLiquidacion = true;
    private boolean canViewReportes = true;
    private boolean canViewUsuarios = false;

    // Relaciones (ejemplo)
    // @OneToMany(mappedBy = "creadoPor")
    // private Set<Route> rutasCreadas;

    public enum Role {
        ADMIN, VALIDADOR, MIEMBRO, INVITADO
    }

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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Role getRol() {
        return rol;
    }

    public void setRol(Role rol) {
        this.rol = rol;
    }

    public boolean isActivo() {
        return activo;
    }

    public void setActivo(boolean activo) {
        this.activo = activo;
    }

    // Getters y setters para privilegios
    public boolean isCanViewTrips() {
        return canViewTrips;
    }

    public void setCanViewTrips(boolean canViewTrips) {
        this.canViewTrips = canViewTrips;
    }

    public boolean isCanViewRecorridos() {
        return canViewRecorridos;
    }

    public void setCanViewRecorridos(boolean canViewRecorridos) {
        this.canViewRecorridos = canViewRecorridos;
    }

    public boolean isCanViewProduccion() {
        return canViewProduccion;
    }

    public void setCanViewProduccion(boolean canViewProduccion) {
        this.canViewProduccion = canViewProduccion;
    }

    public boolean isCanViewValidacion() {
        return canViewValidacion;
    }

    public void setCanViewValidacion(boolean canViewValidacion) {
        this.canViewValidacion = canViewValidacion;
    }

    public boolean isCanViewLiquidacion() {
        return canViewLiquidacion;
    }

    public void setCanViewLiquidacion(boolean canViewLiquidacion) {
        this.canViewLiquidacion = canViewLiquidacion;
    }

    public boolean isCanViewReportes() {
        return canViewReportes;
    }

    public void setCanViewReportes(boolean canViewReportes) {
        this.canViewReportes = canViewReportes;
    }

    public boolean isCanViewUsuarios() {
        return canViewUsuarios;
    }

    public void setCanViewUsuarios(boolean canViewUsuarios) {
        this.canViewUsuarios = canViewUsuarios;
    }
} 