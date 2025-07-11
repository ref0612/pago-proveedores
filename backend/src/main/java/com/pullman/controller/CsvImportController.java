package com.pullman.controller;

import com.pullman.service.CsvImportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/csv-import")
@CrossOrigin(origins = "*")
public class CsvImportController {

    private static final Logger logger = LoggerFactory.getLogger(CsvImportController.class);

    @Autowired
    private CsvImportService csvImportService;

    // Importar viajes desde CSV
    @PostMapping("/import-trips")
    public ResponseEntity<Map<String, Object>> importTripsFromCsv(@RequestParam("file") MultipartFile file) {
        logger.info("Recibida petición de importación CSV. Archivo: {}, Tamaño: {} bytes", 
                   file.getOriginalFilename(), file.getSize());
        try {
            Map<String, Object> result = csvImportService.importTripsAndUnconfiguredCities(file);
            logger.info("Importación exitosa. {} viajes importados", ((java.util.List<?>)result.get("importedTrips")).size());
            return ResponseEntity.ok(result);
        } catch (IOException e) {
            logger.error("Error durante la importación CSV", e);
            return ResponseEntity.badRequest().build();
        }
    }

    // Obtener estadísticas de importación CSV
    @PostMapping("/stats")
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

    // Importar viajes y generar producciones
    @PostMapping("/import-and-generate")
    public ResponseEntity<Map<String, Object>> importTripsAndGenerateProductions(@RequestParam("file") MultipartFile file) {
        logger.info("Recibida petición de importación y generación de producciones. Archivo: {}, Tamaño: {} bytes", 
                   file.getOriginalFilename(), file.getSize());
        try {
            java.util.List<com.pullman.domain.Trip> importedTrips = csvImportService.importTripsFromCsv(file);
            logger.info("Importación y generación exitosa. {} viajes importados", importedTrips.size());
            
            Map<String, Object> result = new java.util.HashMap<>();
            result.put("importedTrips", importedTrips);
            result.put("message", "Importación y generación de producciones completada exitosamente");
            result.put("totalImported", importedTrips.size());
            
            return ResponseEntity.ok(result);
        } catch (IOException e) {
            logger.error("Error durante la importación y generación", e);
            return ResponseEntity.badRequest().build();
        }
    }
} 