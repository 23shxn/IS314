package com.grp12.Model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "vehicles", indexes = {
    @Index(name = "idx_vehicle_make_model", columnList = "make, model"),
    @Index(name = "idx_vehicle_location", columnList = "location"),
    @Index(name = "idx_vehicle_status", columnList = "status"),
    @Index(name = "idx_vehicle_type", columnList = "vehicle_type")
})
public class Vehicle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "make", nullable = false, length = 50)
    private String make;
    
    @Column(name = "model", nullable = false, length = 50)
    private String model;
    
    @Column(name = "vehicle_type", nullable = false, length = 30)
    private String vehicleType; // Sedan, SUV, Hatchback, Truck, etc.
    
    @Column(name = "year", nullable = false)
    private Integer year;
    
    @Column(name = "color", length = 30)
    private String color;
    
    @Column(name = "license_plate", unique = true, length = 20)
    private String licensePlate;
    
    @Column(name = "vin", unique = true, length = 30)
    private String vin; // Vehicle Identification Number
    
    @Column(name = "fuel_type", length = 20)
    private String fuelType; // Petrol, Diesel, Electric, Hybrid
    
    @Column(name = "transmission", length = 20)
    private String transmission; // Manual, Automatic
    
    @Column(name = "seating_capacity")
    private Integer seatingCapacity;
    
    @Column(name = "mileage")
    private Integer mileage; // in kilometers
    
   @Column(name = "price_per_day", nullable = false, precision = 8, scale = 2)
    private BigDecimal pricePerDay;

    @Column(name = "location", nullable = false, length = 100)
    private String location;
    
    @Column(name = "status", nullable = false, length = 20)
    private String status; // Available, Rented, Maintenance, Out_of_Service
    
    @Column(name = "image_url", length = 500)
    private String imageUrl;
    
    // Three vehicle images (Base64 encoded)
    @Column(name = "vehicle_image_1", columnDefinition = "TEXT")
    private String vehicleImage1;
    
    @Column(name = "vehicle_image_2", columnDefinition = "TEXT")
    private String vehicleImage2;
    
    @Column(name = "vehicle_image_3", columnDefinition = "TEXT")
    private String vehicleImage3;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "features", columnDefinition = "TEXT")
    private String features; // JSON string of features like AC, GPS, etc.
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Default constructor
    public Vehicle() {
        this.createdAt = LocalDateTime.now();
        this.status = "Available";
    }
    
    // Constructor for easy creation
    public Vehicle(String make, String model, String vehicleType, Integer year, String location, BigDecimal pricePerDay) {
        this();
        this.make = make;
        this.model = model;
        this.vehicleType = vehicleType;
        this.year = year;
        this.location = location;
        this.pricePerDay = pricePerDay;
    }
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getMake() { return make; }
    public void setMake(String make) { this.make = make; }
    
    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }
    
    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }
    
    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }
    
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    
    public String getLicensePlate() { return licensePlate; }
    public void setLicensePlate(String licensePlate) { this.licensePlate = licensePlate; }
    
    public String getVin() { return vin; }
    public void setVin(String vin) { this.vin = vin; }
    
    public String getFuelType() { return fuelType; }
    public void setFuelType(String fuelType) { this.fuelType = fuelType; }
    
    public String getTransmission() { return transmission; }
    public void setTransmission(String transmission) { this.transmission = transmission; }
    
    public Integer getSeatingCapacity() { return seatingCapacity; }
    public void setSeatingCapacity(Integer seatingCapacity) { this.seatingCapacity = seatingCapacity; }
    
    public Integer getMileage() { return mileage; }
    public void setMileage(Integer mileage) { this.mileage = mileage; }
    
    public BigDecimal getPricePerDay() { return pricePerDay; }
    public void setPricePerDay(BigDecimal pricePerDay) { this.pricePerDay = pricePerDay; }
    
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { 
        this.status = status;
        this.updatedAt = LocalDateTime.now();
    }
    
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    
   
    public String getVehicleImage1() { return vehicleImage1; }
    public void setVehicleImage1(String vehicleImage1) { this.vehicleImage1 = vehicleImage1; }
    
    public String getVehicleImage2() { return vehicleImage2; }
    public void setVehicleImage2(String vehicleImage2) { this.vehicleImage2 = vehicleImage2; }
    
    public String getVehicleImage3() { return vehicleImage3; }
    public void setVehicleImage3(String vehicleImage3) { this.vehicleImage3 = vehicleImage3; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getFeatures() { return features; }
    public void setFeatures(String features) { this.features = features; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    @Override
    public String toString() {
        return "Vehicle{" +
                "id=" + id +
                ", make='" + make + '\'' +
                ", model='" + model + '\'' +
                ", vehicleType='" + vehicleType + '\'' +
                ", year=" + year +
                ", location='" + location + '\'' +
                ", status='" + status + '\'' +
                ", pricePerDay=" + pricePerDay +
                '}';
    }
}