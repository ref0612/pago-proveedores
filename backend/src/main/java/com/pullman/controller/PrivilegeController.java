package com.pullman.controller;

import com.pullman.domain.Privilege;
import com.pullman.domain.User;
import com.pullman.service.PrivilegeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/privileges")
@CrossOrigin(origins = "*")
public class PrivilegeController {
    
    @Autowired
    private PrivilegeService privilegeService;

    // Obtener todos los privilegios
    @GetMapping
    public List<Privilege> getAllPrivileges() {
        return privilegeService.findAll();
    }

    // Obtener privilegios habilitados
    @GetMapping("/enabled")
    public List<Privilege> getEnabledPrivileges() {
        return privilegeService.findEnabled();
    }

    // Obtener privilegios por categoría
    @GetMapping("/category/{category}")
    public List<Privilege> getPrivilegesByCategory(@PathVariable String category) {
        return privilegeService.findByCategory(category);
    }

    // Obtener todas las categorías
    @GetMapping("/categories")
    public List<String> getAllCategories() {
        return privilegeService.findAllCategories();
    }

    // Obtener todas las acciones
    @GetMapping("/actions")
    public List<String> getAllActions() {
        return privilegeService.findAllActions();
    }

    // Obtener privilegios agrupados por categoría
    @GetMapping("/by-category")
    public Map<String, List<Privilege>> getPrivilegesByCategory() {
        return privilegeService.getPrivilegesByCategory();
    }

    // Obtener privilegios de un rol específico
    @GetMapping("/role/{role}")
    public Map<String, Boolean> getPrivilegesForRole(@PathVariable String role) {
        try {
            User.Role userRole = User.Role.valueOf(role.toUpperCase());
            return privilegeService.getPrivilegesForRole(userRole);
        } catch (IllegalArgumentException e) {
            return new HashMap<>();
        }
    }

    // Verificar si un rol tiene un privilegio específico
    @GetMapping("/check/{role}/{privilegeName}")
    public ResponseEntity<Map<String, Boolean>> hasPrivilege(
            @PathVariable String role,
            @PathVariable String privilegeName) {
        try {
            User.Role userRole = User.Role.valueOf(role.toUpperCase());
            boolean hasPrivilege = privilegeService.hasPrivilege(userRole, privilegeName);
            Map<String, Boolean> response = new HashMap<>();
            response.put("hasPrivilege", hasPrivilege);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Actualizar privilegios de un rol
    @PostMapping("/role/{role}")
    public ResponseEntity<Map<String, Object>> updateRolePrivileges(
            @PathVariable String role,
            @RequestBody Map<String, Boolean> privileges) {
        try {
            User.Role userRole = User.Role.valueOf(role.toUpperCase());
            privilegeService.updateRolePrivileges(userRole, privileges);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Privilegios actualizados exitosamente");
            response.put("role", role);
            response.put("updatedPrivileges", privileges);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Rol inválido: " + role);
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al actualizar privilegios: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    // Obtener estadísticas de privilegios por rol
    @GetMapping("/stats")
    public List<Object[]> getPrivilegeStats() {
        return privilegeService.getPrivilegeStatsByRole();
    }

    // Inicializar privilegios por defecto
    @PostMapping("/initialize")
    public ResponseEntity<Map<String, Object>> initializeDefaultPrivileges() {
        try {
            privilegeService.initializeDefaultPrivileges();
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Privilegios inicializados exitosamente");
            response.put("totalPrivileges", privilegeService.findAll().size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al inicializar privilegios: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    // Crear nuevo privilegio
    @PostMapping
    public ResponseEntity<Privilege> createPrivilege(@RequestBody Privilege privilege) {
        try {
            Privilege savedPrivilege = privilegeService.save(privilege);
            return ResponseEntity.ok(savedPrivilege);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Actualizar privilegio
    @PutMapping("/{id}")
    public ResponseEntity<Privilege> updatePrivilege(@PathVariable Long id, @RequestBody Privilege privilege) {
        try {
            privilege.setId(id);
            Privilege updatedPrivilege = privilegeService.save(privilege);
            return ResponseEntity.ok(updatedPrivilege);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Eliminar privilegio
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deletePrivilege(@PathVariable Long id) {
        try {
            privilegeService.deleteById(id);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Privilegio eliminado exitosamente");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al eliminar privilegio: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    // Obtener privilegio por ID
    @GetMapping("/{id}")
    public ResponseEntity<Privilege> getPrivilegeById(@PathVariable Long id) {
        Privilege privilege = privilegeService.findById(id);
        if (privilege != null) {
            return ResponseEntity.ok(privilege);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
} 