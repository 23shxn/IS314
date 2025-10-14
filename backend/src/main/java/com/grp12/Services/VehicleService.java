package com.grp12.Services;

import com.grp12.Model.Vehicle;
import com.grp12.Repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
@Transactional
public class VehicleService {
    
    @Autowired
    private VehicleRepository vehicleRepository;
    
    
    private static final Pattern LICENSE_PLATE_PATTERN = Pattern.compile("^[A-Za-z]{2}\\s\\d{3}$");
    
    
    private void validateLicensePlate(String licensePlate) {
        if (licensePlate == null || licensePlate.trim().isEmpty()) {
            throw new IllegalArgumentException("License plate is required");
        }
        
        String trimmedPlate = licensePlate.trim();
        if (!LICENSE_PLATE_PATTERN.matcher(trimmedPlate).matches()) {
            throw new IllegalArgumentException("License plate must be in format: AB 123 (2 letters, space, 3 numbers)");
        }
    }
    
    
    private void validateSeatingCapacity(Integer seatingCapacity) {
        if (seatingCapacity == null) {
            throw new IllegalArgumentException("Seating capacity is required");
        }
        
        if (seatingCapacity < 2) {
            throw new IllegalArgumentException("Seating capacity must be at least 2");
        }
        
        if (seatingCapacity > 50) { 
            throw new IllegalArgumentException("Seating capacity cannot exceed 50");
        }
    }
    
    
    public Vehicle saveVehicle(Vehicle vehicle) {
        try {
            
            if (vehicle.getMake() == null || vehicle.getMake().trim().isEmpty()) {
                throw new IllegalArgumentException("Vehicle make is required");
            }
            if (vehicle.getModel() == null || vehicle.getModel().trim().isEmpty()) {
                throw new IllegalArgumentException("Vehicle model is required");
            }
            if (vehicle.getVehicleType() == null || vehicle.getVehicleType().trim().isEmpty()) {
                throw new IllegalArgumentException("Vehicle type is required");
            }
            if (vehicle.getYear() == null || vehicle.getYear() < 1900 || vehicle.getYear() > 2030) {
                throw new IllegalArgumentException("Valid year is required");
            }
            if (vehicle.getLocation() == null || vehicle.getLocation().trim().isEmpty()) {
                throw new IllegalArgumentException("Location is required");
            }
            if (vehicle.getPricePerDay() == null || vehicle.getPricePerDay().compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("Valid price per day greater than 0 is required");
            }
            
            
            validateLicensePlate(vehicle.getLicensePlate());
            
            
            validateSeatingCapacity(vehicle.getSeatingCapacity());
            
            
            if (vehicle.getId() == null) { 
                if (vehicle.getVehicleImage1() == null || vehicle.getVehicleImage1().trim().isEmpty()) {
                    throw new IllegalArgumentException("Vehicle Image 1 is required");
                }
                if (vehicle.getVehicleImage2() == null || vehicle.getVehicleImage2().trim().isEmpty()) {
                    throw new IllegalArgumentException("Vehicle Image 2 is required");
                }
                if (vehicle.getVehicleImage3() == null || vehicle.getVehicleImage3().trim().isEmpty()) {
                    throw new IllegalArgumentException("Vehicle Image 3 is required");
                }
            }
            
            
            if (vehicle.getLicensePlate() != null && !vehicle.getLicensePlate().trim().isEmpty()) {
                Optional<Vehicle> existingByPlate = vehicleRepository.findByLicensePlate(vehicle.getLicensePlate().trim());
                if (existingByPlate.isPresent() && !existingByPlate.get().getId().equals(vehicle.getId())) {
                    throw new IllegalArgumentException("Vehicle with this license plate already exists");
                }
            }
            
            
            if (vehicle.getVin() != null && !vehicle.getVin().trim().isEmpty()) {
                Optional<Vehicle> existingByVin = vehicleRepository.findByVin(vehicle.getVin().trim());
                if (existingByVin.isPresent() && !existingByVin.get().getId().equals(vehicle.getId())) {
                    throw new IllegalArgumentException("Vehicle with this VIN already exists");
                }
            }
            
            
            if (vehicle.getFuelType() != null && !vehicle.getFuelType().trim().isEmpty()) {
                String fuelType = vehicle.getFuelType().trim();
                if (!fuelType.equals("Petrol") && !fuelType.equals("Diesel") && 
                    !fuelType.equals("Electric") && !fuelType.equals("Hybrid")) {
                    throw new IllegalArgumentException("Fuel type must be one of: Petrol, Diesel, Electric, Hybrid");
                }
            }
            
            
            if (vehicle.getTransmission() != null && !vehicle.getTransmission().trim().isEmpty()) {
                String transmission = vehicle.getTransmission().trim();
                if (!transmission.equals("Automatic") && !transmission.equals("Manual")) {
                    throw new IllegalArgumentException("Transmission must be either Automatic or Manual");
                }
            }
            
            
            if (vehicle.getVehicleType() != null && !vehicle.getVehicleType().trim().isEmpty()) {
                String vehicleType = vehicle.getVehicleType().trim();
                if (!vehicleType.equals("Sedan") && !vehicleType.equals("SUV") && 
                    !vehicleType.equals("Truck") && !vehicleType.equals("Van")) {
                    throw new IllegalArgumentException("Vehicle type must be one of: Sedan, SUV, Truck, Van");
                }
            }
            
            
            if (vehicle.getLocation() != null && !vehicle.getLocation().trim().isEmpty()) {
                String location = vehicle.getLocation().trim();
                if (!location.equals("Suva") && !location.equals("Nadi") && !location.equals("Lautoka")) {
                    throw new IllegalArgumentException("Location must be one of: Suva, Nadi, Lautoka");
                }
            }
            
            
            if (vehicle.getMileage() != null && vehicle.getMileage() < 0) {
                throw new IllegalArgumentException("Mileage cannot be negative");
            }
            
            
            vehicle.setLicensePlate(vehicle.getLicensePlate().trim().toUpperCase());
            
            Vehicle savedVehicle = vehicleRepository.save(vehicle);
            System.out.println("Vehicle saved with ID: " + savedVehicle.getId());
            return savedVehicle;
            
        } catch (Exception e) {
            System.err.println("Error saving vehicle: " + e.getMessage());
            if (e instanceof IllegalArgumentException) {
                throw e;
            }
            throw new RuntimeException("Failed to save vehicle: " + e.getMessage());
        }
    }
    
    
    public List<Vehicle> getAllVehicles() {
        try {
            return vehicleRepository.findAll();
        } catch (Exception e) {
            System.err.println("Error getting all vehicles: " + e.getMessage());
            throw new RuntimeException("Failed to fetch vehicles: " + e.getMessage());
        }
    }
    
    
    public List<Vehicle> getAvailableVehicles() {
        try {
            return vehicleRepository.findByStatus("Available");
        } catch (Exception e) {
            System.err.println("Error getting available vehicles: " + e.getMessage());
            throw new RuntimeException("Failed to fetch available vehicles: " + e.getMessage());
        }
    }
    
    
    public Vehicle getVehicleById(Long id) {
        try {
            return vehicleRepository.findById(id).orElse(null);
        } catch (Exception e) {
            System.err.println("Error getting vehicle by ID: " + e.getMessage());
            return null;
        }
    }
    
    
    public List<Vehicle> searchVehicles(String location, String vehicleType, Double minPrice, Double maxPrice, String status) {
        try {
            
            String searchStatus = (status != null && !status.trim().isEmpty()) ? status : "Available";
            
            return vehicleRepository.findVehiclesWithFilters(
                (location != null && !location.trim().isEmpty()) ? location : null,
                (vehicleType != null && !vehicleType.trim().isEmpty()) ? vehicleType : null,
                minPrice,
                maxPrice,
                searchStatus
            );
        } catch (Exception e) {
            System.err.println("Error searching vehicles: " + e.getMessage());
            throw new RuntimeException("Failed to search vehicles: " + e.getMessage());
        }
    }
    
    
    public Vehicle updateVehicleStatus(Long vehicleId, String status) {
        try {
            Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
            
            
            if (status == null || status.trim().isEmpty()) {
                throw new IllegalArgumentException("Status is required");
            }
            
            String normalizedStatus = status.trim();
            if (!normalizedStatus.equals("Available") && !normalizedStatus.equals("Rented") && 
                !normalizedStatus.equals("Maintenance") && !normalizedStatus.equals("Out_of_Service")) {
                throw new IllegalArgumentException("Status must be one of: Available, Rented, Maintenance, Out_of_Service");
            }
            
            vehicle.setStatus(normalizedStatus);
            return vehicleRepository.save(vehicle);
        } catch (Exception e) {
            System.err.println("Error updating vehicle status: " + e.getMessage());
            if (e instanceof RuntimeException) {
                throw e;
            }
            throw new RuntimeException("Failed to update vehicle status: " + e.getMessage());
        }
    }
    
    
    public void deleteVehicle(Long vehicleId) {
        try {
            Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
            
            vehicleRepository.delete(vehicle);
            System.out.println("Vehicle deleted with ID: " + vehicleId);
        } catch (Exception e) {
            System.err.println("Error deleting vehicle: " + e.getMessage());
            if (e instanceof RuntimeException) {
                throw e;
            }
            throw new RuntimeException("Failed to delete vehicle: " + e.getMessage());
        }
    }
    
    
    public List<String> getDistinctLocations() {
        try {
            return vehicleRepository.findDistinctLocations();
        } catch (Exception e) {
            System.err.println("Error getting distinct locations: " + e.getMessage());
            throw new RuntimeException("Failed to fetch locations: " + e.getMessage());
        }
    }
    
    
    public List<String> getDistinctVehicleTypes() {
        try {
            return vehicleRepository.findDistinctVehicleTypes();
        } catch (Exception e) {
            System.err.println("Error getting distinct vehicle types: " + e.getMessage());
            throw new RuntimeException("Failed to fetch vehicle types: " + e.getMessage());
        }
    }
    
    
    public VehicleStatistics getVehicleStatistics() {
        try {
            Long total = vehicleRepository.count();
            Long available = vehicleRepository.countByStatus("Available");
            Long rented = vehicleRepository.countByStatus("Rented");
            Long maintenance = vehicleRepository.countByStatus("Maintenance");
            Long outOfService = vehicleRepository.countByStatus("Out_of_Service");
            
            return new VehicleStatistics(total, available, rented, maintenance, outOfService);
        } catch (Exception e) {
            System.err.println("Error getting vehicle statistics: " + e.getMessage());
            throw new RuntimeException("Failed to fetch vehicle statistics: " + e.getMessage());
        }
    }
    
    
    public static class VehicleStatistics {
        private Long total;
        private Long available;
        private Long rented;
        private Long maintenance;
        private Long outOfService;
        
        public VehicleStatistics(Long total, Long available, Long rented, Long maintenance, Long outOfService) {
            this.total = total;
            this.available = available;
            this.rented = rented;
            this.maintenance = maintenance;
            this.outOfService = outOfService;
        }
        
        
        public Long getTotal() { return total; }
        public Long getAvailable() { return available; }
        public Long getRented() { return rented; }
        public Long getMaintenance() { return maintenance; }
        public Long getOutOfService() { return outOfService; }
    }
}