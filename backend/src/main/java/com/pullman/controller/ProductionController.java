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
            // Calcular rango de fechas de la decena
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            int decenaNum = Integer.parseInt(decena.substring(0, 1));
            int mes = Integer.parseInt(decena.substring(1, 3));
            int anio = Integer.parseInt(decena.substring(3));
            int diaInicio = 1;
            int diaFin = 10;
            if (decenaNum == 2) {
                diaInicio = 11;
                diaFin = 20;
            } else if (decenaNum == 3) {
                diaInicio = 21;
                // último día del mes
                diaFin = java.time.YearMonth.of(anio, mes).lengthOfMonth();
            }
            LocalDate desde = LocalDate.of(anio, mes, diaInicio);
            LocalDate hasta = LocalDate.of(anio, mes, diaFin);

            // Obtener viajes optimizados por rango de fechas
            List<Trip> tripsInDecena = tripRepository.findByTravelDateBetween(desde, hasta);

            // Obtener todas las zonas y rutas
            List<Zone> zones = zoneRepository.findAll();
            List<Route> routes = routeRepository.findAll();
            // Obtener todos los empresarios
            List<Entrepreneur> entrepreneurs = entrepreneurRepository.findAll();
            // Crear mapa de empresarios por nombre
            Map<String, Entrepreneur> entrepreneurMap = entrepreneurs.stream()
                .collect(Collectors.toMap(Entrepreneur::getNombre, e -> e));
            // Agrupar viajes por empresario usando normalización
            Map<String, List<Trip>> tripsByEntrepreneur = tripsInDecena.stream()
                .filter(trip -> trip.getCompanyName() != null && !trip.getCompanyName().isEmpty())
                .collect(Collectors.groupingBy(trip -> normalize(trip.getCompanyName())));
            // Mapa para mostrar el nombre original de la empresa
            Map<String, String> originalNames = new HashMap<>();
            tripsInDecena.stream()
                .filter(trip -> trip.getCompanyName() != null && !trip.getCompanyName().isEmpty())
                .forEach(trip -> {
                    String norm = normalize(trip.getCompanyName());
                    if (!originalNames.containsKey(norm)) {
                        originalNames.put(norm, trip.getCompanyName());
                    }
                });
            int generatedCount = 0;
            // Para cada empresario, calcular y guardar producción
            for (Map.Entry<String, List<Trip>> entry : tripsByEntrepreneur.entrySet()) {
                String entrepreneurNameNorm = entry.getKey();
                String entrepreneurName = originalNames.getOrDefault(entrepreneurNameNorm, entrepreneurNameNorm);
                List<Trip> trips = entry.getValue();
                double totalIngresos = 0;
                double totalGanancia = 0;
                for (Trip trip : trips) {
                    double branchRevenue = trip.getBranchRevenue() != null ? trip.getBranchRevenue().doubleValue() : 0;
                    double roadRevenue = trip.getRoadRevenue() != null ? trip.getRoadRevenue().doubleValue() : 0;
                    double manualIncome = 0;
                    if (trip.getManualIncome() != null && !trip.getManualIncome().isEmpty()) {
                        try {
                            manualIncome = Double.parseDouble(trip.getManualIncome().replaceAll("[^\\d.-]", ""));
                        } catch (NumberFormatException e) {
                            manualIncome = 0;
                        }
                    }
                    double tripTotal = branchRevenue + roadRevenue + manualIncome;
                    totalIngresos += tripTotal;
                    Zone zone = findZoneForTrip(trip, routes);
                    if (zone != null) {
                        totalGanancia += tripTotal * (zone.getPorcentaje() / 100.0);
                    }
                }
                Entrepreneur entrepreneur = entrepreneurMap.get(entrepreneurName);
                if (entrepreneur == null) {
                    entrepreneur = new Entrepreneur();
                    entrepreneur.setNombre(entrepreneurName);
                    entrepreneur = entrepreneurRepository.save(entrepreneur);
                    entrepreneurMap.put(entrepreneurName, entrepreneur);
                }
                            // Verificar si existe la producción de manera optimizada
            boolean productionExists = productionService.existsByEntrepreneurAndDecena(entrepreneur.getId(), decena);
            if (!productionExists && totalGanancia > 0) {
                    Production production = new Production();
                    production.setDecena(decena);
                    production.setTotal(totalGanancia);
                    production.setValidado(false);
                    production.setComentarios("");
                    production.setEntrepreneur(entrepreneur);
                    productionService.save(production);
                    generatedCount++;
                }
            }
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
        return productionService.save(production);
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