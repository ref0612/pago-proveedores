package com.pullman.repository;

import com.pullman.domain.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {
    
    // Buscar viajes por fecha
    List<Trip> findByTravelDate(LocalDate travelDate);
    
    // Buscar viajes por rango de fechas
    List<Trip> findByTravelDateBetween(LocalDate startDate, LocalDate endDate);
    
    // Buscar viajes por origen
    List<Trip> findByOrigin(String origin);
    
    // Buscar viajes por destino
    List<Trip> findByDestination(String destination);
    
    // Buscar viajes por origen y destino
    List<Trip> findByOriginAndDestination(String origin, String destination);
    
    // Buscar viajes por empresa
    List<Trip> findByCompanyName(String companyName);
    
    // Buscar viajes por conductor
    List<Trip> findByDriverName(String driverName);
    
    // Buscar viajes por estado
    List<Trip> findByStatus(String status);
    
    // Buscar viajes por patente del vehículo
    List<Trip> findByLicensePlate(String licensePlate);
    
    // Buscar viajes por código de servicio
    List<Trip> findByServiceCode(String serviceCode);
    
    // Consulta personalizada para obtener estadísticas de ingresos
    @Query("SELECT SUM(t.branchRevenue + t.roadRevenue) FROM Trip t WHERE t.travelDate = :date")
    Double getTotalRevenueByDate(@Param("date") LocalDate date);
    
    // Consulta para obtener estadísticas por empresa
    @Query("SELECT t.companyName, SUM(t.branchRevenue + t.roadRevenue) as totalRevenue, COUNT(t) as tripCount " +
           "FROM Trip t WHERE t.travelDate = :date GROUP BY t.companyName")
    List<Object[]> getRevenueByCompany(@Param("date") LocalDate date);
    
    // Consulta para obtener estadísticas por ruta
    @Query("SELECT t.routeName, SUM(t.branchRevenue + t.roadRevenue) as totalRevenue, COUNT(t) as tripCount " +
           "FROM Trip t WHERE t.travelDate = :date GROUP BY t.routeName")
    List<Object[]> getRevenueByRoute(@Param("date") LocalDate date);
} 