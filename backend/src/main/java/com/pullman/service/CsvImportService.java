package com.pullman.service;

import com.pullman.domain.Trip;
import com.pullman.repository.TripRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class CsvImportService {

    @Autowired
    private TripRepository tripRepository;

    public List<Trip> importTripsFromCsv(MultipartFile file) throws IOException {
        List<Trip> trips = new ArrayList<>();
        
        try (BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            boolean isFirstLine = true;
            Map<String, Integer> columnMapping = new HashMap<>();
            
            while ((line = br.readLine()) != null) {
                if (isFirstLine) {
                    columnMapping = createColumnMapping(line);
                    isFirstLine = false;
                    continue;
                }
                
                Trip trip = parseCsvLine(line, columnMapping);
                if (trip != null) {
                    trips.add(trip);
                }
            }
        }
        
        // Guardar todos los viajes en la base de datos
        return tripRepository.saveAll(trips);
    }

    private Map<String, Integer> createColumnMapping(String headerLine) {
        Map<String, Integer> mapping = new HashMap<>();
        String[] headers = parseCsvFields(headerLine);
        
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

    private Trip parseCsvLine(String line, Map<String, Integer> columnMapping) {
        try {
            String[] fields = parseCsvFields(line);
            
            if (fields.length < 10) {
                System.err.println("Línea incompleta: " + line);
                return null;
            }
            
            Trip trip = new Trip();
            
            // Fecha de Viaje
            Integer dateIndex = columnMapping.get("travel_date");
            if (dateIndex != null && dateIndex < fields.length && !fields[dateIndex].trim().isEmpty()) {
                try {
                    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
                    trip.setTravelDate(LocalDate.parse(fields[dateIndex].trim(), formatter));
                } catch (Exception e) {
                    System.err.println("Error parsing date: " + fields[dateIndex]);
                }
            }
            
            // Hora de salida
            Integer timeIndex = columnMapping.get("departure_time");
            if (timeIndex != null && timeIndex < fields.length && !fields[timeIndex].trim().isEmpty()) {
                try {
                    trip.setDepartureTime(parseTime(fields[timeIndex].trim()));
                } catch (Exception e) {
                    System.err.println("Error parsing time: " + fields[timeIndex]);
                }
            }
            
            // Origen
            Integer originIndex = columnMapping.get("origin");
            if (originIndex != null && originIndex < fields.length) {
                trip.setOrigin(fields[originIndex].trim());
            }
            
            // Destino
            Integer destIndex = columnMapping.get("destination");
            if (destIndex != null && destIndex < fields.length) {
                trip.setDestination(fields[destIndex].trim());
            }
            
            // Ruta
            Integer routeIndex = columnMapping.get("route_name");
            if (routeIndex != null && routeIndex < fields.length) {
                trip.setRouteName(fields[routeIndex].trim());
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
            
            // Número de Bus
            Integer busIndex = columnMapping.get("bus_number");
            if (busIndex != null && busIndex < fields.length) {
                trip.setBusNumber(fields[busIndex].trim());
            }
            
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
                    System.err.println("Error parsing vehicle year: " + fields[yearIndex]);
                }
            }
            
            // Total de asientos
            Integer seatsIndex = columnMapping.get("total_seats");
            if (seatsIndex != null && seatsIndex < fields.length && !fields[seatsIndex].trim().isEmpty()) {
                try {
                    trip.setTotalSeats(Integer.parseInt(fields[seatsIndex].trim()));
                } catch (Exception e) {
                    System.err.println("Error parsing total seats: " + fields[seatsIndex]);
                }
            }
            
            // Puntaje inicial
            Integer initialScoreIndex = columnMapping.get("initial_score");
            if (initialScoreIndex != null && initialScoreIndex < fields.length && !fields[initialScoreIndex].trim().isEmpty()) {
                try {
                    trip.setInitialScore(parseBigDecimal(fields[initialScoreIndex].trim()));
                } catch (Exception e) {
                    System.err.println("Error parsing initial score: " + fields[initialScoreIndex]);
                }
            }
            
            // Puntaje adicional
            Integer additionalScoreIndex = columnMapping.get("additional_score");
            if (additionalScoreIndex != null && additionalScoreIndex < fields.length && !fields[additionalScoreIndex].trim().isEmpty()) {
                try {
                    trip.setAdditionalScore(parseBigDecimal(fields[additionalScoreIndex].trim()));
                } catch (Exception e) {
                    System.err.println("Error parsing additional score: " + fields[additionalScoreIndex]);
                }
            }
            
            // Puntaje total
            Integer totalScoreIndex = columnMapping.get("total_score");
            if (totalScoreIndex != null && totalScoreIndex < fields.length && !fields[totalScoreIndex].trim().isEmpty()) {
                try {
                    trip.setTotalScore(parseBigDecimal(fields[totalScoreIndex].trim()));
                } catch (Exception e) {
                    System.err.println("Error parsing total score: " + fields[totalScoreIndex]);
                }
            }
            
            // Compensación
            Integer compensationIndex = columnMapping.get("compensation");
            if (compensationIndex != null && compensationIndex < fields.length && !fields[compensationIndex].trim().isEmpty()) {
                try {
                    trip.setCompensation(parseBigDecimal(fields[compensationIndex].trim()));
                } catch (Exception e) {
                    System.err.println("Error parsing compensation: " + fields[compensationIndex]);
                }
            }
            
            // Total compensado
            Integer totalCompensatedIndex = columnMapping.get("total_compensated");
            if (totalCompensatedIndex != null && totalCompensatedIndex < fields.length && !fields[totalCompensatedIndex].trim().isEmpty()) {
                try {
                    trip.setTotalCompensated(parseBigDecimal(fields[totalCompensatedIndex].trim()));
                } catch (Exception e) {
                    System.err.println("Error parsing total compensated: " + fields[totalCompensatedIndex]);
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
                trip.setCompanyName(fields[companyIndex].trim());
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
                    System.err.println("Error parsing branch seats: " + fields[branchSeatsIndex]);
                }
            }
            
            // Recaudación sucursal
            Integer branchRevenueIndex = columnMapping.get("branch_revenue");
            if (branchRevenueIndex != null && branchRevenueIndex < fields.length && !fields[branchRevenueIndex].trim().isEmpty()) {
                try {
                    trip.setBranchRevenue(parseCurrency(fields[branchRevenueIndex].trim()));
                } catch (Exception e) {
                    System.err.println("Error parsing branch revenue: " + fields[branchRevenueIndex]);
                }
            }
            
            // Asientos camino
            Integer roadSeatsIndex = columnMapping.get("road_seats");
            if (roadSeatsIndex != null && roadSeatsIndex < fields.length && !fields[roadSeatsIndex].trim().isEmpty()) {
                try {
                    trip.setRoadSeats(Integer.parseInt(fields[roadSeatsIndex].trim()));
                } catch (Exception e) {
                    System.err.println("Error parsing road seats: " + fields[roadSeatsIndex]);
                }
            }
            
            // Recaudación camino
            Integer roadRevenueIndex = columnMapping.get("road_revenue");
            if (roadRevenueIndex != null && roadRevenueIndex < fields.length && !fields[roadRevenueIndex].trim().isEmpty()) {
                try {
                    trip.setRoadRevenue(parseCurrency(fields[roadRevenueIndex].trim()));
                } catch (Exception e) {
                    System.err.println("Error parsing road revenue: " + fields[roadRevenueIndex]);
                }
            }
            
            // Ingresos manuales
            Integer manualIndex = columnMapping.get("manual_income");
            if (manualIndex != null && manualIndex < fields.length) {
                trip.setManualIncome(fields[manualIndex].trim());
            }
            
            return trip;
            
        } catch (Exception e) {
            System.err.println("Error parsing line: " + line + " - " + e.getMessage());
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
        
        fields.add(currentField.toString());
        return fields.toArray(new String[0]);
    }

    private LocalTime parseTime(String timeStr) {
        try {
            // Formato esperado: "04:45 AM" o "16:30 PM"
            String[] parts = timeStr.split(" ");
            String time = parts[0];
            String ampm = parts[1];
            
            String[] timeParts = time.split(":");
            int hour = Integer.parseInt(timeParts[0]);
            int minute = Integer.parseInt(timeParts[1]);
            
            if (ampm.equalsIgnoreCase("PM") && hour != 12) {
                hour += 12;
            } else if (ampm.equalsIgnoreCase("AM") && hour == 12) {
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
} 