package com.pullman.service;

import com.pullman.domain.Production;
import com.pullman.domain.Trip;
import com.pullman.domain.Zone;
import com.pullman.domain.Route;
import com.pullman.domain.Entrepreneur;
import com.pullman.repository.ProductionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.time.LocalDate;

@Service
public class ProductionService {
    @Autowired
    private ProductionRepository productionRepository;

    @Autowired
    private com.pullman.repository.EntrepreneurRepository entrepreneurRepository;

    @Autowired
    private com.pullman.repository.TripRepository tripRepository;

    @Autowired
    private com.pullman.repository.RouteRepository routeRepository;

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

    @Transactional
    public int generateProductionsForDecena(String decena) {
        // 1. Obtener rango de fechas de la decena
        if (decena == null || decena.length() < 5) return 0;
        int decenaNum = Integer.parseInt(decena.substring(0, 1));
        int mes = Integer.parseInt(decena.substring(1, 3));
        int anio = Integer.parseInt(decena.substring(3));
        int diaInicio = (decenaNum - 1) * 10 + 1;
        int diaFin = (decenaNum == 3) ? LocalDate.of(anio, mes, 1).lengthOfMonth() : decenaNum * 10;
        LocalDate desde = LocalDate.of(anio, mes, diaInicio);
        LocalDate hasta = LocalDate.of(anio, mes, diaFin);

        // 2. Obtener todos los viajes de la decena
        List<Trip> trips = tripRepository.findByTravelDateBetween(desde, hasta);
        if (trips.isEmpty()) return 0;

        // 3. Agrupar por nombre de empresa (companyName)
        Map<String, List<Trip>> tripsByCompany = trips.stream()
            .filter(t -> t.getCompanyName() != null && !t.getCompanyName().isBlank())
            .collect(Collectors.groupingBy(t -> t.getCompanyName().trim().toLowerCase()));

        int totalProcesadas = 0;
        // Obtener todas las rutas una sola vez
        List<Route> allRoutes = routeRepository.findAll();
        final List<Route> finalAllRoutes = allRoutes;
        for (Map.Entry<String, List<Trip>> entry : tripsByCompany.entrySet()) {
            String companyName = entry.getKey();
            List<Trip> companyTrips = entry.getValue();
            Entrepreneur entrepreneur = entrepreneurRepository.findAll().stream()
                .filter(e -> e.getNombre() != null && e.getNombre().trim().toLowerCase().equals(companyName))
                .findFirst().orElse(null);
            if (entrepreneur == null) continue;

            Optional<Production> prodOpt = productionRepository.findByEntrepreneurAndDecena(entrepreneur.getId(), decena);
            Production prod = prodOpt.orElse(new Production());
            if (prod.getId() != null && prod.isValidado()) continue;

            // Calcular total: sumatoria de ingresos transportados (sin % zona)
            double total = companyTrips.stream().mapToDouble(t -> {
                double suc = t.getBranchRevenue() != null ? t.getBranchRevenue().doubleValue() : 0;
                double cam = t.getRoadRevenue() != null ? t.getRoadRevenue().doubleValue() : 0;
                double man = parseManualIncome(t.getManualIncome());
                return suc + cam + man;
            }).sum();

            // Calcular ganancia: sumatoria de (ingresos * % zona de la ruta) para cada servicio
            double ganancia = companyTrips.stream().mapToDouble(t -> {
                double suc = t.getBranchRevenue() != null ? t.getBranchRevenue().doubleValue() : 0;
                double cam = t.getRoadRevenue() != null ? t.getRoadRevenue().doubleValue() : 0;
                double man = parseManualIncome(t.getManualIncome());
                double ingresos = suc + cam + man;
                // Buscar zona de la ruta para este viaje
                String originNorm = normalizeString(t.getOrigin());
                String destNorm = normalizeString(t.getDestination());
                Zone zona = null;
                for (Route route : finalAllRoutes) {
                    String routeOrigin = normalizeString(route.getOrigen());
                    String routeDest = normalizeString(route.getDestino());
                    if ((routeOrigin.equals(originNorm) && routeDest.equals(destNorm)) ||
                        (routeOrigin.equals(destNorm) && routeDest.equals(originNorm))) {
                        zona = route.getZona();
                        break;
                    }
                }
                double porcentajeZona = (zona != null) ? zona.getPorcentaje() : 0.0;
                return ingresos * (porcentajeZona / 100.0);
            }).sum();

            prod.setDecena(decena);
            prod.setEntrepreneur(entrepreneur);
            prod.setTotal(total);
            prod.setGanancia(ganancia);
            prod.setValidado(false);
            prod.setComentarios(null);
            prod.setFechaValidacion(null);
            prod.setValidadoPor(null);
            productionRepository.save(prod);
            totalProcesadas++;
        }

        return totalProcesadas;
    }

    // Normaliza cadenas para comparar rutas
    private String normalizeString(String str) {
        if (str == null) return "";
        return java.text.Normalizer.normalize(str.toLowerCase(), java.text.Normalizer.Form.NFD)
            .replaceAll("[\\p{InCombiningDiacriticalMarks}]", "")
            .replaceAll("\\s+", " ")
            .trim();
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