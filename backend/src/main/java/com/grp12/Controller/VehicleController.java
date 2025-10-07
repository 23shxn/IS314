package com.grp12.Controller;

import com.grp12.Model.Vehicle;
import com.grp12.Repository.VehicleRepository; // Add this import
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
import java.util.Optional;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/vehicles")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true", allowedHeaders = "*")
public class VehicleController {
    
    @Autowired
    private VehicleService vehicleService;
    
    // Add this missing dependency
    @Autowired
    private VehicleRepository vehicleRepository;
    
    // License plate pattern: AB 123 (2 letters, space, 3 numbers)
    private static final Pattern LICENSE_PLATE_PATTERN = Pattern.compile("^[A-Za-z]{2}\\s\\d{3}$");
    
    // Public endpoint - Get all available vehicles for search
    @GetMapping("/available")
    public ResponseEntity<List<Vehicle>> getAvailableVehicles(
        @RequestParam(required = false) String location,
        @RequestParam(required = false) String vehicleType) {
        
        try {
            List<Vehicle> vehicles;
            
            if (location != null && !location.isEmpty() && vehicleType != null && !vehicleType.isEmpty()) {
                vehicles = vehicleRepository.findByLocationAndVehicleTypeAndStatus(location, vehicleType, "Available");
            } else if (location != null && !location.isEmpty()) {
                vehicles = vehicleRepository.findByLocationAndStatus(location, "Available");
            } else if (vehicleType != null && !vehicleType.isEmpty()) {
                vehicles = vehicleRepository.findByVehicleTypeAndStatus(vehicleType, "Available");
            } else {
                vehicles = vehicleRepository.findByStatus("Available"); // Only available vehicles
            }
            
            return ResponseEntity.ok(vehicles);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Public endpoint - Get distinct locations for dropdown
    @GetMapping("/locations")
    public ResponseEntity<List<String>> getVehicleLocations() {
        try {
            List<String> locations = vehicleRepository.findDistinctLocations();
            return ResponseEntity.ok(locations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Public endpoint - Get distinct vehicle types for dropdown
    @GetMapping("/types")
    public ResponseEntity<List<String>> getVehicleTypes() {
        try {
            List<String> types = vehicleRepository.findDistinctVehicleTypes();
            return ResponseEntity.ok(types);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Get vehicle by ID - Public for viewing details
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
    
    // ADMIN ONLY ENDPOINTS BELOW
    
    // Get all vehicles (admin only)
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
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
    
    // Helper method to validate input parameters
    private void validateVehicleParameters(String licensePlate, Integer seatingCapacity, String vehicleType, 
                                         String fuelType, String transmission, String location) {
        // Validate license plate format
        if (licensePlate != null && !licensePlate.trim().isEmpty()) {
            String trimmedPlate = licensePlate.trim();
            if (!LICENSE_PLATE_PATTERN.matcher(trimmedPlate).matches()) {
                throw new IllegalArgumentException("License plate must be in format: AB 123 (2 letters, space, 3 numbers)");
            }
        }
        
        // Validate seating capacity
        if (seatingCapacity != null) {
            if (seatingCapacity < 2) {
                throw new IllegalArgumentException("Seating capacity must be at least 2");
            }
            if (seatingCapacity > 50) {
                throw new IllegalArgumentException("Seating capacity cannot exceed 50");
            }
        }
        
        // Validate vehicle type
        if (vehicleType != null && !vehicleType.trim().isEmpty()) {
            String type = vehicleType.trim();
            if (!type.equals("Sedan") && !type.equals("SUV") && 
                !type.equals("Truck") && !type.equals("Van")) {
                throw new IllegalArgumentException("Vehicle type must be one of: Sedan, SUV, Truck, Van");
            }
        }
        
        // Validate fuel type
        if (fuelType != null && !fuelType.trim().isEmpty()) {
            String fuel = fuelType.trim();
            if (!fuel.equals("Petrol") && !fuel.equals("Diesel") && 
                !fuel.equals("Electric") && !fuel.equals("Hybrid")) {
                throw new IllegalArgumentException("Fuel type must be one of: Petrol, Diesel, Electric, Hybrid");
            }
        }
        
        // Validate transmission
        if (transmission != null && !transmission.trim().isEmpty()) {
            String trans = transmission.trim();
            if (!trans.equals("Automatic") && !trans.equals("Manual")) {
                throw new IllegalArgumentException("Transmission must be either Automatic or Manual");
            }
        }
        
        // Validate location
        if (location != null && !location.trim().isEmpty()) {
            String loc = location.trim();
            if (!loc.equals("Suva") && !loc.equals("Nadi") && !loc.equals("Lautoka")) {
                throw new IllegalArgumentException("Location must be one of: Suva, Nadi, Lautoka");
            }
        }
    }
    
    // Add new vehicle (admin only) - with 3 required file uploads
    @PostMapping("/add")
    @PreAuthorize("hasRole('ADMIN')")
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
            @RequestParam("vehicleImage1") MultipartFile vehicleImage1,
            @RequestParam("vehicleImage2") MultipartFile vehicleImage2,
            @RequestParam("vehicleImage3") MultipartFile vehicleImage3) {
        
        try {
            // Validate input parameters first
            validateVehicleParameters(licensePlate, seatingCapacity, vehicleType, fuelType, transmission, location);
            
            // Validate that all 3 images are provided
            if (vehicleImage1 == null || vehicleImage1.isEmpty()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Vehicle Image 1 is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }
            if (vehicleImage2 == null || vehicleImage2.isEmpty()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Vehicle Image 2 is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }
            if (vehicleImage3 == null || vehicleImage3.isEmpty()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Vehicle Image 3 is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }
            
            // Validate image types and sizes
            if (!isValidImageType(vehicleImage1) || !isValidImageType(vehicleImage2) || !isValidImageType(vehicleImage3)) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "All images must be valid image files (JPEG, PNG, GIF, WebP)");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }
            
            // Check image sizes (10MB limit each)
            long maxSize = 10 * 1024 * 1024; // 10MB
            if (vehicleImage1.getSize() > maxSize || vehicleImage2.getSize() > maxSize || vehicleImage3.getSize() > maxSize) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Each image must be smaller than 10MB");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }
            
            // Validate required string fields
            if (make == null || make.trim().isEmpty()) {
                throw new IllegalArgumentException("Make is required");
            }
            if (model == null || model.trim().isEmpty()) {
                throw new IllegalArgumentException("Model is required");
            }
            if (color == null || color.trim().isEmpty()) {
                throw new IllegalArgumentException("Color is required");
            }
            if (licensePlate == null || licensePlate.trim().isEmpty()) {
                throw new IllegalArgumentException("License plate is required");
            }
            
            // Validate numeric fields
            if (year == null || year < 1900 || year > 2030) {
                throw new IllegalArgumentException("Valid year between 1900 and 2030 is required");
            }
            if (pricePerDay == null || pricePerDay.compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("Price per day must be greater than 0");
            }
            if (mileage != null && mileage < 0) {
                throw new IllegalArgumentException("Mileage cannot be negative");
            }
            
            Vehicle vehicle = new Vehicle();
            vehicle.setMake(make.trim());
            vehicle.setModel(model.trim());
            vehicle.setVehicleType(vehicleType.trim());
            vehicle.setYear(year);
            vehicle.setColor(color.trim());
            vehicle.setLicensePlate(licensePlate.trim().toUpperCase()); // Normalize to uppercase
            if (vin != null && !vin.trim().isEmpty()) {
                vehicle.setVin(vin.trim());
            }
            vehicle.setFuelType(fuelType.trim());
            vehicle.setTransmission(transmission.trim());
            vehicle.setSeatingCapacity(seatingCapacity);
            if (mileage != null) {
                vehicle.setMileage(mileage);
            }
            vehicle.setPricePerDay(pricePerDay);
            vehicle.setLocation(location.trim());
            if (description != null && !description.trim().isEmpty()) {
                vehicle.setDescription(description.trim());
            }
            if (features != null && !features.trim().isEmpty()) {
                vehicle.setFeatures(features.trim());
            }
            vehicle.setStatus("Available");
            
            // Handle image uploads
            vehicle.setVehicleImage1(Base64.getEncoder().encodeToString(vehicleImage1.getBytes()));
            vehicle.setVehicleImage2(Base64.getEncoder().encodeToString(vehicleImage2.getBytes()));
            vehicle.setVehicleImage3(Base64.getEncoder().encodeToString(vehicleImage3.getBytes()));
            
            Vehicle savedVehicle = vehicleService.saveVehicle(vehicle);
            return ResponseEntity.ok(savedVehicle);
            
        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (IOException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to process image files: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to add vehicle: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    private boolean isValidImageType(MultipartFile file) {
        String contentType = file.getContentType();
        return contentType != null && (
            contentType.equals("image/jpeg") ||
            contentType.equals("image/jpg") ||
            contentType.equals("image/png") ||
            contentType.equals("image/gif") ||
            contentType.equals("image/webp")
        );
    }
    
    // Update vehicle (admin only)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateVehicle(
            @PathVariable Long id,
            @RequestParam(value = "make", required = false) String make,
            @RequestParam(value = "model", required = false) String model,
            @RequestParam(value = "vehicleType", required = false) String vehicleType,
            @RequestParam(value = "year", required = false) Integer year,
            @RequestParam(value = "color", required = false) String color,
            @RequestParam(value = "licensePlate", required = false) String licensePlate,
            @RequestParam(value = "vin", required = false) String vin,
            @RequestParam(value = "fuelType", required = false) String fuelType,
            @RequestParam(value = "transmission", required = false) String transmission,
            @RequestParam(value = "seatingCapacity", required = false) Integer seatingCapacity,
            @RequestParam(value = "mileage", required = false) Integer mileage,
            @RequestParam(value = "pricePerDay", required = false) BigDecimal pricePerDay,
            @RequestParam(value = "location", required = false) String location,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "features", required = false) String features,
            @RequestParam(value = "vehicleImage1", required = false) MultipartFile vehicleImage1,
            @RequestParam(value = "vehicleImage2", required = false) MultipartFile vehicleImage2,
            @RequestParam(value = "vehicleImage3", required = false) MultipartFile vehicleImage3) {
        
        try {
            Optional<Vehicle> vehicleOpt = vehicleRepository.findById(id);
            if (!vehicleOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            Vehicle vehicle = vehicleOpt.get();
            
            // Update fields only if provided
            if (make != null) vehicle.setMake(make);
            if (model != null) vehicle.setModel(model);
            if (vehicleType != null) vehicle.setVehicleType(vehicleType);
            if (year != null) vehicle.setYear(year);
            if (color != null) vehicle.setColor(color);
            if (licensePlate != null) vehicle.setLicensePlate(licensePlate);
            if (vin != null) vehicle.setVin(vin);
            if (fuelType != null) vehicle.setFuelType(fuelType);
            if (transmission != null) vehicle.setTransmission(transmission);
            if (seatingCapacity != null) vehicle.setSeatingCapacity(seatingCapacity);
            if (mileage != null) vehicle.setMileage(mileage);
            if (pricePerDay != null) vehicle.setPricePerDay(pricePerDay);
            if (location != null) vehicle.setLocation(location);
            if (description != null) vehicle.setDescription(description);
            if (features != null) vehicle.setFeatures(features);
            
            // Handle image updates
            if (vehicleImage1 != null && !vehicleImage1.isEmpty()) {
                if (!isValidImageType(vehicleImage1)) {
                    return ResponseEntity.status(400).body(Map.of("error", "Invalid image format for vehicleImage1. Only JPEG, PNG, JPG, and WEBP are allowed."));
                }
                try {
                    String base64Image = Base64.getEncoder().encodeToString(vehicleImage1.getBytes());
                    vehicle.setVehicleImage1(base64Image);
                } catch (IOException e) {
                    return ResponseEntity.status(400).body(Map.of("error", "Failed to process vehicleImage1: " + e.getMessage()));
                }
            }
            
            if (vehicleImage2 != null && !vehicleImage2.isEmpty()) {
                if (!isValidImageType(vehicleImage2)) {
                    return ResponseEntity.status(400).body(Map.of("error", "Invalid image format for vehicleImage2. Only JPEG, PNG, JPG, and WEBP are allowed."));
                }
                try {
                    String base64Image = Base64.getEncoder().encodeToString(vehicleImage2.getBytes());
                    vehicle.setVehicleImage2(base64Image);
                } catch (IOException e) {
                    return ResponseEntity.status(400).body(Map.of("error", "Failed to process vehicleImage2: " + e.getMessage()));
                }
            }
            
            if (vehicleImage3 != null && !vehicleImage3.isEmpty()) {
                if (!isValidImageType(vehicleImage3)) {
                    return ResponseEntity.status(400).body(Map.of("error", "Invalid image format for vehicleImage3. Only JPEG, PNG, JPG, and WEBP are allowed."));
                }
                try {
                    String base64Image = Base64.getEncoder().encodeToString(vehicleImage3.getBytes());
                    vehicle.setVehicleImage3(base64Image);
                } catch (IOException e) {
                    return ResponseEntity.status(400).body(Map.of("error", "Failed to process vehicleImage3: " + e.getMessage()));
                }
            }
            
            // Save updated vehicle
            vehicle.preUpdate(); // Update the timestamp
            Vehicle updatedVehicle = vehicleRepository.save(vehicle);
            
            return ResponseEntity.ok().body(Map.of(
                "message", "Vehicle updated successfully",
                "vehicle", updatedVehicle
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update vehicle: " + e.getMessage()));
        }
    }
    
    // Update vehicle status (admin only)
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateVehicleStatus(@PathVariable Long id, @RequestBody Map<String, String> statusUpdate) {
        try {
            String newStatus = statusUpdate.get("status");
            if (newStatus == null || newStatus.trim().isEmpty()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Status is required");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            // Validate status value
            String status = newStatus.trim();
            if (!status.equals("Available") && !status.equals("Rented") && 
                !status.equals("Maintenance") && !status.equals("Out_of_Service")) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Status must be one of: Available, Rented, Maintenance, Out_of_Service");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            Vehicle updatedVehicle = vehicleService.updateVehicleStatus(id, status);
            return ResponseEntity.ok(updatedVehicle);
        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to update vehicle status: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    // Get vehicle statistics (admin only)
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
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
    
    // Delete vehicle (admin only)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteVehicle(@PathVariable Long id) {
        try {
            vehicleService.deleteVehicle(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Vehicle deleted successfully");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to delete vehicle: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}