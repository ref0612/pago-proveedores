package com.pullman.repository;

import com.pullman.domain.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
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
    
    // Buscar viaje por fecha, hora, origen, destino y bus
    Trip findByTravelDateAndDepartureTimeAndOriginAndDestinationAndBusNumber(
        LocalDate travelDate,
        LocalTime departureTime,
        String origin,
        String destination,
        String busNumber
    );
    
    // Consulta personalizada para obtener estadísticas de ingresos
    @Query("SELECT SUM(t.branchRevenue + t.roadRevenue) FROM Trip t WHERE t.travelDate = :date")
    Double getTotalRevenueByDate(@Param("date") LocalDate date);
    
    // Consulta optimizada para buscar viajes por empresa en un rango de fechas
    @Query("SELECT t FROM Trip t WHERE t.companyName = :companyName AND t.travelDate BETWEEN :startDate AND :endDate")
    List<Trip> findByCompanyNameAndTravelDateBetween(@Param("companyName") String companyName, 
                                                    @Param("startDate") LocalDate startDate, 
                                                    @Param("endDate") LocalDate endDate);
    
    // Consulta optimizada para obtener estadísticas de ingresos por empresa
    @Query("SELECT t.companyName, SUM(t.branchRevenue + t.roadRevenue) FROM Trip t WHERE t.travelDate BETWEEN :startDate AND :endDate GROUP BY t.companyName")
    List<Object[]> getRevenueByCompanyBetweenDates(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    // Consulta optimizada para obtener viajes únicos por empresa y fecha
    @Query("SELECT DISTINCT t.companyName, t.travelDate FROM Trip t WHERE t.travelDate BETWEEN :startDate AND :endDate")
    List<Object[]> getUniqueTripsByCompanyAndDate(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    // Consulta optimizada para contar viajes por empresa
    @Query("SELECT t.companyName, COUNT(t) FROM Trip t WHERE t.travelDate BETWEEN :startDate AND :endDate GROUP BY t.companyName")
    List<Object[]> getTripCountByCompany(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    // Consulta optimizada para obtener viajes con ingresos manuales
    @Query("SELECT t FROM Trip t WHERE t.manualIncome IS NOT NULL AND t.manualIncome != '' AND t.travelDate BETWEEN :startDate AND :endDate")
    List<Trip> findTripsWithManualIncome(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    // Consulta optimizada para verificar si existe un viaje
    @Query("SELECT COUNT(t) > 0 FROM Trip t WHERE t.travelDate = :travelDate AND t.departureTime = :departureTime AND t.origin = :origin AND t.destination = :destination AND t.busNumber = :busNumber")
    boolean existsByUniqueCriteria(@Param("travelDate") LocalDate travelDate, 
                                  @Param("departureTime") LocalTime departureTime,
                                  @Param("origin") String origin, 
                                  @Param("destination") String destination, 
                                  @Param("busNumber") String busNumber);
} 