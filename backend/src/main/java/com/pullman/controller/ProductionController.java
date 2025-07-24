package com.pullman.controller;

import com.pullman.domain.Production;
import com.pullman.domain.Trip;
import com.pullman.domain.Zone;
import com.pullman.domain.Route;
import com.pullman.domain.Entrepreneur;
import com.pullman.domain.User;
import com.pullman.service.ProductionService;
import com.pullman.service.LiquidationService;
import com.pullman.service.UserService;
import com.pullman.repository.TripRepository;
import com.pullman.repository.ZoneRepository;
import com.pullman.repository.RouteRepository;
import com.pullman.repository.EntrepreneurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;
import java.time.format.DateTimeFormatter;
import java.text.Normalizer;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import com.pullman.service.NotificacionService;
import com.pullman.domain.Notificacion;

@RestController
@RequestMapping("/api/productions")
public class ProductionController {
    @Autowired
    private ProductionService productionService;
    
    @Autowired
    private TripRepository tripRepository;
    
    @Autowired
    private ZoneRepository zoneRepository;
    
    @Autowired
    private RouteRepository routeRepository;
    
    @Autowired
    private EntrepreneurRepository entrepreneurRepository;

    @Autowired
    private LiquidationService liquidationService;

    @Autowired
    private UserService userService;

    @Autowired
    private NotificacionService notificacionService;

    @GetMapping
    public List<Production> getAll() {
        return productionService.findAll();
    }

    @GetMapping("/paged")
    public Page<Production> getAllPaged(@PageableDefault(size = 20) Pageable pageable) {
        return productionService.findAll(pageable);
    }

    @GetMapping("/pendientes")
    public List<Production> getPendientes(@RequestParam(value = "decena", required = false) String decena,
                                        @RequestParam(value = "includeValidated", defaultValue = "false") boolean includeValidated) {
        if (decena != null && !includeValidated) {
            // Usar consulta optimizada para decena específica y solo pendientes
            return productionService.findByDecena(decena).stream()
                .filter(p -> !p.isValidado())
                .toList();
        } else if (!includeValidated) {
            // Usar consulta optimizada para solo pendientes
            return productionService.findPendientes();
        } else {
            // Filtrar en memoria para casos complejos
            return productionService.findAll().stream()
                .filter(p -> includeValidated || !p.isValidado())
                .filter(p -> decena == null || decena.equals(p.getDecena()))
                .toList();
        }
    }

    @PostMapping("/generate")
    public ResponseEntity<Map<String, Object>> generateProductions(@RequestParam String decena) {
        try {
            int generatedCount = productionService.generateProductionsForDecena(decena);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Producciones generadas exitosamente");
            response.put("generatedCount", generatedCount);
            response.put("decena", decena);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al generar producciones: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/pendientes/{id}/validate")
    public ResponseEntity<?> validarProduccion(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload,
            @RequestHeader("X-User-Email") String userEmail) {
        try {
            String nuevoEstatus = (String) payload.get("estatus");
            String comentarios = (String) payload.get("comentarios");
            if (nuevoEstatus == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "El campo 'estatus' es obligatorio"));
            }
            Optional<User> userOpt = userService.findByEmail(userEmail);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(403).body(Map.of("error", "Usuario no autenticado"));
            }
            User user = userOpt.get();
            Optional<Production> prodOpt = productionService.findById(id);
            if (prodOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            Production prod = prodOpt.get();
            String estadoActual = prod.isValidado() ? "APROBADO" : "PENDIENTE"; // Ajusta según tu lógica
            // Restricciones de rol
            if ("APROBADO".equals(estadoActual) && user.getRol() != User.Role.ADMIN) {
                return ResponseEntity.status(403).body(Map.of("error", "Solo el rol ADMIN puede modificar una producción ya aprobada"));
            }
            if (!user.getRol().equals(User.Role.ADMIN)) {
                if ("APROBADO".equals(estadoActual)) {
                    return ResponseEntity.status(403).body(Map.of("error", "No puedes modificar una producción ya aprobada"));
                }
                if (!List.of("EN_REVISION", "APROBADO", "RECHAZADO").contains(nuevoEstatus)) {
                    return ResponseEntity.status(403).body(Map.of("error", "No tienes permiso para asignar este estatus"));
                }
            }
            // Actualizar estado y comentarios
            prod.setComentarios(comentarios);
            prod.setValidado("APROBADO".equals(nuevoEstatus));
            prod.setFechaValidacion(LocalDate.now());
            prod.setValidadoPor(user);
            Production savedProd = productionService.save(prod);
            // Crear liquidación si la producción fue aprobada
            if ("APROBADO".equals(nuevoEstatus)) {
                liquidationService.createIfNotExistsForProduction(savedProd);
                // Notificar a todos los administradores
                List<User> admins = userService.findByRol(User.Role.ADMIN);
                for (User admin : admins) {
                    Notificacion notif = new Notificacion();
                    notif.setMensaje(user.getNombre() + " ha verificado una producción y está lista para ser liquidada.");
                    notif.setRolDestino("ADMIN");
                    notif.setTipo("AUTORIZACION");      
                    notif.setReferenciaId(savedProd.getId());
                    notificacionService.guardar(notif);
                }
            }
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Estatus actualizado exitosamente");
            response.put("production", savedProd);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al validar producción: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Production> getById(@PathVariable Long id) {
        return productionService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Production create(@RequestBody Production production) {
        Production saved = productionService.save(production);
        // Notificar a todos los validadores si la producción está pendiente de validación
        if (!saved.isValidado()) {
            List<User> validadores = userService.findByRol(User.Role.VALIDADOR);
            for (User validador : validadores) {
                Notificacion notif = new Notificacion();
                notif.setMensaje("Hay una nueva producción pendiente de validación.");
                notif.setRolDestino("VALIDADOR");
                notif.setTipo("VALIDACION");
                notif.setReferenciaId(saved.getId());
                notificacionService.guardar(notif);
            }
        }
        return saved;
    }

    private Zone findZoneForTrip(Trip trip, List<Route> routes) {
        if (trip.getOrigin() == null || trip.getDestination() == null) {
            return null;
        }
        
        String normalizedOrigin = normalizeString(trip.getOrigin());
        String normalizedDestination = normalizeString(trip.getDestination());
        
        for (Route route : routes) {
            String routeOrigin = normalizeString(route.getOrigen());
            String routeDestination = normalizeString(route.getDestino());
            
            if ((routeOrigin.equals(normalizedOrigin) && routeDestination.equals(normalizedDestination)) ||
                (routeOrigin.equals(normalizedDestination) && routeDestination.equals(normalizedOrigin))) {
                return route.getZona();
            }
        }
        
        return null;
    }
    
    private String normalizeString(String str) {
        if (str == null) return "";
        return Normalizer.normalize(str.toLowerCase(), Normalizer.Form.NFD)
            .replaceAll("[\\p{InCombiningDiacriticalMarks}]", "")
            .replaceAll("\\s+", " ")
            .trim();
    }

    private static String normalize(String str) {
        if (str == null) return "";
        String n = java.text.Normalizer.normalize(str.toLowerCase(), java.text.Normalizer.Form.NFD)
            .replaceAll("[\\p{InCombiningDiacriticalMarks}]+", "")
            .replaceAll("\\s+", " ")
            .trim();
        return n;
    }

    @PutMapping("/{id}")
    public ResponseEntity<Production> update(@PathVariable Long id, @RequestBody Production production) {
        return productionService.findById(id)
                .map(existing -> {
                    production.setId(id);
                    return ResponseEntity.ok(productionService.save(production));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (productionService.findById(id).isPresent()) {
            productionService.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // LIMPIAR TODAS LAS PRODUCCIONES
    @DeleteMapping("/clear-all")
    public ResponseEntity<Map<String, Object>> clearAllProductions() {
        try {
            // Contar producciones antes de borrar
            long productionsCount = productionService.findAll().size();
            
            // Borrar todas las producciones
            productionService.deleteAll();
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Todas las producciones eliminadas exitosamente");
            response.put("productionsDeleted", productionsCount);
            response.put("timestamp", LocalDate.now());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error durante la limpieza de producciones: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
} 