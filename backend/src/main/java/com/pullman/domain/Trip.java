package com.pullman.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "trips")
public class Trip {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "travel_date", nullable = false)
    private LocalDate travelDate;
    
    @Column(name = "departure_time", nullable = false)
    private LocalTime departureTime;
    
    @Column(name = "origin", nullable = false)
    private String origin;
    
    @Column(name = "destination", nullable = false)
    private String destination;
    
    @Column(name = "route_name", nullable = false)
    private String routeName;
    
    @Column(name = "service_code", nullable = false)
    private String serviceCode;
    
    @Column(name = "service_type")
    private String serviceType;
    
    @Column(name = "status")
    private String status;
    
    @Column(name = "bus_number")
    private String busNumber;
    
    @Column(name = "license_plate")
    private String licensePlate;
    
    @Column(name = "vehicle_year")
    private Integer vehicleYear;
    
    @Column(name = "total_seats")
    private Integer totalSeats;
    
    @Column(name = "initial_score")
    private BigDecimal initialScore;
    
    @Column(name = "additional_score")
    private BigDecimal additionalScore;
    
    @Column(name = "total_score")
    private BigDecimal totalScore;
    
    @Column(name = "compensation")
    private BigDecimal compensation;
    
    @Column(name = "total_compensated")
    private BigDecimal totalCompensated;
    
    @Column(name = "company_rut")
    private String companyRut;
    
    @Column(name = "company_name")
    private String companyName;
    
    @Column(name = "driver_name")
    private String driverName;
    
    @Column(name = "branch_seats")
    private Integer branchSeats;
    
    @Column(name = "branch_revenue")
    private BigDecimal branchRevenue;
    
    @Column(name = "road_seats")
    private Integer roadSeats;
    
    @Column(name = "road_revenue")
    private BigDecimal roadRevenue;
    
    @Column(name = "manual_income")
    private String manualIncome;
    
    // Constructors
    public Trip() {}
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public LocalDate getTravelDate() {
        return travelDate;
    }
    
    public void setTravelDate(LocalDate travelDate) {
        this.travelDate = travelDate;
    }
    
    public LocalTime getDepartureTime() {
        return departureTime;
    }
    
    public void setDepartureTime(LocalTime departureTime) {
        this.departureTime = departureTime;
    }
    
    public String getOrigin() {
        return origin;
    }
    
    public void setOrigin(String origin) {
        this.origin = origin;
    }
    
    public String getDestination() {
        return destination;
    }
    
    public void setDestination(String destination) {
        this.destination = destination;
    }
    
    public String getRouteName() {
        return routeName;
    }
    
    public void setRouteName(String routeName) {
        this.routeName = routeName;
    }
    
    public String getServiceCode() {
        return serviceCode;
    }
    
    public void setServiceCode(String serviceCode) {
        this.serviceCode = serviceCode;
    }
    
    public String getServiceType() {
        return serviceType;
    }
    
    public void setServiceType(String serviceType) {
        this.serviceType = serviceType;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public String getBusNumber() {
        return busNumber;
    }
    
    public void setBusNumber(String busNumber) {
        this.busNumber = busNumber;
    }
    
    public String getLicensePlate() {
        return licensePlate;
    }
    
    public void setLicensePlate(String licensePlate) {
        this.licensePlate = licensePlate;
    }
    
    public Integer getVehicleYear() {
        return vehicleYear;
    }
    
    public void setVehicleYear(Integer vehicleYear) {
        this.vehicleYear = vehicleYear;
    }
    
    public Integer getTotalSeats() {
        return totalSeats;
    }
    
    public void setTotalSeats(Integer totalSeats) {
        this.totalSeats = totalSeats;
    }
    
    public BigDecimal getInitialScore() {
        return initialScore;
    }
    
    public void setInitialScore(BigDecimal initialScore) {
        this.initialScore = initialScore;
    }
    
    public BigDecimal getAdditionalScore() {
        return additionalScore;
    }
    
    public void setAdditionalScore(BigDecimal additionalScore) {
        this.additionalScore = additionalScore;
    }
    
    public BigDecimal getTotalScore() {
        return totalScore;
    }
    
    public void setTotalScore(BigDecimal totalScore) {
        this.totalScore = totalScore;
    }
    
    public BigDecimal getCompensation() {
        return compensation;
    }
    
    public void setCompensation(BigDecimal compensation) {
        this.compensation = compensation;
    }
    
    public BigDecimal getTotalCompensated() {
        return totalCompensated;
    }
    
    public void setTotalCompensated(BigDecimal totalCompensated) {
        this.totalCompensated = totalCompensated;
    }
    
    public String getCompanyRut() {
        return companyRut;
    }
    
    public void setCompanyRut(String companyRut) {
        this.companyRut = companyRut;
    }
    
    public String getCompanyName() {
        return companyName;
    }
    
    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }
    
    public String getDriverName() {
        return driverName;
    }
    
    public void setDriverName(String driverName) {
        this.driverName = driverName;
    }
    
    public Integer getBranchSeats() {
        return branchSeats;
    }
    
    public void setBranchSeats(Integer branchSeats) {
        this.branchSeats = branchSeats;
    }
    
    public BigDecimal getBranchRevenue() {
        return branchRevenue;
    }
    
    public void setBranchRevenue(BigDecimal branchRevenue) {
        this.branchRevenue = branchRevenue;
    }
    
    public Integer getRoadSeats() {
        return roadSeats;
    }
    
    public void setRoadSeats(Integer roadSeats) {
        this.roadSeats = roadSeats;
    }
    
    public BigDecimal getRoadRevenue() {
        return roadRevenue;
    }
    
    public void setRoadRevenue(BigDecimal roadRevenue) {
        this.roadRevenue = roadRevenue;
    }
    
    public String getManualIncome() {
        return manualIncome;
    }
    
    public void setManualIncome(String manualIncome) {
        this.manualIncome = manualIncome;
    }
} 