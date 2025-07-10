package com.pullman.service;

import com.pullman.domain.User;
import com.pullman.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    public List<User> findAll() {
        return userRepository.findAll();
    }
    
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }
    
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    public User save(User user) {
        return userRepository.save(user);
    }
    
    public void deleteById(Long id) {
        userRepository.deleteById(id);
    }
    
    public User authenticate(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getPassword().equals(password) && user.isActivo()) {
                return user;
            }
        }
        return null;
    }
    
    public void initializeDefaultUsers() {
        // Solo crear usuarios si no existen
        if (userRepository.count() == 0) {
            // ADMIN
            User admin = new User();
            admin.setNombre("Administrador");
            admin.setEmail("admin@pullman.com");
            admin.setPassword("admin123");
            admin.setRol(User.Role.ADMIN);
            admin.setActivo(true);
            admin.setCanViewTrips(true);
            admin.setCanViewRecorridos(true);
            admin.setCanViewProduccion(true);
            admin.setCanViewValidacion(true);
            admin.setCanViewLiquidacion(true);
            admin.setCanViewReportes(true);
            admin.setCanViewUsuarios(true);
            userRepository.save(admin);
            
            // VALIDADOR
            User validador = new User();
            validador.setNombre("Validador");
            validador.setEmail("validador@pullman.com");
            validador.setPassword("val123");
            validador.setRol(User.Role.VALIDADOR);
            validador.setActivo(true);
            validador.setCanViewTrips(true);
            validador.setCanViewRecorridos(true);
            validador.setCanViewProduccion(true);
            validador.setCanViewValidacion(true);
            validador.setCanViewLiquidacion(true);
            validador.setCanViewReportes(true);
            validador.setCanViewUsuarios(false);
            userRepository.save(validador);
            
            // MIEMBRO
            User miembro = new User();
            miembro.setNombre("Miembro");
            miembro.setEmail("miembro@pullman.com");
            miembro.setPassword("miem123");
            miembro.setRol(User.Role.MIEMBRO);
            miembro.setActivo(true);
            miembro.setCanViewTrips(true);
            miembro.setCanViewRecorridos(true);
            miembro.setCanViewProduccion(false);
            miembro.setCanViewValidacion(false);
            miembro.setCanViewLiquidacion(false);
            miembro.setCanViewReportes(false);
            miembro.setCanViewUsuarios(false);
            userRepository.save(miembro);
            
            // INVITADO
            User invitado = new User();
            invitado.setNombre("Invitado");
            invitado.setEmail("invitado@pullman.com");
            invitado.setPassword("inv123");
            invitado.setRol(User.Role.INVITADO);
            invitado.setActivo(true);
            invitado.setCanViewTrips(false);
            invitado.setCanViewRecorridos(false);
            invitado.setCanViewProduccion(false);
            invitado.setCanViewValidacion(false);
            invitado.setCanViewLiquidacion(false);
            invitado.setCanViewReportes(false);
            invitado.setCanViewUsuarios(false);
            userRepository.save(invitado);
        }
    }
} 