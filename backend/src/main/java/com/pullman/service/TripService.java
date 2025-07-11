package com.pullman.service;

import com.pullman.domain.Trip;
import com.pullman.repository.TripRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class TripService {
    @Autowired
    private TripRepository tripRepository;

    public Page<Trip> findAll(Pageable pageable) {
        return tripRepository.findAll(pageable);
    }

    public Optional<Trip> findById(Long id) {
        return tripRepository.findById(id);
    }

    public Trip save(Trip trip) {
        return tripRepository.save(trip);
    }

    public void deleteById(Long id) {
        tripRepository.deleteById(id);
    }

    // Método optimizado para obtener todas las producciones (mantener compatibilidad)
    public List<Trip> findAll() {
        return tripRepository.findAll();
    }

    // Método optimizado para buscar viajes por fecha
    public List<Trip> findByTravelDate(LocalDate travelDate) {
        return tripRepository.findByTravelDate(travelDate);
    }

    // Método optimizado para buscar viajes por rango de fechas
    public List<Trip> findByTravelDateBetween(LocalDate startDate, LocalDate endDate) {
        return tripRepository.findByTravelDateBetween(startDate, endDate);
    }

    // Método optimizado para buscar viajes por empresa en un rango de fechas
    public List<Trip> findByCompanyNameAndTravelDateBetween(String companyName, LocalDate startDate, LocalDate endDate) {
        return tripRepository.findByCompanyNameAndTravelDateBetween(companyName, startDate, endDate);
    }

    // Método optimizado para obtener estadísticas de ingresos por empresa
    public List<Object[]> getRevenueByCompanyBetweenDates(LocalDate startDate, LocalDate endDate) {
        return tripRepository.getRevenueByCompanyBetweenDates(startDate, endDate);
    }

    // Método optimizado para obtener viajes únicos por empresa y fecha
    public List<Object[]> getUniqueTripsByCompanyAndDate(LocalDate startDate, LocalDate endDate) {
        return tripRepository.getUniqueTripsByCompanyAndDate(startDate, endDate);
    }

    // Método optimizado para contar viajes por empresa
    public List<Object[]> getTripCountByCompany(LocalDate startDate, LocalDate endDate) {
        return tripRepository.getTripCountByCompany(startDate, endDate);
    }

    // Método optimizado para obtener viajes con ingresos manuales
    public List<Trip> findTripsWithManualIncome(LocalDate startDate, LocalDate endDate) {
        return tripRepository.findTripsWithManualIncome(startDate, endDate);
    }

    // Método optimizado para obtener estadísticas de ingresos por fecha
    public Double getTotalRevenueByDate(LocalDate date) {
        return tripRepository.getTotalRevenueByDate(date);
    }

    // Método optimizado para verificar si existe un viaje
    public boolean existsByUniqueCriteria(LocalDate travelDate, java.time.LocalTime departureTime, String origin, String destination, String busNumber) {
        return tripRepository.existsByUniqueCriteria(travelDate, departureTime, origin, destination, busNumber);
    }

    // Método optimizado para buscar viajes por origen
    public List<Trip> findByOrigin(String origin) {
        return tripRepository.findByOrigin(origin);
    }

    // Método optimizado para buscar viajes por destino
    public List<Trip> findByDestination(String destination) {
        return tripRepository.findByDestination(destination);
    }

    // Método optimizado para buscar viajes por origen y destino
    public List<Trip> findByOriginAndDestination(String origin, String destination) {
        return tripRepository.findByOriginAndDestination(origin, destination);
    }

    // Método optimizado para buscar viajes por empresa
    public List<Trip> findByCompanyName(String companyName) {
        return tripRepository.findByCompanyName(companyName);
    }

    // Método optimizado para buscar viajes por conductor
    public List<Trip> findByDriverName(String driverName) {
        return tripRepository.findByDriverName(driverName);
    }

    // Método optimizado para buscar viajes por estado
    public List<Trip> findByStatus(String status) {
        return tripRepository.findByStatus(status);
    }

    // Método optimizado para buscar viajes por patente del vehículo
    public List<Trip> findByLicensePlate(String licensePlate) {
        return tripRepository.findByLicensePlate(licensePlate);
    }

    // Método optimizado para buscar viajes por código de servicio
    public List<Trip> findByServiceCode(String serviceCode) {
        return tripRepository.findByServiceCode(serviceCode);
    }
    
    // Método para eliminar todos los viajes
    public long deleteAll() {
        long count = tripRepository.count();
        tripRepository.deleteAll();
        return count;
    }
} 