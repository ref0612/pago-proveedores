package com.pullman.service;

import com.pullman.domain.Production;
import com.pullman.domain.Trip;
import com.pullman.domain.Zone;
import com.pullman.domain.Route;
import com.pullman.domain.Entrepreneur;
import com.pullman.repository.ProductionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProductionService {
    @Autowired
    private ProductionRepository productionRepository;

    public List<Production> findAll() {
        return productionRepository.findAll();
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

    // Nueva lógica para generar producciones por decena
    public int generateProductionsForDecena(String decena, List<Trip> tripsInDecena, List<Route> routes, List<Zone> zones, List<Entrepreneur> entrepreneurs) {
        Map<String, Entrepreneur> entrepreneurMap = entrepreneurs.stream()
            .collect(Collectors.toMap(Entrepreneur::getNombre, e -> e));
        Map<String, List<Trip>> tripsByEntrepreneur = tripsInDecena.stream()
            .filter(trip -> trip.getCompanyName() != null && !trip.getCompanyName().isEmpty())
            .collect(Collectors.groupingBy(Trip::getCompanyName));
        int updatedOrCreatedCount = 0;
        for (Map.Entry<String, List<Trip>> entry : tripsByEntrepreneur.entrySet()) {
            String entrepreneurName = entry.getKey();
            List<Trip> trips = entry.getValue();
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
                Zone zone = findZoneForTrip(trip, routes);
                if (zone != null) {
                    totalGanancia += tripTotal * (zone.getPorcentaje() / 100.0);
                }
            }
            Entrepreneur entrepreneur = entrepreneurMap.get(entrepreneurName);
            if (entrepreneur == null) {
                entrepreneur = new Entrepreneur();
                entrepreneur.setNombre(entrepreneurName);
                entrepreneurMap.put(entrepreneurName, entrepreneur);
            }
            final Entrepreneur finalEntrepreneur = entrepreneur;
            // Eliminar solo producciones de la decena específica para este empresario
            List<Production> existingProductions = findAll().stream()
                .filter(p -> p.getEntrepreneur() != null &&
                             p.getEntrepreneur().getId().equals(finalEntrepreneur.getId()) &&
                             decena.equals(p.getDecena()))
                .toList();
            for (Production prod : existingProductions) {
                deleteById(prod.getId());
            }
            if (totalGanancia > 0) {
                Production production = new Production();
                production.setDecena(decena);
                production.setTotal(totalGanancia);
                production.setValidado(false);
                production.setComentarios("");
                production.setEntrepreneur(entrepreneur);
                save(production);
                updatedOrCreatedCount++;
            }
        }
        return updatedOrCreatedCount;
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
        return java.text.Normalizer.normalize(str.toLowerCase(), java.text.Normalizer.Form.NFD)
            .replaceAll("[\\p{InCombiningDiacriticalMarks}]", "")
            .replaceAll("\\s+", " ")
            .trim();
    }
} 