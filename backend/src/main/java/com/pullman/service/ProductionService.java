package com.pullman.service;

import com.pullman.domain.Production;
import com.pullman.domain.Trip;
import com.pullman.domain.Zone;
import com.pullman.domain.Route;
import com.pullman.domain.Entrepreneur;
import com.pullman.repository.ProductionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProductionService {
    @Autowired
    private ProductionRepository productionRepository;
    
    @Autowired
    private com.pullman.repository.EntrepreneurRepository entrepreneurRepository;

    public Page<Production> findAll(Pageable pageable) {
        return productionRepository.findAll(pageable);
    }

    public Optional<Production> findById(Long id) {
        return productionRepository.findById(id);
    }

    public Production save(Production production) {
        return productionRepository.save(production);
    }

    public void deleteById(Long id) {
        productionRepository.deleteById(id);
    }

    public void deleteAll() {
        productionRepository.deleteAll();
    }

    // Método optimizado para obtener todas las producciones (mantener compatibilidad)
    public List<Production> findAll() {
        return productionRepository.findAll();
    }

    // Método optimizado para buscar producciones por decena
    public List<Production> findByDecena(String decena) {
        return productionRepository.findByDecena(decena);
    }

    // Método optimizado para buscar producciones pendientes
    public List<Production> findPendientes() {
        return productionRepository.findPendientes();
    }

    // Método optimizado para buscar producciones por empresario y decena
    public Optional<Production> findByEntrepreneurAndDecena(Long entrepreneurId, String decena) {
        return productionRepository.findByEntrepreneurAndDecena(entrepreneurId, decena);
    }

    // Método optimizado para verificar si existe una producción
    public boolean existsByEntrepreneurAndDecena(Long entrepreneurId, String decena) {
        return productionRepository.existsByEntrepreneurAndDecena(entrepreneurId, decena);
    }

    // Método optimizado para buscar producciones por estado de validación
    public List<Production> findByValidado(boolean validado) {
        return productionRepository.findByValidado(validado);
    }

    // Método optimizado para obtener estadísticas de producciones
    public List<Object[]> getProductionStatsByDecena() {
        return productionRepository.getProductionStatsByDecena();
    }

    // Método optimizado para buscar producciones por empresario
    public List<Production> findByEntrepreneurId(Long entrepreneurId) {
        return productionRepository.findByEntrepreneurId(entrepreneurId);
    }

    // Método optimizado para generar producciones para una decena específica
    public int generateProductionsForDecena(String decena, List<Trip> trips, List<Route> routes, List<Zone> zones, List<Entrepreneur> entrepreneurs) {
        // Crear mapa de empresarios por nombre para acceso O(1)
        Map<String, Entrepreneur> entrepreneurMap = entrepreneurs.stream()
            .collect(Collectors.toMap(Entrepreneur::getNombre, e -> e, (existing, replacement) -> existing));
        
        // Crear mapa de rutas por origen-destino para acceso O(1)
        Map<String, Route> routeMap = routes.stream()
            .collect(Collectors.toMap(
                route -> route.getOrigen() + "->" + route.getDestino(),
                route -> route,
                (existing, replacement) -> existing
            ));
        
        // Agrupar viajes por empresario de manera más eficiente
        Map<String, List<Trip>> tripsByEntrepreneur = trips.stream()
            .filter(trip -> trip.getCompanyName() != null && !trip.getCompanyName().isEmpty())
            .collect(Collectors.groupingBy(Trip::getCompanyName));
        
        int generatedCount = 0;
        
        for (Map.Entry<String, List<Trip>> entry : tripsByEntrepreneur.entrySet()) {
            String entrepreneurName = entry.getKey();
            List<Trip> tripsForEntrepreneur = entry.getValue();
            
            // Calcular totales de manera más eficiente
            double totalIngresos = 0;
            double totalGanancia = 0;
            
            for (Trip trip : tripsForEntrepreneur) {
                double branchRevenue = trip.getBranchRevenue() != null ? trip.getBranchRevenue().doubleValue() : 0;
                double roadRevenue = trip.getRoadRevenue() != null ? trip.getRoadRevenue().doubleValue() : 0;
                double manualIncome = parseManualIncome(trip.getManualIncome());
                
                double tripTotal = branchRevenue + roadRevenue + manualIncome;
                totalIngresos += tripTotal;
                
                // Buscar zona de manera más eficiente
                Zone zone = findZoneForTripOptimized(trip, routeMap);
                if (zone != null) {
                    totalGanancia += tripTotal * (zone.getPorcentaje() / 100.0);
                }
            }
            
            // Obtener o crear empresario
            Entrepreneur entrepreneur = entrepreneurMap.get(entrepreneurName);
            if (entrepreneur == null) {
                entrepreneur = new Entrepreneur();
                entrepreneur.setNombre(entrepreneurName);
                entrepreneur = entrepreneurRepository.save(entrepreneur);
                entrepreneurMap.put(entrepreneurName, entrepreneur);
            }
            
            // Verificar si ya existe la producción de manera más eficiente
            if (!productionRepository.existsByEntrepreneurAndDecena(entrepreneur.getId(), decena) && totalGanancia > 0) {
                Production production = new Production();
                production.setDecena(decena);
                production.setTotal(totalGanancia);
                production.setValidado(false);
                production.setComentarios("");
                production.setEntrepreneur(entrepreneur);
                productionRepository.save(production);
                generatedCount++;
            }
        }
        
        return generatedCount;
    }

    // Método optimizado para encontrar zona de un viaje
    private Zone findZoneForTripOptimized(Trip trip, Map<String, Route> routeMap) {
        if (trip.getOrigin() == null || trip.getDestination() == null) {
            return null;
        }
        
        String routeKey = trip.getOrigin() + "->" + trip.getDestination();
        Route route = routeMap.get(routeKey);
        
        if (route == null) {
            // Intentar con dirección inversa
            routeKey = trip.getDestination() + "->" + trip.getOrigin();
            route = routeMap.get(routeKey);
        }
        
        return route != null ? route.getZona() : null;
    }

    // Método optimizado para parsear ingresos manuales
    private double parseManualIncome(String manualIncome) {
        if (manualIncome == null || manualIncome.isEmpty()) {
            return 0;
        }
        try {
            return Double.parseDouble(manualIncome.replaceAll("[^\\d.-]", ""));
        } catch (NumberFormatException e) {
            return 0;
        }
    }
} 