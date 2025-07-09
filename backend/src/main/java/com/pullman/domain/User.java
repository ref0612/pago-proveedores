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

    // Relaciones (ejemplo)
    // @OneToMany(mappedBy = "creadoPor")
    // private Set<Route> rutasCreadas;

    // Getters y setters
    // ...

    public void setId(Long id) {
        this.id = id;
    }

    public enum Role {
        ADMIN, VALIDADOR, MIEMBRO, INVITADO
    }
} 