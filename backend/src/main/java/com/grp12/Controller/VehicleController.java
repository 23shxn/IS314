package com.grp12.Controller;

import com.grp12.Model.Vehicle;
import com.grp12.Model.PendingVehicleChange;
import com.grp12.Model.Admin;
import com.grp12.Repository.VehicleRepository;
import com.grp12.Repository.PendingVehicleChangeRepository;
import com.grp12.Services.VehicleService;
import com.grp12.Services.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Base64;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;
import java.util.regex.Pattern;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/vehicles")

public class VehicleController {
    
    @Autowired
    private VehicleService vehicleService;
    
    @Autowired
    private AdminService adminService;
    
    @Autowired
    private VehicleRepository vehicleRepository;
    
    @Autowired
    private PendingVehicleChangeRepository pendingVehicleChangeRepository;
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    // License plate pattern: AB 123 (2 letters, space, 3 numbers)
    private static final Pattern LICENSE_PLATE_PATTERN = Pattern.compile("^[A-Za-z]{2}\\s\\d{3}$");

    // PUBLIC ENDPOINTS

    // Get available vehicles
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

    // Get distinct locations
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

    // Get distinct vehicle types
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

    // ADMIN ONLY ENDPOINTS BELOW
    
    // Get all vehicles (admin only)
    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
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

    // Get single vehicle by ID (admin only)
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> getVehicleById(@PathVariable Long id) {
        try {
            Optional<Vehicle> vehicleOpt = vehicleRepository.findById(id);
            if (!vehicleOpt.isPresent()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Vehicle not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }
            return ResponseEntity.ok(vehicleOpt.get());
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch vehicle: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    // Helper method to get current admin
    private Admin getCurrentAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        
        String username = authentication.getName();
        Admin admin = adminService.getAdminByEmail(username);
        if (admin == null) {
            admin = adminService.getAdminByUsername(username);
        }
        return admin;
    }
    
    // Add new vehicle (admin only) - with role-based logic
    @PostMapping("/add")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
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
            Admin currentAdmin = getCurrentAdmin();
            if (currentAdmin == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Admin not authenticated"));
            }
            
            // If super admin, add directly
            if ("SUPER_ADMIN".equals(currentAdmin.getRole())) {
                return addVehicleDirect(make, model, vehicleType, year, color, licensePlate, vin,
                                      fuelType, transmission, seatingCapacity, mileage, pricePerDay,
                                      location, description, features, vehicleImage1, vehicleImage2, vehicleImage3);
            }
            
            // For regular admins, create pending request
            return createPendingVehicleAddRequest(make, model, vehicleType, year, color, licensePlate, vin,
                                                fuelType, transmission, seatingCapacity, mileage, pricePerDay,
                                                location, description, features, vehicleImage1, vehicleImage2, vehicleImage3, currentAdmin);
            
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to process vehicle add request: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    // Direct vehicle add (for super admins)
    private ResponseEntity<?> addVehicleDirect(String make, String model, String vehicleType, Integer year, String color,
                                             String licensePlate, String vin, String fuelType, String transmission,
                                             Integer seatingCapacity, Integer mileage, BigDecimal pricePerDay, String location,
                                             String description, String features, MultipartFile vehicleImage1,
                                             MultipartFile vehicleImage2, MultipartFile vehicleImage3) {
        
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
            vehicle.setLicensePlate(licensePlate.trim().toUpperCase());
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
    
    // Create pending vehicle add request (for regular admins)
    private ResponseEntity<?> createPendingVehicleAddRequest(String make, String model, String vehicleType, Integer year, String color,
                                                           String licensePlate, String vin, String fuelType, String transmission,
                                                           Integer seatingCapacity, Integer mileage, BigDecimal pricePerDay, String location,
                                                           String description, String features, MultipartFile vehicleImage1,
                                                           MultipartFile vehicleImage2, MultipartFile vehicleImage3, Admin currentAdmin) {
        
        try {
            // Validate required fields
            if (make == null || make.trim().isEmpty() ||
                model == null || model.trim().isEmpty() ||
                vehicleType == null || vehicleType.trim().isEmpty() ||
                year == null || color == null || color.trim().isEmpty() ||
                licensePlate == null || licensePlate.trim().isEmpty() ||
                fuelType == null || fuelType.trim().isEmpty() ||
                transmission == null || transmission.trim().isEmpty() ||
                seatingCapacity == null || pricePerDay == null || pricePerDay.doubleValue() <= 0 ||
                location == null || location.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "All required fields must be provided"));
            }
            
            // Validate images
            if (vehicleImage1 == null || vehicleImage1.isEmpty() ||
                vehicleImage2 == null || vehicleImage2.isEmpty() ||
                vehicleImage3 == null || vehicleImage3.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "All three vehicle images are required"));
            }
            
            // Create vehicle data JSON
            Map<String, Object> vehicleData = new HashMap<>();
            vehicleData.put("make", make.trim());
            vehicleData.put("model", model.trim());
            vehicleData.put("vehicleType", vehicleType.trim());
            vehicleData.put("year", year);
            vehicleData.put("color", color.trim());
            vehicleData.put("licensePlate", licensePlate.trim());
            vehicleData.put("fuelType", fuelType.trim());
            vehicleData.put("transmission", transmission.trim());
            vehicleData.put("seatingCapacity", seatingCapacity);
            vehicleData.put("pricePerDay", pricePerDay);
            vehicleData.put("location", location.trim());
            
            if (vin != null && !vin.trim().isEmpty()) vehicleData.put("vin", vin.trim());
            if (mileage != null) vehicleData.put("mileage", mileage);
            if (description != null && !description.trim().isEmpty()) vehicleData.put("description", description.trim());
            if (features != null && !features.trim().isEmpty()) vehicleData.put("features", features.trim());
            
            // Convert images to base64
            vehicleData.put("vehicleImage1", Base64.getEncoder().encodeToString(vehicleImage1.getBytes()));
            vehicleData.put("vehicleImage2", Base64.getEncoder().encodeToString(vehicleImage2.getBytes()));
            vehicleData.put("vehicleImage3", Base64.getEncoder().encodeToString(vehicleImage3.getBytes()));
            
            // Create pending request
            PendingVehicleChange pendingRequest = new PendingVehicleChange(
                objectMapper.writeValueAsString(vehicleData),
                currentAdmin.getId()
            );
            
            PendingVehicleChange savedRequest = pendingVehicleChangeRepository.save(pendingRequest);
            
            return ResponseEntity.ok().body(Map.of(
                "message", "Vehicle add request submitted for approval",
                "requestId", savedRequest.getId()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to submit vehicle add request: " + e.getMessage()));
        }
    }
    
    // Update vehicle status (super admin only)
    @PatchMapping("/{id}/status")
@PreAuthorize("hasRole('SUPER_ADMIN')")
public ResponseEntity<?> updateVehicleStatus(@PathVariable Long id, @RequestBody Map<String, String> statusUpdate) {
    try {
        Admin currentAdmin = getCurrentAdmin();
        if (currentAdmin == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Admin not authenticated"));
        }

        // Validate vehicle exists
        Optional<Vehicle> vehicleOpt = vehicleRepository.findById(id);
        if (!vehicleOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Vehicle not found"));
        }

        String newStatus = statusUpdate.get("status");
        if (newStatus == null || newStatus.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Status is required"));
        }

        // Validate status
        if (!List.of("Available", "Rented", "Maintenance", "Out_of_Service").contains(newStatus)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Invalid status. Must be one of: Available, Rented, Maintenance, Out_of_Service"));
        }

        // Update vehicle status
        Vehicle vehicle = vehicleOpt.get();
        vehicle.setStatus(newStatus);
        Vehicle updatedVehicle = vehicleService.saveVehicle(vehicle);
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
@PutMapping("/{id}")
@PreAuthorize("hasRole('SUPER_ADMIN')")
public ResponseEntity<?> updateVehicle(@PathVariable Long id,
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
                                       @RequestParam(value = "vehicleImage1", required = false) MultipartFile vehicleImage1,
                                       @RequestParam(value = "vehicleImage2", required = false) MultipartFile vehicleImage2,
                                       @RequestParam(value = "vehicleImage3", required = false) MultipartFile vehicleImage3) {
    try {
        Admin currentAdmin = getCurrentAdmin();
        if (currentAdmin == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Admin not authenticated"));
        }

        // Validate vehicle exists
        Optional<Vehicle> existingVehicleOpt = vehicleRepository.findById(id);
        if (!existingVehicleOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Vehicle not found"));
        }

        Vehicle existingVehicle = existingVehicleOpt.get();

        // Validate input parameters
        validateVehicleParameters(licensePlate, seatingCapacity, vehicleType, fuelType, transmission, location);

        // Validate image types and sizes if provided
        if (vehicleImage1 != null && !vehicleImage1.isEmpty()) {
            if (!isValidImageType(vehicleImage1)) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Vehicle Image 1 must be a valid image file (JPEG, PNG, GIF, WebP)");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }
            if (vehicleImage1.getSize() > 10 * 1024 * 1024) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Vehicle Image 1 must be smaller than 10MB");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }
        }
        if (vehicleImage2 != null && !vehicleImage2.isEmpty()) {
            if (!isValidImageType(vehicleImage2)) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Vehicle Image 2 must be a valid image file (JPEG, PNG, GIF, WebP)");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }
            if (vehicleImage2.getSize() > 10 * 1024 * 1024) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Vehicle Image 2 must be smaller than 10MB");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }
        }
        if (vehicleImage3 != null && !vehicleImage3.isEmpty()) {
            if (!isValidImageType(vehicleImage3)) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Vehicle Image 3 must be a valid image file (JPEG, PNG, GIF, WebP)");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }
            if (vehicleImage3.getSize() > 10 * 1024 * 1024) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Vehicle Image 3 must be smaller than 10MB");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }
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

        // Update fields
        existingVehicle.setMake(make.trim());
        existingVehicle.setModel(model.trim());
        existingVehicle.setVehicleType(vehicleType.trim());
        existingVehicle.setYear(year);
        existingVehicle.setColor(color.trim());
        existingVehicle.setLicensePlate(licensePlate.trim().toUpperCase());
        existingVehicle.setVin(vin != null ? vin.trim() : null);
        existingVehicle.setFuelType(fuelType.trim());
        existingVehicle.setTransmission(transmission.trim());
        existingVehicle.setSeatingCapacity(seatingCapacity);
        existingVehicle.setMileage(mileage);
        existingVehicle.setPricePerDay(pricePerDay);
        existingVehicle.setLocation(location.trim());
        existingVehicle.setDescription(description != null ? description.trim() : null);
        existingVehicle.setFeatures(features != null ? features.trim() : null);

        // Handle image updates (only if provided)
        if (vehicleImage1 != null && !vehicleImage1.isEmpty()) {
            existingVehicle.setVehicleImage1(Base64.getEncoder().encodeToString(vehicleImage1.getBytes()));
        }
        if (vehicleImage2 != null && !vehicleImage2.isEmpty()) {
            existingVehicle.setVehicleImage2(Base64.getEncoder().encodeToString(vehicleImage2.getBytes()));
        }
        if (vehicleImage3 != null && !vehicleImage3.isEmpty()) {
            existingVehicle.setVehicleImage3(Base64.getEncoder().encodeToString(vehicleImage3.getBytes()));
        }

        Vehicle savedVehicle = vehicleService.saveVehicle(existingVehicle);
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
        errorResponse.put("error", "Failed to update vehicle: " + e.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }
}

    // Bulk update vehicle status (super admin only)
    @PutMapping("")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> bulkUpdateVehicleStatus(@RequestBody Map<String, Object> request) {
        try {
            Admin currentAdmin = getCurrentAdmin();
            if (currentAdmin == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Admin not authenticated"));
            }

            // Extract vehicleIds and status from request
            @SuppressWarnings("unchecked")
            List<Long> vehicleIds = (List<Long>) request.get("vehicleIds");
            String newStatus = (String) request.get("status");

            // Validate inputs
            if (vehicleIds == null || vehicleIds.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "vehicleIds list is required and cannot be empty"));
            }
            if (newStatus == null || newStatus.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "status is required"));
            }

            // Validate status
            List<String> validStatuses = List.of("Available", "Rented", "Maintenance", "Out_of_Service");
            if (!validStatuses.contains(newStatus)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Invalid status. Must be one of: " + String.join(", ", validStatuses)));
            }

            // Update each vehicle
            List<Long> updatedIds = new ArrayList<>();
            List<Long> notFoundIds = new ArrayList<>();
            for (Long id : vehicleIds) {
                Optional<Vehicle> vehicleOpt = vehicleRepository.findById(id);
                if (vehicleOpt.isPresent()) {
                    Vehicle vehicle = vehicleOpt.get();
                    vehicle.setStatus(newStatus);
                    vehicleService.saveVehicle(vehicle);
                    updatedIds.add(id);
                } else {
                    notFoundIds.add(id);
                }
            }

            // Prepare response
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Bulk status update completed");
            response.put("updatedCount", updatedIds.size());
            response.put("updatedIds", updatedIds);
            if (!notFoundIds.isEmpty()) {
                response.put("notFoundIds", notFoundIds);
            }

            return ResponseEntity.ok(response);

        } catch (ClassCastException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "Invalid request format. vehicleIds must be a list of numbers, status must be a string"));
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to bulk update vehicle status: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> deleteVehicle(@PathVariable Long id) {
        try {
            Admin currentAdmin = getCurrentAdmin();
            if (currentAdmin == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Admin not authenticated"));
            }
            
            // If super admin, delete directly
            if ("SUPER_ADMIN".equals(currentAdmin.getRole())) {
                vehicleService.deleteVehicle(id);
                Map<String, String> response = new HashMap<>();
                response.put("message", "Vehicle deleted successfully");
                return ResponseEntity.ok(response);
            }
            
            // For regular admins, create pending delete request
            PendingVehicleChange pendingRequest = new PendingVehicleChange(id, currentAdmin.getId());
            PendingVehicleChange savedRequest = pendingVehicleChangeRepository.save(pendingRequest);
            
            return ResponseEntity.ok().body(Map.of(
                "message", "Vehicle delete request submitted for approval",
                "requestId", savedRequest.getId()
            ));
            
        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to process vehicle delete request: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    // ... rest of the existing methods remain the same ...
    
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
}