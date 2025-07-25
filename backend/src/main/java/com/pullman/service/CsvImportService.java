package com.pullman.service;

import com.pullman.domain.Trip;
import com.pullman.repository.TripRepository;
import com.pullman.repository.ZoneRepository;
import com.pullman.repository.RouteRepository;
import com.pullman.repository.EntrepreneurRepository;
import com.pullman.service.ProductionService;
import com.pullman.domain.Route;
import com.pullman.domain.Zone;
import com.pullman.domain.Entrepreneur;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import com.pullman.util.NormalizeUtil;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class CsvImportService {

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private ZoneRepository zoneRepository;

    @Autowired
    private RouteRepository routeRepository;
    @Autowired
    private EntrepreneurRepository entrepreneurRepository;
    @Autowired
    private ProductionService productionService;

    private static final int BATCH_SIZE = 1000; // Procesar en lotes de 1000 registros
    private static final int PROGRESS_UPDATE_INTERVAL = 5000; // Actualizar progreso cada 5000 registros

    public List<Trip> importTripsFromCsv(MultipartFile file) throws IOException {
        List<Trip> allTrips = new ArrayList<>();
        List<Trip> batchTrips = new ArrayList<>();
        int totalProcessed = 0;
        int totalSaved = 0;
        int totalSkipped = 0;
        int totalErrors = 0;
        Set<String> decenasImportadas = new HashSet<>();
        
        System.out.println("=== INICIANDO IMPORTACIÓN DE CSV ===");
        System.out.println("Archivo: " + file.getOriginalFilename());
        System.out.println("Tamaño: " + file.getSize() + " bytes");
        
        try (BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            boolean isFirstLine = true;
            Map<String, Integer> columnMapping = new HashMap<>();
            int lineNumber = 0;
            
            while ((line = br.readLine()) != null) {
                lineNumber++;
                
                // Saltar líneas vacías
                if (line.trim().isEmpty()) {
                    System.out.println("Línea " + lineNumber + ": Línea vacía, saltando...");
                    continue;
                }
                
                if (isFirstLine) {
                    System.out.println("Línea " + lineNumber + ": Procesando encabezados...");
                    columnMapping = createColumnMapping(line);
                    System.out.println("Mapeo de columnas: " + columnMapping);
                    isFirstLine = false;
                    continue;
                }
                
                try {
                    Trip trip = parseCsvLine(line, columnMapping, lineNumber);
                    if (trip != null) {
                        // Validación de unicidad mejorada
                        Trip existing = findExistingTrip(trip);
                        if (existing != null) {
                            // Actualizar viaje existente
                            updateExistingTrip(existing, trip);
                            batchTrips.add(existing);
                            if (lineNumber % 100 == 0) {
                                System.out.println("Línea " + lineNumber + ": Viaje existente actualizado");
                            }
                        } else {
                            // Nuevo viaje
                            batchTrips.add(trip);
                            if (lineNumber % 100 == 0) {
                                System.out.println("Línea " + lineNumber + ": Nuevo viaje agregado");
                            }
                        }
                        
                        // Calcular decena del viaje
                        if (trip.getTravelDate() != null) {
                            String decena = calcularDecena(trip.getTravelDate());
                            decenasImportadas.add(decena);
                        }
                        
                        totalProcessed++;
                    } else {
                        totalSkipped++;
                        if (lineNumber % 100 == 0) {
                            System.out.println("Línea " + lineNumber + ": Línea omitida (datos inválidos)");
                        }
                    }
                } catch (Exception e) {
                    totalErrors++;
                    System.err.println("Línea " + lineNumber + ": Error procesando línea - " + e.getMessage());
                    System.err.println("Contenido de la línea: " + line);
                }
                
                // Procesar lote cuando alcance el tamaño
                if (batchTrips.size() >= BATCH_SIZE) {
                    List<Trip> savedBatch = tripRepository.saveAll(batchTrips);
                    allTrips.addAll(savedBatch);
                    totalSaved += savedBatch.size();
                    batchTrips.clear();
                    System.out.println("Lote procesado: " + totalProcessed + " procesados, " + totalSaved + " guardados");
                }
            }
            
            // Procesar lote final
            if (!batchTrips.isEmpty()) {
                List<Trip> savedBatch = tripRepository.saveAll(batchTrips);
                allTrips.addAll(savedBatch);
                totalSaved += savedBatch.size();
                System.out.println("Lote final procesado: " + savedBatch.size() + " registros");
            }
        }
        
        // Generar producciones solo para las decenas importadas
        System.out.println("Generando producciones para decenas: " + decenasImportadas);
        List<Route> routes = routeRepository.findAll();
        List<Zone> zones = zoneRepository.findAll();
        List<Entrepreneur> entrepreneurs = entrepreneurRepository.findAll();
        
        for (String decena : decenasImportadas) {
            // Calcular rango de fechas de la decena para consulta optimizada
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
                diaFin = java.time.YearMonth.of(anio, mes).lengthOfMonth();
            }
            LocalDate desde = LocalDate.of(anio, mes, diaInicio);
            LocalDate hasta = LocalDate.of(anio, mes, diaFin);
            
            // Obtener viajes optimizados por rango de fechas
            List<Trip> tripsDecena = tripRepository.findByTravelDateBetween(desde, hasta);
            int count = productionService.generateProductionsForDecena(decena);
            System.out.println("Producciones generadas para decena " + decena + ": " + count);
        }
        
        System.out.println("=== RESUMEN DE IMPORTACIÓN ===");
        System.out.println("Total líneas procesadas: " + totalProcessed);
        System.out.println("Total guardados: " + totalSaved);
        System.out.println("Total omitidos: " + totalSkipped);
        System.out.println("Total errores: " + totalErrors);
        System.out.println("Total líneas leídas (incluyendo header): " + (totalProcessed + totalSkipped + totalErrors + 1));
        System.out.println("Diferencia (procesados - guardados): " + (totalProcessed - totalSaved));
        System.out.println("Decenas procesadas: " + decenasImportadas);
        
        // Análisis detallado de la diferencia
        if (totalProcessed != totalSaved) {
            System.out.println("⚠️ ADVERTENCIA: Hay diferencia entre procesados y guardados!");
            System.out.println("Posibles causas:");
            System.out.println("- Viajes duplicados que se actualizaron en lugar de crear nuevos");
            System.out.println("- Errores en el guardado por lotes");
            System.out.println("- Problemas de validación en la base de datos");
        }
        
        return allTrips;
    }

    private Trip findExistingTrip(Trip trip) {
        // Buscar por criterios más específicos para evitar duplicados
        if (trip.getTravelDate() != null && trip.getDepartureTime() != null && 
            trip.getOrigin() != null && trip.getDestination() != null && trip.getBusNumber() != null) {
            // Normalizar los campos clave antes de buscar duplicados
            String originNorm = NormalizeUtil.normalize(trip.getOrigin());
            String destNorm = NormalizeUtil.normalize(trip.getDestination());
            String busNorm = NormalizeUtil.normalize(trip.getBusNumber());
            // Usar la consulta optimizada para verificar existencia
            boolean exists = tripRepository.existsByUniqueCriteria(
                trip.getTravelDate(),
                trip.getDepartureTime(),
                originNorm,
                destNorm,
                busNorm
            );
            if (exists) {
                return tripRepository.findByTravelDateAndDepartureTimeAndOriginAndDestinationAndBusNumber(
                    trip.getTravelDate(),
                    trip.getDepartureTime(),
                    originNorm,
                    destNorm,
                    busNorm
                );
            }
        }
        return null;
    }

    private void updateExistingTrip(Trip existing, Trip newData) {
        // Actualizar solo campos que pueden cambiar, manteniendo la integridad
        existing.setRouteName(newData.getRouteName());
        existing.setServiceCode(newData.getServiceCode());
        existing.setServiceType(newData.getServiceType());
        existing.setStatus(newData.getStatus());
        existing.setLicensePlate(newData.getLicensePlate());
        existing.setVehicleYear(newData.getVehicleYear());
        existing.setTotalSeats(newData.getTotalSeats());
        existing.setInitialScore(newData.getInitialScore());
        existing.setAdditionalScore(newData.getAdditionalScore());
        existing.setTotalScore(newData.getTotalScore());
        existing.setCompensation(newData.getCompensation());
        existing.setTotalCompensated(newData.getTotalCompensated());
        existing.setCompanyRut(newData.getCompanyRut());
        existing.setCompanyName(newData.getCompanyName());
        existing.setDriverName(newData.getDriverName());
        existing.setBranchSeats(newData.getBranchSeats());
        existing.setBranchRevenue(newData.getBranchRevenue());
        existing.setRoadSeats(newData.getRoadSeats());
        existing.setRoadRevenue(newData.getRoadRevenue());
        existing.setManualIncome(newData.getManualIncome());
    }

    public Map<String, Object> importTripsAndUnconfiguredCities(MultipartFile file) throws IOException {
        List<Trip> allTrips = new ArrayList<>();
        List<Trip> batchTrips = new ArrayList<>();
        Set<String> citiesInFile = new HashSet<>();
        int totalProcessed = 0;
        int totalSaved = 0;
        try (BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            boolean isFirstLine = true;
            Map<String, Integer> columnMapping = new HashMap<>();
            int lineNumber = 0;
            
            while ((line = br.readLine()) != null) {
                lineNumber++;
                
                if (line.trim().isEmpty()) {
                    continue;
                }
                
                if (isFirstLine) {
                    columnMapping = createColumnMapping(line);
                    isFirstLine = false;
                    continue;
                }
                
                Trip trip = parseCsvLine(line, columnMapping, lineNumber);
                if (trip != null) {
                    batchTrips.add(trip);
                    // Recolectar ciudades
                    if (trip.getOrigin() != null && !trip.getOrigin().isEmpty()) {
                        citiesInFile.add(trip.getOrigin().trim());
                    }
                    if (trip.getDestination() != null && !trip.getDestination().isEmpty()) {
                        citiesInFile.add(trip.getDestination().trim());
                    }
                    totalProcessed++;
                    if (batchTrips.size() >= BATCH_SIZE) {
                        List<Trip> savedBatch = tripRepository.saveAll(batchTrips);
                        allTrips.addAll(savedBatch);
                        totalSaved += savedBatch.size();
                        batchTrips.clear();
                    }
                }
            }
            if (!batchTrips.isEmpty()) {
                List<Trip> savedBatch = tripRepository.saveAll(batchTrips);
                allTrips.addAll(savedBatch);
                totalSaved += savedBatch.size();
            }
        }
        // Obtener nombres de zonas existentes
        List<String> zonas = zoneRepository.findAll().stream().map(z -> z.getNombre().trim()).toList();
        // Ciudades no configuradas
        List<String> unconfiguredCities = new ArrayList<>();
        for (String city : citiesInFile) {
            if (!zonas.contains(city)) {
                unconfiguredCities.add(city);
            }
        }
        Map<String, Object> result = new HashMap<>();
        result.put("importedTrips", allTrips);
        result.put("unconfiguredCities", unconfiguredCities);
        return result;
    }

    // Método para obtener estadísticas de importación
    public Map<String, Object> getImportStatistics(MultipartFile file) throws IOException {
        Map<String, Object> stats = new HashMap<>();
        int totalLines = 0;
        int validLines = 0;
        int invalidLines = 0;
        
        try (BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            boolean isFirstLine = true;
            Map<String, Integer> columnMapping = new HashMap<>();
            
            while ((line = br.readLine()) != null) {
                totalLines++;
                
                if (line.trim().isEmpty()) {
                    continue;
                }
                
                if (isFirstLine) {
                    columnMapping = createColumnMapping(line);
                    isFirstLine = false;
                    continue;
                }
                
                Trip trip = parseCsvLine(line, columnMapping, totalLines);
                if (trip != null) {
                    validLines++;
                } else {
                    invalidLines++;
                }
            }
        }
        
        stats.put("totalLines", totalLines);
        stats.put("validLines", validLines);
        stats.put("invalidLines", invalidLines);
        stats.put("validPercentage", totalLines > 0 ? (double) validLines / totalLines * 100 : 0);
        
        return stats;
    }

    private Map<String, Integer> createColumnMapping(String headerLine) {
        Map<String, Integer> mapping = new HashMap<>();
        String[] headers = parseCsvFields(headerLine);
        
        System.out.println("Headers encontrados: " + Arrays.toString(headers));
        
        for (int i = 0; i < headers.length; i++) {
            String header = headers[i].trim().toLowerCase();
            mapping.put(header, i);
            
            // Mapeos alternativos para mayor flexibilidad
            if (header.contains("fecha") || header.contains("date")) {
                mapping.put("travel_date", i);
            }
            if (header.contains("hora") || header.contains("time") || header.contains("salida")) {
                mapping.put("departure_time", i);
            }
            if (header.contains("origen")) {
                mapping.put("origin", i);
            }
            if (header.contains("destino")) {
                mapping.put("destination", i);
            }
            if (header.contains("ruta")) {
                mapping.put("route_name", i);
            }
            if (header.contains("servicio") || header.contains("service")) {
                mapping.put("service_code", i);
            }
            if (header.contains("tipo") || header.contains("type")) {
                mapping.put("service_type", i);
            }
            if (header.contains("estado") || header.contains("status")) {
                mapping.put("status", i);
            }
            if (header.contains("bus") || header.contains("número") || header.contains("numero")) {
                mapping.put("bus_number", i);
            }
            if (header.contains("patente") || header.contains("license") || header.contains("placa")) {
                mapping.put("license_plate", i);
            }
            if (header.contains("año") || header.contains("year")) {
                mapping.put("vehicle_year", i);
            }
            if (header.contains("asientos") && header.contains("total")) {
                mapping.put("total_seats", i);
            }
            if (header.contains("puntaje") && header.contains("inicial")) {
                mapping.put("initial_score", i);
            }
            if (header.contains("puntaje") && header.contains("adicional")) {
                mapping.put("additional_score", i);
            }
            if (header.contains("puntaje") && header.contains("total")) {
                mapping.put("total_score", i);
            }
            if (header.contains("compensación") || header.contains("compensacion")) {
                mapping.put("compensation", i);
            }
            if (header.contains("total") && header.contains("compensado")) {
                mapping.put("total_compensated", i);
            }
            if (header.contains("rut")) {
                mapping.put("company_rut", i);
            }
            if (header.contains("razón") || header.contains("razon") || header.contains("social")) {
                mapping.put("company_name", i);
            }
            if (header.contains("conductor") || header.contains("driver")) {
                mapping.put("driver_name", i);
            }
            if (header.contains("asientos") && header.contains("sucursal")) {
                mapping.put("branch_seats", i);
            }
            if (header.contains("recaudación") && header.contains("sucursal") || 
                header.contains("recaudacion") && header.contains("sucursal")) {
                mapping.put("branch_revenue", i);
            }
            if (header.contains("asientos") && header.contains("camino")) {
                mapping.put("road_seats", i);
            }
            if (header.contains("recaudación") && header.contains("camino") || 
                header.contains("recaudacion") && header.contains("camino")) {
                mapping.put("road_revenue", i);
            }
            if (header.contains("manual") || header.contains("ingresos")) {
                mapping.put("manual_income", i);
            }
        }
        
        return mapping;
    }

    private Trip parseCsvLine(String line, Map<String, Integer> columnMapping, int lineNumber) {
        try {
            String[] fields = parseCsvFields(line);
            
            // Validación más flexible de campos mínimos
            if (fields.length < 3) {
                System.err.println("Línea " + lineNumber + ": Muy pocos campos (" + fields.length + ") - " + line);
                return null;
            }
            
            // Debug: mostrar campos para líneas problemáticas
            if (lineNumber % 1000 == 0) {
                System.out.println("Línea " + lineNumber + ": Procesando - " + fields.length + " campos");
            }
            
            Trip trip = new Trip();
            
            // Fecha de Viaje
            Integer dateIndex = columnMapping.get("travel_date");
            if (dateIndex != null && dateIndex < fields.length && !fields[dateIndex].trim().isEmpty()) {
                try {
                    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
                    trip.setTravelDate(LocalDate.parse(fields[dateIndex].trim(), formatter));
                } catch (Exception e) {
                    System.err.println("Línea " + lineNumber + ": Error parsing date: " + fields[dateIndex] + " - " + e.getMessage());
                    // Intentar con formato alternativo
                    try {
                        DateTimeFormatter altFormatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
                        trip.setTravelDate(LocalDate.parse(fields[dateIndex].trim(), altFormatter));
                    } catch (Exception e2) {
                        System.err.println("Línea " + lineNumber + ": Error con formato alternativo también: " + fields[dateIndex]);
                        return null; // Fecha es obligatoria
                    }
                }
            } else {
                System.err.println("Línea " + lineNumber + ": Fecha de viaje no encontrada o vacía");
                return null;
            }
            
            // Hora de salida
            Integer timeIndex = columnMapping.get("departure_time");
            if (timeIndex != null && timeIndex < fields.length && !fields[timeIndex].trim().isEmpty()) {
                try {
                    trip.setDepartureTime(parseTime(fields[timeIndex].trim()));
                } catch (Exception e) {
                    System.err.println("Línea " + lineNumber + ": Error parsing time: " + fields[timeIndex] + " - " + e.getMessage());
                    // Intentar con hora por defecto
                    trip.setDepartureTime(LocalTime.of(0, 0));
                    System.out.println("Línea " + lineNumber + ": Usando hora por defecto (00:00)");
                }
            } else {
                // Si no hay hora, usar hora por defecto
                trip.setDepartureTime(LocalTime.of(0, 0));
                System.out.println("Línea " + lineNumber + ": Hora no encontrada, usando hora por defecto (00:00)");
            }
            

            // Origen, destino y bus_number normalizados

            // --- Corrección explícita de variantes corruptas antes de normalizar ---
            String fixCorruptCity(String s) {
                if (s == null) return null;
                s = s.replace("via±a del mar", "vina del mar")
                     .replace("viã±a del mar", "vina del mar")
                     .replace("viña del mar", "vina del mar")
                     .replace("vi├▒a del mar", "vina del mar")
                     .replace("viÃ±a del mar", "vina del mar")
                     .replace("conca³n", "concon")
                     .replace("conca│n", "concon")
                     .replace("concã³n", "concon")
                     .replace("conc├│n", "concon")
                     .replace("concón", "concon");
                return s;
            }

            Integer originIndex = columnMapping.get("origin");
            String originNorm = null;
            if (originIndex != null && originIndex < fields.length) {
                String rawOrigin = fixCorruptCity(fields[originIndex]);
                originNorm = NormalizeUtil.normalize(rawOrigin);
                trip.setOrigin(originNorm);
            }

            Integer destIndex = columnMapping.get("destination");
            String destNorm = null;
            if (destIndex != null && destIndex < fields.length) {
                String rawDest = fixCorruptCity(fields[destIndex]);
                destNorm = NormalizeUtil.normalize(rawDest);
                trip.setDestination(destNorm);
            }

            // Ruta normalizada
            Integer routeIndex = columnMapping.get("route_name");
            String routeNorm = null;
            if (routeIndex != null && routeIndex < fields.length) {
                routeNorm = NormalizeUtil.normalize(fields[routeIndex]);
                trip.setRouteName(routeNorm);
            }

            // Bus number normalizado
            Integer busIndex = columnMapping.get("bus_number");
            String busNorm = null;
            if (busIndex != null && busIndex < fields.length) {
                busNorm = NormalizeUtil.normalize(fields[busIndex]);
                trip.setBusNumber(busNorm);
            }

            // --- MATCH DE ZONA AUTOMÁTICO ---
            // Buscar la zona correspondiente usando origen/destino normalizados en las rutas existentes
            if (originNorm != null && destNorm != null) {
                // Buscar rutas existentes con origen/destino normalizados
                java.util.List<com.pullman.domain.Route> rutas = routeRepository.findAll();
                com.pullman.domain.Zone zonaMatch = null;
                for (com.pullman.domain.Route r : rutas) {
                    String rOrig = NormalizeUtil.normalize(r.getOrigen());
                    String rDest = NormalizeUtil.normalize(r.getDestino());
                    if (originNorm.equals(rOrig) && destNorm.equals(rDest) && r.getZona() != null) {
                        zonaMatch = r.getZona();
                        break;
                    }
                }
                if (zonaMatch != null) {
                    // Si se encuentra zona, guardar el nombre de la zona en el campo routeName (o crear campo si corresponde)
                    trip.setRouteName(zonaMatch.getNombre());
                }
            }
            
            // Servicio
            Integer serviceIndex = columnMapping.get("service_code");
            if (serviceIndex != null && serviceIndex < fields.length) {
                trip.setServiceCode(fields[serviceIndex].trim());
            }
            
            // Tipo de Servicio
            Integer typeIndex = columnMapping.get("service_type");
            if (typeIndex != null && typeIndex < fields.length) {
                trip.setServiceType(fields[typeIndex].trim());
            }
            
            // Estado
            Integer statusIndex = columnMapping.get("status");
            if (statusIndex != null && statusIndex < fields.length) {
                trip.setStatus(fields[statusIndex].trim());
            }
            
            // ...eliminado: ya se asigna busNumber normalizado arriba...
            
            // Patente
            Integer plateIndex = columnMapping.get("license_plate");
            if (plateIndex != null && plateIndex < fields.length) {
                trip.setLicensePlate(fields[plateIndex].trim());
            }
            
            // Año del vehículo
            Integer yearIndex = columnMapping.get("vehicle_year");
            if (yearIndex != null && yearIndex < fields.length && !fields[yearIndex].trim().isEmpty()) {
                try {
                    trip.setVehicleYear(Integer.parseInt(fields[yearIndex].trim()));
                } catch (Exception e) {
                    System.err.println("Línea " + lineNumber + ": Error parsing vehicle year: " + fields[yearIndex]);
                }
            }
            
            // Total de asientos
            Integer seatsIndex = columnMapping.get("total_seats");
            if (seatsIndex != null && seatsIndex < fields.length && !fields[seatsIndex].trim().isEmpty()) {
                try {
                    trip.setTotalSeats(Integer.parseInt(fields[seatsIndex].trim()));
                } catch (Exception e) {
                    System.err.println("Línea " + lineNumber + ": Error parsing total seats: " + fields[seatsIndex]);
                }
            }
            
            // Puntaje inicial
            Integer initialScoreIndex = columnMapping.get("initial_score");
            if (initialScoreIndex != null && initialScoreIndex < fields.length && !fields[initialScoreIndex].trim().isEmpty()) {
                try {
                    trip.setInitialScore(parseBigDecimal(fields[initialScoreIndex].trim()));
                } catch (Exception e) {
                    System.err.println("Línea " + lineNumber + ": Error parsing initial score: " + fields[initialScoreIndex]);
                }
            }
            
            // Puntaje adicional
            Integer additionalScoreIndex = columnMapping.get("additional_score");
            if (additionalScoreIndex != null && additionalScoreIndex < fields.length && !fields[additionalScoreIndex].trim().isEmpty()) {
                try {
                    trip.setAdditionalScore(parseBigDecimal(fields[additionalScoreIndex].trim()));
                } catch (Exception e) {
                    System.err.println("Línea " + lineNumber + ": Error parsing additional score: " + fields[additionalScoreIndex]);
                }
            }
            
            // Puntaje total
            Integer totalScoreIndex = columnMapping.get("total_score");
            if (totalScoreIndex != null && totalScoreIndex < fields.length && !fields[totalScoreIndex].trim().isEmpty()) {
                try {
                    trip.setTotalScore(parseBigDecimal(fields[totalScoreIndex].trim()));
                } catch (Exception e) {
                    System.err.println("Línea " + lineNumber + ": Error parsing total score: " + fields[totalScoreIndex]);
                }
            }
            
            // Compensación
            Integer compensationIndex = columnMapping.get("compensation");
            if (compensationIndex != null && compensationIndex < fields.length && !fields[compensationIndex].trim().isEmpty()) {
                try {
                    trip.setCompensation(parseBigDecimal(fields[compensationIndex].trim()));
                } catch (Exception e) {
                    System.err.println("Línea " + lineNumber + ": Error parsing compensation: " + fields[compensationIndex]);
                }
            }
            
            // Total compensado
            Integer totalCompensatedIndex = columnMapping.get("total_compensated");
            if (totalCompensatedIndex != null && totalCompensatedIndex < fields.length && !fields[totalCompensatedIndex].trim().isEmpty()) {
                try {
                    trip.setTotalCompensated(parseBigDecimal(fields[totalCompensatedIndex].trim()));
                } catch (Exception e) {
                    System.err.println("Línea " + lineNumber + ": Error parsing total compensated: " + fields[totalCompensatedIndex]);
                }
            }
            
            // RUT
            Integer rutIndex = columnMapping.get("company_rut");
            if (rutIndex != null && rutIndex < fields.length) {
                trip.setCompanyRut(fields[rutIndex].trim());
            }
            
            // Razón social
            Integer companyIndex = columnMapping.get("company_name");
            if (companyIndex != null && companyIndex < fields.length) {
                trip.setCompanyName(NormalizeUtil.normalize(fields[companyIndex]));
            }
            
            // Conductor
            Integer driverIndex = columnMapping.get("driver_name");
            if (driverIndex != null && driverIndex < fields.length) {
                trip.setDriverName(fields[driverIndex].trim());
            }
            
            // Asientos sucursal
            Integer branchSeatsIndex = columnMapping.get("branch_seats");
            if (branchSeatsIndex != null && branchSeatsIndex < fields.length && !fields[branchSeatsIndex].trim().isEmpty()) {
                try {
                    trip.setBranchSeats(Integer.parseInt(fields[branchSeatsIndex].trim()));
                } catch (Exception e) {
                    System.err.println("Línea " + lineNumber + ": Error parsing branch seats: " + fields[branchSeatsIndex]);
                }
            }
            
            // Recaudación sucursal
            Integer branchRevenueIndex = columnMapping.get("branch_revenue");
            if (branchRevenueIndex != null && branchRevenueIndex < fields.length && !fields[branchRevenueIndex].trim().isEmpty()) {
                try {
                    trip.setBranchRevenue(parseCurrency(fields[branchRevenueIndex].trim()));
                } catch (Exception e) {
                    System.err.println("Línea " + lineNumber + ": Error parsing branch revenue: " + fields[branchRevenueIndex]);
                }
            }
            
            // Asientos camino
            Integer roadSeatsIndex = columnMapping.get("road_seats");
            if (roadSeatsIndex != null && roadSeatsIndex < fields.length && !fields[roadSeatsIndex].trim().isEmpty()) {
                try {
                    trip.setRoadSeats(Integer.parseInt(fields[roadSeatsIndex].trim()));
                } catch (Exception e) {
                    System.err.println("Línea " + lineNumber + ": Error parsing road seats: " + fields[roadSeatsIndex]);
                }
            }
            
            // Recaudación camino
            Integer roadRevenueIndex = columnMapping.get("road_revenue");
            if (roadRevenueIndex != null && roadRevenueIndex < fields.length && !fields[roadRevenueIndex].trim().isEmpty()) {
                try {
                    trip.setRoadRevenue(parseCurrency(fields[roadRevenueIndex].trim()));
                } catch (Exception e) {
                    System.err.println("Línea " + lineNumber + ": Error parsing road revenue: " + fields[roadRevenueIndex]);
                }
            }
            
            // Ingresos manuales
            Integer manualIndex = columnMapping.get("manual_income");
            if (manualIndex != null && manualIndex < fields.length) {
                trip.setManualIncome(fields[manualIndex].trim());
            }
            
            return trip;
            
        } catch (Exception e) {
            System.err.println("Línea " + lineNumber + ": Error parsing line: " + line + " - " + e.getMessage());
            return null;
        }
    }

    private String[] parseCsvFields(String line) {
        List<String> fields = new ArrayList<>();
        StringBuilder currentField = new StringBuilder();
        boolean inQuotes = false;
        
        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            
            if (c == '"') {
                inQuotes = !inQuotes;
            } else if (c == ',' && !inQuotes) {
                fields.add(currentField.toString());
                currentField = new StringBuilder();
            } else {
                currentField.append(c);
            }
        }
        
        // Agregar el último campo
        fields.add(currentField.toString());
        return fields.toArray(new String[0]);
    }

    private LocalTime parseTime(String timeStr) {
        try {
            // Permitir formatos: "04:45 AM", "16:30 PM", "04:45", "16:30", "4:45 am", "16:30"
            String t = timeStr.trim().toUpperCase();
            t = t.replaceAll("[AP]M$", "").trim(); // Eliminar AM/PM si está pegado
            t = t.replaceAll("[AP]\\.M\\.$", "").trim(); // Eliminar A.M./P.M. si está pegado
            String[] parts = t.split(":");
            int hour = Integer.parseInt(parts[0].trim());
            int minute = Integer.parseInt(parts[1].replaceAll("[^0-9]", "").trim());
            if (timeStr.toUpperCase().contains("PM") && hour < 12) {
                hour += 12;
            } else if (timeStr.toUpperCase().contains("AM") && hour == 12) {
                hour = 0;
            }
            return LocalTime.of(hour, minute);
        } catch (Exception e) {
            return LocalTime.of(0, 0);
        }
    }

    private BigDecimal parseBigDecimal(String value) {
        try {
            // Remover comas y convertir a BigDecimal
            String cleanValue = value.replace(",", ".");
            return new BigDecimal(cleanValue);
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }

    private BigDecimal parseCurrency(String value) {
        try {
            // Remover símbolo de peso y comas, convertir a BigDecimal
            String cleanValue = value.replace("$", "").replace(".", "").replace(",", ".");
            return new BigDecimal(cleanValue);
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }

    private String calcularDecena(LocalDate fecha) {
        int mes = fecha.getMonthValue();
        int anio = fecha.getYear();
        int dia = fecha.getDayOfMonth();
        int decena = 1;
        if (dia > 20) decena = 3;
        else if (dia > 10) decena = 2;
        return decena + String.format("%02d", mes) + anio;
    }
} 