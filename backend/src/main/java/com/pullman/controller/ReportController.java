package com.pullman.controller;

import com.pullman.domain.Trip;
import com.pullman.domain.Entrepreneur;
import com.pullman.repository.TripRepository;
import com.pullman.repository.EntrepreneurRepository;
import com.pullman.repository.ZoneRepository;
import com.pullman.repository.LiquidationRepository;
import com.pullman.repository.ProductionRepository;
import com.pullman.repository.AuditLogRepository;
import com.pullman.repository.RouteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.List;
import com.pullman.domain.Route;

@RestController
@RequestMapping("/api/reports")
public class ReportController {
    private static final Logger logger = LoggerFactory.getLogger(ReportController.class);
    @Autowired
    private TripRepository tripRepository;
    @Autowired
    private EntrepreneurRepository entrepreneurRepository;
    @Autowired
    private ZoneRepository zoneRepository;
    @Autowired
    private ProductionRepository productionRepository;
    @Autowired
    private LiquidationRepository liquidationRepository;
    @Autowired
    private AuditLogRepository auditLogRepository;
    @Autowired
    private RouteRepository routeRepository;

    // --- Normalización utilitaria para toda la clase ---
    private static final java.text.Normalizer.Form NORMALIZER_FORM = java.text.Normalizer.Form.NFD;
    private static String normalize(String s) {
        if (s == null) return "";
        String normalized = java.text.Normalizer.normalize(s.trim().toLowerCase(), NORMALIZER_FORM)
            .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        return normalized.replaceAll("\\s+", " ");
    }

    @GetMapping("/global-summary")
    public Map<String, Object> getGlobalSummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta
    ) {
        logger.info("[GLOBAL SUMMARY] Recibido desde: {} hasta: {}", desde, hasta);
        Map<String, Object> result = new HashMap<>();
        var viajes = tripRepository.findByTravelDateBetween(desde, hasta);
        logger.info("[GLOBAL SUMMARY] Viajes encontrados: {}", viajes.size());
        // totalRecorridos = cantidad de servicios/viajes en la decena
        int totalRecorridos = viajes.size();
        // totalIngresos = producción total (suma de branchRevenue + roadRevenue + manualIncome de todos los viajes)
        double totalIngresos = viajes.stream()
                .mapToDouble(t -> {
                    double b = t.getBranchRevenue() != null ? t.getBranchRevenue().doubleValue() : 0;
                    double r = t.getRoadRevenue() != null ? t.getRoadRevenue().doubleValue() : 0;
                    double m = 0;
                    if (t.getManualIncome() != null && !t.getManualIncome().isEmpty()) {
                        try { m = Double.parseDouble(t.getManualIncome().replaceAll("[^\\d.-]", "")); } catch (Exception e) { m = 0; }
                    }
                    return b + r + m;
                }).sum();
        logger.info("[GLOBAL SUMMARY] Total ingresos calculado: {}", totalIngresos);
        long totalEmpresarios = entrepreneurRepository.count();
        long totalZonas = zoneRepository.count();
        result.put("totalRecorridos", totalRecorridos); // cantidad de servicios
        result.put("totalIngresos", totalIngresos);     // producción total
        result.put("totalEmpresarios", totalEmpresarios);
        result.put("totalZonas", totalZonas);
        return result;
    }

    @GetMapping("/empresario-detallado")
    public Map<String, Object> getEmpresarioDetallado(
            @RequestParam Long empresarioId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta
    ) {
        Map<String, Object> result = new HashMap<>();
        java.text.Normalizer.Form form = java.text.Normalizer.Form.NFD;
        java.util.function.Function<String, String> normalize = s -> {
            if (s == null) return "";
            String normalized = java.text.Normalizer.normalize(s.trim().toLowerCase(), form)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
            return normalized.replaceAll("\\s+", " ");
        };
        if (empresarioId == 0) {
            // Todos los empresarios: obtener todos los viajes en el rango y agrupar por empresario
            var trips = tripRepository.findByTravelDateBetween(desde, hasta).stream()
                .filter(t -> t.getCompanyName() != null && !t.getCompanyName().isEmpty())
                .toList();
            // Crear mapa de rutas para lookup rápido: clave = origen|destino normalizados
            var rutasList = routeRepository.findAll();
            Map<String, Route> rutasMap = new HashMap<>();
            for (Route r : rutasList) {
                String key = normalize.apply(r.getOrigen()) + "|" + normalize.apply(r.getDestino());
                rutasMap.put(key, r);
            }
            // Agrupar por empresario
            Map<String, List<Trip>> viajesPorEmpresario = new HashMap<>();
            for (Trip t : trips) {
                String emp = t.getCompanyName();
                if (!viajesPorEmpresario.containsKey(emp)) viajesPorEmpresario.put(emp, new java.util.ArrayList<>());
                viajesPorEmpresario.get(emp).add(t);
            }
            // Construir lista de viajes con columna empresario
            var viajes = new java.util.ArrayList<Map<String, Object>>();
            for (Map.Entry<String, List<Trip>> entry : viajesPorEmpresario.entrySet()) {
                String nombreEmp = entry.getKey();
                for (Trip t : entry.getValue()) {
                    Map<String, Object> viaje = new HashMap<>();
                    viaje.put("fecha", t.getTravelDate());
                    viaje.put("origen", t.getOrigin());
                    viaje.put("destino", t.getDestination());
                    viaje.put("salida", t.getDepartureTime());
                    viaje.put("nroBus", t.getBusNumber());
                    // Lookup de ruta usando el mapa
                    String key = normalize.apply(t.getOrigin()) + "|" + normalize.apply(t.getDestination());
                    Route ruta = rutasMap.get(key);
                    String zona = (ruta != null && ruta.getZona() != null) ? ruta.getZona().getNombre() : null;
                    viaje.put("zona", zona);
                    double b = t.getBranchRevenue() != null ? t.getBranchRevenue().doubleValue() : 0;
                    double r = t.getRoadRevenue() != null ? t.getRoadRevenue().doubleValue() : 0;
                    double m = 0;
                    if (t.getManualIncome() != null && !t.getManualIncome().isEmpty()) {
                        try { m = Double.parseDouble(t.getManualIncome().replaceAll("[^\\d.-]", "")); } catch (Exception e) { m = 0; }
                    }
                    double produccionTotal = b + r + m;
                    viaje.put("produccionTotal", produccionTotal);
                    Double ganancia = null;
                    if (ruta != null && ruta.getZona() != null) {
                        double porcentaje = ruta.getZona().getPorcentaje();
                        ganancia = produccionTotal * (porcentaje / 100.0);
                    }
                    viaje.put("ganancia", ganancia);
                    viaje.put("empresario", nombreEmp);
                    viajes.add(viaje);
                }
            }
            result.put("viajes", viajes);
            result.put("empresario", "Todos");
            return result;
        } else {
            Entrepreneur emp = entrepreneurRepository.findById(empresarioId).orElse(null);
            if (emp == null) {
                result.put("error", "Empresario no encontrado");
                return result;
            }
            String nombreEmp = emp.getNombre();
            var trips = tripRepository.findByTravelDateBetween(desde, hasta).stream()
                    .filter(t -> t.getCompanyName() != null && t.getCompanyName().equalsIgnoreCase(nombreEmp))
                    .toList();
            var viajes = new java.util.ArrayList<Map<String, Object>>();
            for (Trip t : trips) {
                Map<String, Object> viaje = new HashMap<>();
                viaje.put("fecha", t.getTravelDate());
                viaje.put("origen", t.getOrigin());
                viaje.put("destino", t.getDestination());
                viaje.put("salida", t.getDepartureTime());
                viaje.put("nroBus", t.getBusNumber());
                var rutas = routeRepository.findAll().stream()
                    .filter(r -> normalize.apply(r.getOrigen()).equals(normalize.apply(t.getOrigin()))
                            && normalize.apply(r.getDestino()).equals(normalize.apply(t.getDestination())))
                    .toList();
                String zona = (rutas != null && !rutas.isEmpty() && rutas.get(0).getZona() != null) ? rutas.get(0).getZona().getNombre() : null;
                viaje.put("zona", zona);
                double b = t.getBranchRevenue() != null ? t.getBranchRevenue().doubleValue() : 0;
                double r = t.getRoadRevenue() != null ? t.getRoadRevenue().doubleValue() : 0;
                double m = 0;
                if (t.getManualIncome() != null && !t.getManualIncome().isEmpty()) {
                    try { m = Double.parseDouble(t.getManualIncome().replaceAll("[^\\d.-]", "")); } catch (Exception e) { m = 0; }
                }
                double produccionTotal = b + r + m;
                viaje.put("produccionTotal", produccionTotal);
                Double ganancia = null;
                if (rutas != null && !rutas.isEmpty() && rutas.get(0).getZona() != null) {
                    double porcentaje = rutas.get(0).getZona().getPorcentaje();
                    ganancia = produccionTotal * (porcentaje / 100.0);
                }
                viaje.put("ganancia", ganancia);
                viaje.put("empresario", nombreEmp);
                viajes.add(viaje);
            }
            result.put("viajes", viajes);
            result.put("empresario", emp.getNombre());
            return result;
        }
    }

    @GetMapping("/zona-detallada")
    public Map<String, Object> getZonaDetallada(
            @RequestParam String zona,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta
    ) {
        Map<String, Object> result = new HashMap<>();
        // Construir un mapa de rutas para lookup rápido: clave = origen|destino normalizados
        var rutasList = routeRepository.findAll();
        Map<String, Route> rutasMap = new HashMap<>();
        for (Route r : rutasList) {
            if (r.getZona() != null) {
                String key = normalize(r.getOrigen()) + "|" + normalize(r.getDestino());
                rutasMap.put(key, r);
            }
        }
        // Buscar todos los viajes en el rango de fechas
        var allTrips = tripRepository.findByTravelDateBetween(desde, hasta);
        // Para cada viaje, buscar la zona asociada por ruta usando el mapa
        var trips = allTrips.stream().filter(t -> {
            String key = normalize(t.getOrigin()) + "|" + normalize(t.getDestination());
            Route ruta = rutasMap.get(key);
            if (ruta != null) {
                String zonaViaje = ruta.getZona().getNombre();
                return normalize(zonaViaje).equals(normalize(zona));
            }
            return false;
        }).toList();
        logger.info("[DETALLE ZONA] Viajes filtrados para zona '{}', fechas {} a {}: {}", zona, desde, hasta, trips.size());
        if (!trips.isEmpty()) {
            logger.info("[DETALLE ZONA] Ejemplo viaje: origen='{}', destino='{}', empresa='{}'", trips.get(0).getOrigin(), trips.get(0).getDestination(), trips.get(0).getCompanyName());
        }
        // Agrupar por empresario
        Map<String, List<Trip>> viajesPorEmpresario = new HashMap<>();
        for (Trip t : trips) {
            String emp = t.getCompanyName() != null ? t.getCompanyName() : "";
            if (!viajesPorEmpresario.containsKey(emp)) viajesPorEmpresario.put(emp, new java.util.ArrayList<>());
            viajesPorEmpresario.get(emp).add(t);
        }
        logger.info("[DETALLE ZONA] Empresarios distintos: {}", viajesPorEmpresario.keySet());
        // Para cada empresario, calcular los datos solicitados
        List<Map<String, Object>> detalle = new java.util.ArrayList<>();
        int zonasNull = 0;
        for (var entry : viajesPorEmpresario.entrySet()) {
            String emp = entry.getKey();
            List<Trip> viajesEmp = entry.getValue();
            if (emp == null || emp.isEmpty()) continue;
            // Agrupar por fecha
            Map<LocalDate, List<Trip>> viajesPorFecha = new HashMap<>();
            for (Trip t : viajesEmp) {
                LocalDate fecha = t.getTravelDate();
                if (!viajesPorFecha.containsKey(fecha)) viajesPorFecha.put(fecha, new java.util.ArrayList<>());
                viajesPorFecha.get(fecha).add(t);
            }
            logger.info("[DETALLE ZONA] Empresario '{}': {} fechas distintas", emp, viajesPorFecha.keySet().size());
            for (var entryFecha : viajesPorFecha.entrySet()) {
                LocalDate fecha = entryFecha.getKey();
                List<Trip> viajesFecha = entryFecha.getValue();
                // Zona (puede variar, pero tomamos la primera encontrada)
                String zonaNombre = zona;
                Double porcentajeZona = null;
                // Buscar zona y porcentaje usando el mapa
                String key = normalize(viajesFecha.get(0).getOrigin()) + "|" + normalize(viajesFecha.get(0).getDestination());
                Route ruta = rutasMap.get(key);
                if (ruta != null) {
                    zonaNombre = ruta.getZona().getNombre();
                    porcentajeZona = ruta.getZona().getPorcentaje();
                } else {
                    zonasNull++;
                }
                // Cantidad de servicios
                int cantidadServicios = viajesFecha.size();
                // Cantidad de buses usados
                long cantidadBuses = viajesFecha.stream().map(Trip::getBusNumber).filter(b -> b != null && !b.isEmpty()).distinct().count();
                // Producción total y ganancia
                double produccionTotal = 0;
                double ganancia = 0;
                for (Trip t : viajesFecha) {
                    double b = t.getBranchRevenue() != null ? t.getBranchRevenue().doubleValue() : 0;
                    double r = t.getRoadRevenue() != null ? t.getRoadRevenue().doubleValue() : 0;
                    double m = 0;
                    if (t.getManualIncome() != null && !t.getManualIncome().isEmpty()) {
                        try { m = Double.parseDouble(t.getManualIncome().replaceAll("[^\\d.-]", "")); } catch (Exception e) { m = 0; }
                    }
                    produccionTotal += b + r + m;
                    if (porcentajeZona != null) {
                        ganancia += (b + r + m) * (porcentajeZona / 100.0);
                    }
                }
                Map<String, Object> fila = new HashMap<>();
                fila.put("fecha", fecha);
                fila.put("zona", zonaNombre);
                fila.put("empresario", emp);
                fila.put("cantidadServicios", cantidadServicios);
                fila.put("cantidadBuses", cantidadBuses);
                fila.put("produccionTotal", produccionTotal);
                fila.put("porcentajeZona", porcentajeZona);
                fila.put("ganancia", ganancia);
                detalle.add(fila);
            }
        }
        logger.info("[DETALLE ZONA] Registros de detalle: {} (zonas null: {})", detalle.size(), zonasNull);
        result.put("detalle", detalle);
        result.put("zona", zona);
        return result;
    }

    @GetMapping("/produccion-liquidaciones")
    public Map<String, Object> getProduccionLiquidaciones(
            @RequestParam(required = false) Long empresarioId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta
    ) {
        Map<String, Object> result = new HashMap<>();
        // Filtrar producciones por empresario y fechas
        var producciones = productionRepository.findAll().stream()
                .filter(p -> (empresarioId == null || (p.getEntrepreneur() != null && p.getEntrepreneur().getId().equals(empresarioId))))
                .filter(p -> {
                    // Decena a rango de fechas
                    try {
                        String decena = p.getDecena();
                        int decenaNum = Integer.parseInt(decena.substring(0, 1));
                        int mes = Integer.parseInt(decena.substring(1, 3));
                        int anio = Integer.parseInt(decena.substring(3));
                        int diaInicio = (decenaNum == 1) ? 1 : (decenaNum == 2) ? 11 : 21;
                        int diaFin = (decenaNum == 1) ? 10 : (decenaNum == 2) ? 20 : java.time.YearMonth.of(anio, mes).lengthOfMonth();
                        LocalDate desdeDecena = LocalDate.of(anio, mes, diaInicio);
                        LocalDate hastaDecena = LocalDate.of(anio, mes, diaFin);
                        return !(hastaDecena.isBefore(desde) || desdeDecena.isAfter(hasta));
                    } catch (Exception e) { return false; }
                })
                .toList();
        // Para cada producción, buscar liquidación asociada
        var lista = new java.util.ArrayList<Map<String, Object>>();
        for (var p : producciones) {
            Map<String, Object> item = new HashMap<>();
            item.put("empresario", p.getEntrepreneur() != null ? p.getEntrepreneur().getNombre() : null);
            item.put("decena", p.getDecena());
            item.put("totalProduccion", p.getTotal());
            item.put("validado", p.isValidado());
            var liq = liquidationRepository.findAll().stream().filter(l -> l.getProduction() != null && l.getProduction().getId().equals(p.getId())).findFirst().orElse(null);
            if (liq != null) {
                item.put("liquidacion", Map.of(
                    "monto", liq.getMonto(),
                    "estado", liq.getEstado(),
                    "fechaPago", liq.getFechaPago(),
                    "fechaAprobacion", liq.getFechaAprobacion()
                ));
            } else {
                item.put("liquidacion", null);
            }
            lista.add(item);
        }
        result.put("produccionLiquidaciones", lista);
        return result;
    }

    @GetMapping("/validaciones-aprobaciones")
    public Map<String, Object> getValidacionesAprobaciones(
            @RequestParam(required = false) Long empresarioId,
            @RequestParam(required = false) String zona,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta
    ) {
        Map<String, Object> result = new HashMap<>();
        var producciones = productionRepository.findAll().stream()
                .filter(p -> (empresarioId == null || (p.getEntrepreneur() != null && p.getEntrepreneur().getId().equals(empresarioId))))
                .filter(p -> {
                    // Decena a rango de fechas
                    try {
                        String decena = p.getDecena();
                        int decenaNum = Integer.parseInt(decena.substring(0, 1));
                        int mes = Integer.parseInt(decena.substring(1, 3));
                        int anio = Integer.parseInt(decena.substring(3));
                        int diaInicio = (decenaNum == 1) ? 1 : (decenaNum == 2) ? 11 : 21;
                        int diaFin = (decenaNum == 1) ? 10 : (decenaNum == 2) ? 20 : java.time.YearMonth.of(anio, mes).lengthOfMonth();
                        LocalDate desdeDecena = LocalDate.of(anio, mes, diaInicio);
                        LocalDate hastaDecena = LocalDate.of(anio, mes, diaFin);
                        return !(hastaDecena.isBefore(desde) || desdeDecena.isAfter(hasta));
                    } catch (Exception e) { return false; }
                })
                .toList();
        // Si se filtra por zona, solo incluir producciones con viajes en esa zona
        if (zona != null && !zona.isEmpty()) {
            producciones = producciones.stream().filter(p -> {
                // Buscar viajes de la decena y empresario en esa zona
                String nombreEmp = p.getEntrepreneur() != null ? p.getEntrepreneur().getNombre() : null;
                if (nombreEmp == null) return false;
                // Buscar viajes de ese empresario, decena y zona
                return tripRepository.findByTravelDateBetween(desde, hasta).stream()
                        .anyMatch(t -> nombreEmp.equalsIgnoreCase(t.getCompanyName()) && (zona.equalsIgnoreCase(t.getOrigin()) || zona.equalsIgnoreCase(t.getDestination())));
            }).toList();
        }
        // Agrupar por decena y estado
        Map<String, Map<String, Object>> resumen = new HashMap<>();
        for (var p : producciones) {
            String decena = p.getDecena();
            String estado = p.isValidado() ? "APROBADO" : "PENDIENTE";
            resumen.putIfAbsent(decena, new HashMap<>());
            Map<String, Object> decenaMap = resumen.get(decena);
            decenaMap.put(estado, (int) decenaMap.getOrDefault(estado, 0) + 1);
        }
        result.put("resumenPorDecena", resumen);
        result.put("totalPendientes", producciones.stream().filter(p -> !p.isValidado()).count());
        result.put("totalAprobadas", producciones.stream().filter(p -> p.isValidado()).count());
        return result;
    }

    @GetMapping("/auditoria-cambios")
    public Map<String, Object> getAuditoriaCambios(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String accion,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta
    ) {
        Map<String, Object> result = new HashMap<>();
        var logs = auditLogRepository.findAll().stream()
                .filter(l -> (userId == null || (l.getUser() != null && l.getUser().getId().equals(userId))))
                .filter(l -> (accion == null || accion.isEmpty() || (l.getAccion() != null && l.getAccion().equalsIgnoreCase(accion))))
                .filter(l -> l.getFecha() != null && !l.getFecha().toLocalDate().isBefore(desde) && !l.getFecha().toLocalDate().isAfter(hasta))
                .map(l -> Map.of(
                        "id", l.getId(),
                        "usuario", l.getUser() != null ? l.getUser().getNombre() : null,
                        "accion", l.getAccion(),
                        "fecha", l.getFecha(),
                        "detalle", l.getDetalle()
                ))
                .toList();
        result.put("auditoria", logs);
        return result;
    }
} 