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
import java.util.List;
import java.util.Base64;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;
import java.util.regex.Pattern;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/vehicles")
@CrossOrigin(origins = "http:
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
    
    
    private static final Pattern LICENSE_PLATE_PATTERN = Pattern.compile("^[A-Za-z]{2}\\s\\d{3}$");

    

    
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
            
            
            if ("SUPER_ADMIN".equals(currentAdmin.getRole())) {
                return addVehicleDirect(make, model, vehicleType, year, color, licensePlate, vin,
                                      fuelType, transmission, seatingCapacity, mileage, pricePerDay,
                                      location, description, features, vehicleImage1, vehicleImage2, vehicleImage3);
            }
            
            
            return createPendingVehicleAddRequest(make, model, vehicleType, year, color, licensePlate, vin,
                                                fuelType, transmission, seatingCapacity, mileage, pricePerDay,
                                                location, description, features, vehicleImage1, vehicleImage2, vehicleImage3, currentAdmin);
            
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to process vehicle add request: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    
    private ResponseEntity<?> addVehicleDirect(String make, String model, String vehicleType, Integer year, String color,
                                             String licensePlate, String vin, String fuelType, String transmission,
                                             Integer seatingCapacity, Integer mileage, BigDecimal pricePerDay, String location,
                                             String description, String features, MultipartFile vehicleImage1,
                                             MultipartFile vehicleImage2, MultipartFile vehicleImage3) {
        
        try {
            
            validateVehicleParameters(licensePlate, seatingCapacity, vehicleType, fuelType, transmission, location);
            
            
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
            
            
            if (!isValidImageType(vehicleImage1) || !isValidImageType(vehicleImage2) || !isValidImageType(vehicleImage3)) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "All images must be valid image files (JPEG, PNG, GIF, WebP)");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }
            
            
            long maxSize = 10 * 1024 * 1024; 
            if (vehicleImage1.getSize() > maxSize || vehicleImage2.getSize() > maxSize || vehicleImage3.getSize() > maxSize) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Each image must be smaller than 10MB");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }
            
            
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
    
    
    private ResponseEntity<?> createPendingVehicleAddRequest(String make, String model, String vehicleType, Integer year, String color,
                                                           String licensePlate, String vin, String fuelType, String transmission,
                                                           Integer seatingCapacity, Integer mileage, BigDecimal pricePerDay, String location,
                                                           String description, String features, MultipartFile vehicleImage1,
                                                           MultipartFile vehicleImage2, MultipartFile vehicleImage3, Admin currentAdmin) {
        
        try {
            
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
            
            
            if (vehicleImage1 == null || vehicleImage1.isEmpty() ||
                vehicleImage2 == null || vehicleImage2.isEmpty() ||
                vehicleImage3 == null || vehicleImage3.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "All three vehicle images are required"));
            }
            
            
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
            
            
            vehicleData.put("vehicleImage1", Base64.getEncoder().encodeToString(vehicleImage1.getBytes()));
            vehicleData.put("vehicleImage2", Base64.getEncoder().encodeToString(vehicleImage2.getBytes()));
            vehicleData.put("vehicleImage3", Base64.getEncoder().encodeToString(vehicleImage3.getBytes()));
            
            
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
    
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> updateVehicle(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        try {
            Admin currentAdmin = getCurrentAdmin();
            if (currentAdmin == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Admin not authenticated"));
            }

            
            if ("SUPER_ADMIN".equals(currentAdmin.getRole())) {
                Vehicle existingVehicle = vehicleService.getVehicleById(id);
                if (existingVehicle == null) {
                    return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Vehicle not found"));
                }

                
                String make = updates.containsKey("make") ? (String) updates.get("make") : null;
                String model = updates.containsKey("model") ? (String) updates.get("model") : null;
                String vehicleType = updates.containsKey("vehicleType") ? (String) updates.get("vehicleType") : null;
                Integer year = updates.containsKey("year") ? ((Number) updates.get("year")).intValue() : null;
                String color = updates.containsKey("color") ? (String) updates.get("color") : null;
                String licensePlate = updates.containsKey("licensePlate") ? (String) updates.get("licensePlate") : null;
                String vin = updates.containsKey("vin") ? (String) updates.get("vin") : null;
                String fuelType = updates.containsKey("fuelType") ? (String) updates.get("fuelType") : null;
                String transmission = updates.containsKey("transmission") ? (String) updates.get("transmission") : null;
                Integer seatingCapacity = updates.containsKey("seatingCapacity") ? ((Number) updates.get("seatingCapacity")).intValue() : null;
                Integer mileage = updates.containsKey("mileage") ? ((Number) updates.get("mileage")).intValue() : null;
                BigDecimal pricePerDay = updates.containsKey("pricePerDay") ? new BigDecimal(updates.get("pricePerDay").toString()) : null;
                String location = updates.containsKey("location") ? (String) updates.get("location") : null;
                String description = updates.containsKey("description") ? (String) updates.get("description") : null;
                String features = updates.containsKey("features") ? (String) updates.get("features") : null;

                
                if (licensePlate != null && !licensePlate.trim().isEmpty()) {
                    validateVehicleParameters(licensePlate.trim(), seatingCapacity, vehicleType, fuelType, transmission, location);
                } else if (seatingCapacity != null || vehicleType != null || fuelType != null || transmission != null || location != null) {
                    validateVehicleParameters(null, seatingCapacity, vehicleType, fuelType, transmission, location);
                }

                
                if (make != null && !make.trim().isEmpty()) {
                    existingVehicle.setMake(make.trim());
                }
                if (model != null && !model.trim().isEmpty()) {
                    existingVehicle.setModel(model.trim());
                }
                if (vehicleType != null && !vehicleType.trim().isEmpty()) {
                    existingVehicle.setVehicleType(vehicleType.trim());
                }
                if (year != null) {
                    existingVehicle.setYear(year);
                }
                if (color != null && !color.trim().isEmpty()) {
                    existingVehicle.setColor(color.trim());
                }
                if (licensePlate != null && !licensePlate.trim().isEmpty()) {
                    existingVehicle.setLicensePlate(licensePlate.trim().toUpperCase());
                }
                if (vin != null) {
                    if (vin.trim().isEmpty()) {
                        existingVehicle.setVin(null);
                    } else {
                        existingVehicle.setVin(vin.trim());
                    }
                }
                if (fuelType != null && !fuelType.trim().isEmpty()) {
                    existingVehicle.setFuelType(fuelType.trim());
                }
                if (transmission != null && !transmission.trim().isEmpty()) {
                    existingVehicle.setTransmission(transmission.trim());
                }
                if (seatingCapacity != null) {
                    existingVehicle.setSeatingCapacity(seatingCapacity);
                }
                if (mileage != null) {
                    existingVehicle.setMileage(mileage);
                }
                if (pricePerDay != null) {
                    existingVehicle.setPricePerDay(pricePerDay);
                }
                if (location != null && !location.trim().isEmpty()) {
                    existingVehicle.setLocation(location.trim());
                }
                if (description != null) {
                    if (description.trim().isEmpty()) {
                        existingVehicle.setDescription(null);
                    } else {
                        existingVehicle.setDescription(description.trim());
                    }
                }
                if (features != null) {
                    if (features.trim().isEmpty()) {
                        existingVehicle.setFeatures(null);
                    } else {
                        existingVehicle.setFeatures(features.trim());
                    }
                }

                Vehicle savedVehicle = vehicleService.saveVehicle(existingVehicle);
                return ResponseEntity.ok(savedVehicle);
            }

            
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("error", "Regular admins cannot update vehicles directly. Use pending requests."));

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

    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> deleteVehicle(@PathVariable Long id) {
        try {
            Admin currentAdmin = getCurrentAdmin();
            if (currentAdmin == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Admin not authenticated"));
            }

            
            if ("SUPER_ADMIN".equals(currentAdmin.getRole())) {
                vehicleService.deleteVehicle(id);
                Map<String, String> response = new HashMap<>();
                response.put("message", "Vehicle deleted successfully");
                return ResponseEntity.ok(response);
            }

            
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
    
    
    
    
    private void validateVehicleParameters(String licensePlate, Integer seatingCapacity, String vehicleType, 
                                         String fuelType, String transmission, String location) {
        
        if (licensePlate != null && !licensePlate.trim().isEmpty()) {
            String trimmedPlate = licensePlate.trim();
            if (!LICENSE_PLATE_PATTERN.matcher(trimmedPlate).matches()) {
                throw new IllegalArgumentException("License plate must be in format: AB 123 (2 letters, space, 3 numbers)");
            }
        }
        
        
        if (seatingCapacity != null) {
            if (seatingCapacity < 2) {
                throw new IllegalArgumentException("Seating capacity must be at least 2");
            }
            if (seatingCapacity > 50) {
                throw new IllegalArgumentException("Seating capacity cannot exceed 50");
            }
        }
        
        
        if (vehicleType != null && !vehicleType.trim().isEmpty()) {
            String type = vehicleType.trim();
            if (!type.equals("Sedan") && !type.equals("SUV") && 
                !type.equals("Truck") && !type.equals("Van")) {
                throw new IllegalArgumentException("Vehicle type must be one of: Sedan, SUV, Truck, Van");
            }
        }
        
        
        if (fuelType != null && !fuelType.trim().isEmpty()) {
            String fuel = fuelType.trim();
            if (!fuel.equals("Petrol") && !fuel.equals("Diesel") && 
                !fuel.equals("Electric") && !fuel.equals("Hybrid")) {
                throw new IllegalArgumentException("Fuel type must be one of: Petrol, Diesel, Electric, Hybrid");
            }
        }
        
        
        if (transmission != null && !transmission.trim().isEmpty()) {
            String trans = transmission.trim();
            if (!trans.equals("Automatic") && !trans.equals("Manual")) {
                throw new IllegalArgumentException("Transmission must be either Automatic or Manual");
            }
        }
        
        
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
