package com.pullman.controller;

import com.pullman.domain.User;
import com.pullman.service.UserService;
import com.pullman.service.AuthorizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private AuthorizationService authorizationService;
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");
        
        User user = userService.authenticate(email, password);
        
        if (user != null) {
            // Obtener privilegios del usuario
            List<String> userPrivileges = authorizationService.getUserPrivileges(user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("user", user);
            response.put("privileges", userPrivileges);
            response.put("message", "Login exitoso");
            return ResponseEntity.ok(response);
        } else {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Credenciales inválidas");
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping
    public List<Map<String, Object>> getAllUsers() {
        List<User> users = userService.findAll();
        List<Map<String, Object>> result = new java.util.ArrayList<>();
        for (User u : users) {
            Map<String, Object> userData = new java.util.HashMap<>();
            userData.put("id", u.getId());
            userData.put("nombre", u.getNombre());
            userData.put("email", u.getEmail());
            userData.put("rol", u.getRol());
            userData.put("activo", u.isActivo());
            userData.put("canViewTrips", u.isCanViewTrips());
            userData.put("canViewRecorridos", u.isCanViewRecorridos());
            userData.put("canViewProduccion", u.isCanViewProduccion());
            userData.put("canViewValidacion", u.isCanViewValidacion());
            userData.put("canViewLiquidacion", u.isCanViewLiquidacion());
            userData.put("canViewReportes", u.isCanViewReportes());
            userData.put("canViewUsuarios", u.isCanViewUsuarios());
            result.add(userData);
        }
        return result;
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public User createUser(@RequestBody User user) {
        return userService.save(user);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User user) {
        return userService.findById(id)
                .map(existing -> {
                    user.setId(id);
                    User updatedUser = userService.save(user);
                    // Crear un mapa con solo los datos necesarios del usuario (sin password)
                    Map<String, Object> userData = new HashMap<>();
                    userData.put("id", updatedUser.getId());
                    userData.put("nombre", updatedUser.getNombre());
                    userData.put("email", updatedUser.getEmail());
                    userData.put("rol", updatedUser.getRol());
                    userData.put("activo", updatedUser.isActivo());
                    userData.put("canViewTrips", updatedUser.isCanViewTrips());
                    userData.put("canViewRecorridos", updatedUser.isCanViewRecorridos());
                    userData.put("canViewProduccion", updatedUser.isCanViewProduccion());
                    userData.put("canViewValidacion", updatedUser.isCanViewValidacion());
                    userData.put("canViewLiquidacion", updatedUser.isCanViewLiquidacion());
                    userData.put("canViewReportes", updatedUser.isCanViewReportes());
                    userData.put("canViewUsuarios", updatedUser.isCanViewUsuarios());
                    Map<String, Object> response = new HashMap<>();
                    response.put("message", "Usuario actualizado correctamente");
                    response.put("user", userData);
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/{id}/password")
    public ResponseEntity<?> changePassword(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String oldPassword = payload.get("oldPassword");
        String newPassword = payload.get("newPassword");
        if (oldPassword == null || newPassword == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Faltan datos"));
        }
        boolean changed = userService.changePassword(id, oldPassword, newPassword);
        if (changed) {
            return ResponseEntity.ok(Map.of("message", "Contraseña actualizada correctamente"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "La contraseña actual es incorrecta"));
        }
    }
    
    @PutMapping("/{id}/nombre")
    public ResponseEntity<?> updateUserName(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String nuevoNombre = payload.get("nombre");
        if (nuevoNombre == null || nuevoNombre.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "El nombre no puede estar vacío"));
        }
        return userService.findById(id)
                .map(user -> {
                    user.setNombre(nuevoNombre.trim());
                    User updatedUser = userService.save(user);
                    
                    // Crear un mapa con solo los datos necesarios del usuario
                    Map<String, Object> userData = new HashMap<>();
                    userData.put("id", updatedUser.getId());
                    userData.put("nombre", updatedUser.getNombre());
                    userData.put("email", updatedUser.getEmail());
                    userData.put("rol", updatedUser.getRol());
                    userData.put("activo", updatedUser.isActivo());
                    // Agregar los demás campos necesarios sin incluir la contraseña
                    userData.put("canViewTrips", updatedUser.isCanViewTrips());
                    userData.put("canViewRecorridos", updatedUser.isCanViewRecorridos());
                    userData.put("canViewProduccion", updatedUser.isCanViewProduccion());
                    userData.put("canViewValidacion", updatedUser.isCanViewValidacion());
                    userData.put("canViewLiquidacion", updatedUser.isCanViewLiquidacion());
                    userData.put("canViewReportes", updatedUser.isCanViewReportes());
                    userData.put("canViewUsuarios", updatedUser.isCanViewUsuarios());
                    
                    Map<String, Object> response = new HashMap<>();
                    response.put("message", "Nombre actualizado correctamente");
                    response.put("user", userData);
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        if (userService.findById(id).isPresent()) {
            userService.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
    
    @PostMapping("/initialize")
    public ResponseEntity<Map<String, Object>> initializeDefaultUsers() {
        try {
            userService.initializeDefaultUsers();
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Usuarios por defecto creados exitosamente");
            response.put("usersCreated", userService.findAll().size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al crear usuarios por defecto: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
} 