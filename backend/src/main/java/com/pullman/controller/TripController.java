package com.pullman.controller;

import com.pullman.domain.Trip;
import com.pullman.service.TripService;
import com.pullman.service.CsvImportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.io.IOException;

@RestController
@RequestMapping("/api/trips")
@CrossOrigin(origins = "*")
public class TripController {
    @Autowired
    private TripService tripService;
    
    @Autowired
    private CsvImportService csvImportService;

    @GetMapping
    public List<Trip> getAll() {
        return tripService.findAll();
    }

    @GetMapping("/paged")
    public Page<Trip> getAllPaged(@PageableDefault(size = 20) Pageable pageable) {
        return tripService.findAll(pageable);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Trip> getById(@PathVariable Long id) {
        return tripService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/paginated")
    public Page<Trip> getAllPaginated(@PageableDefault(size = 1000) Pageable pageable) {
        return tripService.findAll(pageable);
    }

    @PostMapping
    public Trip create(@RequestBody Trip trip) {
        return tripService.save(trip);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Trip> update(@PathVariable Long id, @RequestBody Trip trip) {
        return tripService.findById(id)
                .map(existing -> {
                    trip.setId(id);
                    return ResponseEntity.ok(tripService.save(trip));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (tripService.findById(id).isPresent()) {
            tripService.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // Endpoints optimizados para búsquedas específicas
    @GetMapping("/by-date")
    public List<Trip> getByTravelDate(@RequestParam LocalDate travelDate) {
        return tripService.findByTravelDate(travelDate);
    }

    @GetMapping("/by-date-range")
    public List<Trip> getByTravelDateRange(@RequestParam LocalDate startDate, @RequestParam LocalDate endDate) {
        return tripService.findByTravelDateBetween(startDate, endDate);
    }

    @GetMapping("/by-company")
    public List<Trip> getByCompanyName(@RequestParam String companyName) {
        return tripService.findByCompanyName(companyName);
    }

    @GetMapping("/by-company-date-range")
    public List<Trip> getByCompanyAndDateRange(@RequestParam String companyName, 
                                              @RequestParam LocalDate startDate, 
                                              @RequestParam LocalDate endDate) {
        return tripService.findByCompanyNameAndTravelDateBetween(companyName, startDate, endDate);
    }

    @GetMapping("/revenue-stats")
    public List<Object[]> getRevenueStats(@RequestParam LocalDate startDate, @RequestParam LocalDate endDate) {
        return tripService.getRevenueByCompanyBetweenDates(startDate, endDate);
    }

    @GetMapping("/trip-count-stats")
    public List<Object[]> getTripCountStats(@RequestParam LocalDate startDate, @RequestParam LocalDate endDate) {
        return tripService.getTripCountByCompany(startDate, endDate);
    }

    @GetMapping("/with-manual-income")
    public List<Trip> getTripsWithManualIncome(@RequestParam LocalDate startDate, @RequestParam LocalDate endDate) {
        return tripService.findTripsWithManualIncome(startDate, endDate);
    }

    @GetMapping("/total-revenue")
    public ResponseEntity<Double> getTotalRevenueByDate(@RequestParam LocalDate date) {
        Double revenue = tripService.getTotalRevenueByDate(date);
        return ResponseEntity.ok(revenue != null ? revenue : 0.0);
    }

    @GetMapping("/by-origin")
    public List<Trip> getByOrigin(@RequestParam String origin) {
        return tripService.findByOrigin(origin);
    }

    @GetMapping("/by-destination")
    public List<Trip> getByDestination(@RequestParam String destination) {
        return tripService.findByDestination(destination);
    }

    @GetMapping("/by-route")
    public List<Trip> getByOriginAndDestination(@RequestParam String origin, @RequestParam String destination) {
        return tripService.findByOriginAndDestination(origin, destination);
    }

    @GetMapping("/by-driver")
    public List<Trip> getByDriverName(@RequestParam String driverName) {
        return tripService.findByDriverName(driverName);
    }

    @GetMapping("/by-status")
    public List<Trip> getByStatus(@RequestParam String status) {
        return tripService.findByStatus(status);
    }

    @GetMapping("/by-license-plate")
    public List<Trip> getByLicensePlate(@RequestParam String licensePlate) {
        return tripService.findByLicensePlate(licensePlate);
    }

    @GetMapping("/by-service-code")
    public List<Trip> getByServiceCode(@RequestParam String serviceCode) {
        return tripService.findByServiceCode(serviceCode);
    }
    
    // Endpoint para obtener estadísticas de importación CSV
    @PostMapping("/import-csv/stats")
    public ResponseEntity<Map<String, Object>> getImportStats(@RequestParam("file") MultipartFile file) {
        try {
            Map<String, Object> stats = csvImportService.getImportStatistics(file);
            return ResponseEntity.ok(stats);
        } catch (IOException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Endpoint para importar viajes desde CSV
    @PostMapping("/import-csv")
    public ResponseEntity<Map<String, Object>> importTripsFromCsv(@RequestParam("file") MultipartFile file) {
        try {
            Map<String, Object> result = csvImportService.importTripsAndUnconfiguredCities(file);
            return ResponseEntity.ok(result);
        } catch (IOException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Endpoint para limpiar la base de datos
    @DeleteMapping("/clear-database")
    public ResponseEntity<Map<String, Object>> clearDatabase() {
        try {
            long tripsDeleted = tripService.deleteAll();
            long productionsDeleted = 0; // Aquí deberías agregar el servicio de producciones si es necesario
            
            Map<String, Object> response = new java.util.HashMap<>();
            response.put("message", "Base de datos limpiada exitosamente");
            response.put("tripsDeleted", tripsDeleted);
            response.put("productionsDeleted", productionsDeleted);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new java.util.HashMap<>();
            errorResponse.put("error", "Error al limpiar la base de datos: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
} 