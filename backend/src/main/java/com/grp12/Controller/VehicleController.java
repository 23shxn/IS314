package com.grp12.Controller;


import com.grp12.Model.Vehicle;
import com.grp12.Services.VehicleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Base64;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/vehicles")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class VehicleController {
    
    @Autowired
    private VehicleService vehicleService;
    
    // Public endpoint - Get all available vehicles for search
    @GetMapping("/available")
    public ResponseEntity<?> getAvailableVehicles() {
        try {
            List<Vehicle> vehicles = vehicleService.getAvailableVehicles();
            return ResponseEntity.ok(vehicles);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch available vehicles: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    // Public endpoint - Search vehicles with filters
    @GetMapping("/search")
    public ResponseEntity<?> searchVehicles(
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String vehicleType,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice) {
        try {
            List<Vehicle> vehicles = vehicleService.searchVehicles(location, vehicleType, minPrice, maxPrice, "Available");
            return ResponseEntity.ok(vehicles);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to search vehicles: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    // Public endpoint - Get distinct locations for dropdown
    @GetMapping("/locations")
    public ResponseEntity<?> getLocations() {
        try {
            List<String> locations = vehicleService.getDistinctLocations();
            return ResponseEntity.ok(locations);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch locations: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    // Public endpoint - Get distinct vehicle types for dropdown
    @GetMapping("/types")
    public ResponseEntity<?> getVehicleTypes() {
        try {
            List<String> types = vehicleService.getDistinctVehicleTypes();
            return ResponseEntity.ok(types);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch vehicle types: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    // Admin endpoints
    
    // Get all vehicles (admin only)
    @GetMapping("/all")
    public ResponseEntity<?> getAllVehicles() {
        try {
            List<Vehicle> vehicles = vehicleService.getAllVehicles();
            return ResponseEntity.ok(vehicles);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch vehicles: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    // Get vehicle by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getVehicleById(@PathVariable Long id) {
        try {
            Vehicle vehicle = vehicleService.getVehicleById(id);
            if (vehicle != null) {
                return ResponseEntity.ok(vehicle);
            }
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Vehicle not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch vehicle: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    // Add new vehicle (admin only) - with file upload
    @PostMapping("/add")
    public ResponseEntity<?> addVehicle(
            @RequestParam("make") String make,
            @RequestParam("model") String model,
            @RequestParam("vehicleType") String vehicleType,
            @RequestParam("year") Integer year,
            @RequestParam("color") String color,
            @RequestParam("licensePlate") String licensePlate,
            @RequestParam(value = "vin", required = false) String vin,
            @RequestParam("fuelType") String fuelType,
            @RequestParam("transmission") String transmission,
            @RequestParam("seatingCapacity") Integer seatingCapacity,
            @RequestParam(value = "mileage", required = false) Integer mileage,
            @RequestParam("pricePerDay") BigDecimal pricePerDay,
            @RequestParam("location") String location,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "features", required = false) String features,
            @RequestParam(value = "vehicleImage", required = false) MultipartFile vehicleImage) {
        
        try {
            Vehicle vehicle = new Vehicle();
            vehicle.setMake(make);
            vehicle.setModel(model);
            vehicle.setVehicleType(vehicleType);
            vehicle.setYear(year);
            vehicle.setColor(color);
            vehicle.setLicensePlate(licensePlate);
            vehicle.setVin(vin);
            vehicle.setFuelType(fuelType);
            vehicle.setTransmission(transmission);
            vehicle.setSeatingCapacity(seatingCapacity);
            vehicle.setMileage(mileage);
            vehicle.setPricePerDay(pricePerDay);
            vehicle.setLocation(location);
            vehicle.setDescription(description);
            vehicle.setFeatures(features);
            vehicle.setStatus("Available");
            
            // Handle image upload
            if (vehicleImage != null && !vehicleImage.isEmpty()) {
                vehicle.setVehicleImage(Base64.getEncoder().encodeToString(vehicleImage.getBytes()));
            }
            
            Vehicle savedVehicle = vehicleService.saveVehicle(vehicle);
            return ResponseEntity.ok(savedVehicle);
            
        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (IOException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to process image file");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to add vehicle: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    // Update vehicle (admin only)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateVehicle(@PathVariable Long id, @RequestBody Vehicle vehicle) {
        try {
            vehicle.setId(id);
            Vehicle updatedVehicle = vehicleService.saveVehicle(vehicle);
            return ResponseEntity.ok(updatedVehicle);
        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to update vehicle: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    // Update vehicle status (admin only)
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateVehicleStatus(@PathVariable Long id, @RequestBody Map<String, String> statusUpdate) {
        try {
            String newStatus = statusUpdate.get("status");
            if (newStatus == null || newStatus.trim().isEmpty()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Status is required");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            Vehicle updatedVehicle = vehicleService.updateVehicleStatus(id, newStatus);
            return ResponseEntity.ok(updatedVehicle);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to update vehicle status: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    // Delete vehicle (admin only)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteVehicle(@PathVariable Long id) {
        try {
            vehicleService.deleteVehicle(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Vehicle deleted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to delete vehicle: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    // Get vehicle statistics (admin only)
    @GetMapping("/stats")
    public ResponseEntity<?> getVehicleStatistics() {
        try {
            VehicleService.VehicleStatistics stats = vehicleService.getVehicleStatistics();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch vehicle statistics: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}

