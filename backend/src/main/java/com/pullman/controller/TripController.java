package com.pullman.controller;

import com.pullman.domain.Trip;
import com.pullman.repository.TripRepository;
import com.pullman.service.CsvImportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/trips")
@CrossOrigin(origins = "*")
public class TripController {

    private static final Logger logger = LoggerFactory.getLogger(TripController.class);

    @Autowired
    private TripRepository tripRepository;
    
    @Autowired
    private CsvImportService csvImportService;

    // Obtener todos los viajes
    @GetMapping
    public List<Trip> getAllTrips() {
        return tripRepository.findAll();
    }

    // Obtener un viaje por ID
    @GetMapping("/{id}")
    public ResponseEntity<Trip> getTripById(@PathVariable Long id) {
        Optional<Trip> trip = tripRepository.findById(id);
        return trip.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Crear un nuevo viaje
    @PostMapping
    public Trip createTrip(@RequestBody Trip trip) {
        return tripRepository.save(trip);
    }

    // Importar viajes desde CSV
    @PostMapping("/import-csv")
    public ResponseEntity<List<Trip>> importTripsFromCsv(@RequestParam("file") MultipartFile file) {
        logger.info("Recibida petición de importación CSV. Archivo: {}, Tamaño: {} bytes", 
                   file.getOriginalFilename(), file.getSize());
        
        try {
            List<Trip> importedTrips = csvImportService.importTripsFromCsv(file);
            logger.info("Importación exitosa. {} viajes importados", importedTrips.size());
            return ResponseEntity.ok(importedTrips);
        } catch (IOException e) {
            logger.error("Error durante la importación CSV", e);
            return ResponseEntity.badRequest().build();
        }
    }

    // Obtener estadísticas de importación CSV
    @PostMapping("/import-csv/stats")
    public ResponseEntity<Map<String, Object>> getImportStats(@RequestParam("file") MultipartFile file) {
        logger.info("Recibida petición de estadísticas CSV. Archivo: {}, Tamaño: {} bytes", 
                   file.getOriginalFilename(), file.getSize());
        
        try {
            Map<String, Object> stats = csvImportService.getImportStatistics(file);
            logger.info("Estadísticas generadas: {}", stats);
            return ResponseEntity.ok(stats);
        } catch (IOException e) {
            logger.error("Error al generar estadísticas CSV", e);
            return ResponseEntity.badRequest().build();
        }
    }

    // Actualizar un viaje
    @PutMapping("/{id}")
    public ResponseEntity<Trip> updateTrip(@PathVariable Long id, @RequestBody Trip tripDetails) {
        Optional<Trip> trip = tripRepository.findById(id);
        if (trip.isPresent()) {
            Trip updatedTrip = trip.get();
            // Actualizar todos los campos
            updatedTrip.setTravelDate(tripDetails.getTravelDate());
            updatedTrip.setDepartureTime(tripDetails.getDepartureTime());
            updatedTrip.setOrigin(tripDetails.getOrigin());
            updatedTrip.setDestination(tripDetails.getDestination());
            updatedTrip.setRouteName(tripDetails.getRouteName());
            updatedTrip.setServiceCode(tripDetails.getServiceCode());
            updatedTrip.setServiceType(tripDetails.getServiceType());
            updatedTrip.setStatus(tripDetails.getStatus());
            updatedTrip.setBusNumber(tripDetails.getBusNumber());
            updatedTrip.setLicensePlate(tripDetails.getLicensePlate());
            updatedTrip.setVehicleYear(tripDetails.getVehicleYear());
            updatedTrip.setTotalSeats(tripDetails.getTotalSeats());
            updatedTrip.setInitialScore(tripDetails.getInitialScore());
            updatedTrip.setAdditionalScore(tripDetails.getAdditionalScore());
            updatedTrip.setTotalScore(tripDetails.getTotalScore());
            updatedTrip.setCompensation(tripDetails.getCompensation());
            updatedTrip.setTotalCompensated(tripDetails.getTotalCompensated());
            updatedTrip.setCompanyRut(tripDetails.getCompanyRut());
            updatedTrip.setCompanyName(tripDetails.getCompanyName());
            updatedTrip.setDriverName(tripDetails.getDriverName());
            updatedTrip.setBranchSeats(tripDetails.getBranchSeats());
            updatedTrip.setBranchRevenue(tripDetails.getBranchRevenue());
            updatedTrip.setRoadSeats(tripDetails.getRoadSeats());
            updatedTrip.setRoadRevenue(tripDetails.getRoadRevenue());
            updatedTrip.setManualIncome(tripDetails.getManualIncome());
            
            return ResponseEntity.ok(tripRepository.save(updatedTrip));
        }
        return ResponseEntity.notFound().build();
    }

    // Eliminar un viaje
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTrip(@PathVariable Long id) {
        Optional<Trip> trip = tripRepository.findById(id);
        if (trip.isPresent()) {
            tripRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    // Buscar viajes por fecha
    @GetMapping("/date/{date}")
    public List<Trip> getTripsByDate(@PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return tripRepository.findByTravelDate(date);
    }

    // Buscar viajes por rango de fechas
    @GetMapping("/date-range")
    public List<Trip> getTripsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return tripRepository.findByTravelDateBetween(startDate, endDate);
    }

    // Buscar viajes por origen
    @GetMapping("/origin/{origin}")
    public List<Trip> getTripsByOrigin(@PathVariable String origin) {
        return tripRepository.findByOrigin(origin);
    }

    // Buscar viajes por destino
    @GetMapping("/destination/{destination}")
    public List<Trip> getTripsByDestination(@PathVariable String destination) {
        return tripRepository.findByDestination(destination);
    }

    // Buscar viajes por origen y destino
    @GetMapping("/route")
    public List<Trip> getTripsByOriginAndDestination(
            @RequestParam String origin,
            @RequestParam String destination) {
        return tripRepository.findByOriginAndDestination(origin, destination);
    }

    // Buscar viajes por empresa
    @GetMapping("/company/{companyName}")
    public List<Trip> getTripsByCompany(@PathVariable String companyName) {
        return tripRepository.findByCompanyName(companyName);
    }

    // Buscar viajes por conductor
    @GetMapping("/driver/{driverName}")
    public List<Trip> getTripsByDriver(@PathVariable String driverName) {
        return tripRepository.findByDriverName(driverName);
    }

    // Buscar viajes por estado
    @GetMapping("/status/{status}")
    public List<Trip> getTripsByStatus(@PathVariable String status) {
        return tripRepository.findByStatus(status);
    }

    // Buscar viajes por patente
    @GetMapping("/license/{licensePlate}")
    public List<Trip> getTripsByLicensePlate(@PathVariable String licensePlate) {
        return tripRepository.findByLicensePlate(licensePlate);
    }

    // Buscar viajes por código de servicio
    @GetMapping("/service/{serviceCode}")
    public List<Trip> getTripsByServiceCode(@PathVariable String serviceCode) {
        return tripRepository.findByServiceCode(serviceCode);
    }

    // Obtener ingresos totales por fecha
    @GetMapping("/revenue/date/{date}")
    public ResponseEntity<Double> getTotalRevenueByDate(@PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        Double revenue = tripRepository.getTotalRevenueByDate(date);
        return ResponseEntity.ok(revenue != null ? revenue : 0.0);
    }

    // Obtener estadísticas por empresa
    @GetMapping("/revenue/company/{date}")
    public List<Object[]> getRevenueByCompany(@PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return tripRepository.getRevenueByCompany(date);
    }

    // Obtener estadísticas por ruta
    @GetMapping("/revenue/route/{date}")
    public List<Object[]> getRevenueByRoute(@PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return tripRepository.getRevenueByRoute(date);
    }
} 