package com.grp12.Controller;

import com.grp12.Model.PendingVehicleChange;
import com.grp12.Model.Admin;
import com.grp12.Model.Vehicle;
import com.grp12.Repository.PendingVehicleChangeRepository;
import com.grp12.Services.AdminService;
import com.grp12.Services.VehicleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;
import java.math.BigDecimal;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/vehicles/pending")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class PendingVehicleController {

    @Autowired
    private PendingVehicleChangeRepository pendingVehicleChangeRepository;

    @Autowired
    private AdminService adminService;

    @Autowired
    private VehicleService vehicleService;

    private final ObjectMapper objectMapper = new ObjectMapper();

   
    @PostMapping("/add")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> submitVehicleAddRequest(
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
            @RequestParam("pricePerDay") String pricePerDay,
            @RequestParam("location") String location,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "features", required = false) String features,
            @RequestParam("vehicleImage1") MultipartFile vehicleImage1,
            @RequestParam("vehicleImage2") MultipartFile vehicleImage2,
            @RequestParam("vehicleImage3") MultipartFile vehicleImage3) {

        try {
            // Get current admin
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String currentUsername = authentication.getName();
            Admin currentAdmin = adminService.getAdminByEmail(currentUsername);
            if (currentAdmin == null) {
                currentAdmin = adminService.getAdminByUsername(currentUsername);
            }

            if (currentAdmin == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Admin not found"));
            }

            // Check if super admin - allow direct add
            if ("SUPER_ADMIN".equals(currentAdmin.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Super admins should use direct add endpoint"));
            }

            // Validate required fields
            if (make == null || make.trim().isEmpty() ||
                model == null || model.trim().isEmpty() ||
                vehicleType == null || vehicleType.trim().isEmpty() ||
                year == null || color == null || color.trim().isEmpty() ||
                licensePlate == null || licensePlate.trim().isEmpty() ||
                fuelType == null || fuelType.trim().isEmpty() ||
                transmission == null || transmission.trim().isEmpty() ||
                seatingCapacity == null || pricePerDay == null || pricePerDay.trim().isEmpty() ||
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
            vehicleData.put("vehicleImage1", java.util.Base64.getEncoder().encodeToString(vehicleImage1.getBytes()));
            vehicleData.put("vehicleImage2", java.util.Base64.getEncoder().encodeToString(vehicleImage2.getBytes()));
            vehicleData.put("vehicleImage3", java.util.Base64.getEncoder().encodeToString(vehicleImage3.getBytes()));

            // Create pending request
            PendingVehicleChange pendingRequest = new PendingVehicleChange(
                new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(vehicleData),
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

    // Submit pending vehicle remove request (ADMIN only)
    @PostMapping("/remove/{vehicleId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> submitVehicleRemoveRequest(@PathVariable Long vehicleId) {
        try {
            // Get current admin
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String currentUsername = authentication.getName();
            Admin currentAdmin = adminService.getAdminByEmail(currentUsername);
            if (currentAdmin == null) {
                currentAdmin = adminService.getAdminByUsername(currentUsername);
            }

            if (currentAdmin == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Admin not found"));
            }

            // Check if super admin - allow direct remove
            if ("SUPER_ADMIN".equals(currentAdmin.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Super admins should use direct remove endpoint"));
            }

            // Create pending request
            PendingVehicleChange pendingRequest = new PendingVehicleChange(vehicleId, currentAdmin.getId());
            PendingVehicleChange savedRequest = pendingVehicleChangeRepository.save(pendingRequest);

            return ResponseEntity.ok().body(Map.of(
                "message", "Vehicle remove request submitted for approval",
                "requestId", savedRequest.getId()
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to submit vehicle remove request: " + e.getMessage()));
        }
    }

    // Get all pending requests (SUPER_ADMIN only)
    @GetMapping("/all")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> getAllPendingRequests() {
        try {
            List<PendingVehicleChange> pendingRequests = pendingVehicleChangeRepository.findByStatusOrderByRequestedAtDesc("PENDING");
            return ResponseEntity.ok(pendingRequests);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch pending requests: " + e.getMessage()));
        }
    }

    // Approve pending request (SUPER_ADMIN only)
    @PostMapping("/{requestId}/approve")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> approvePendingRequest(@PathVariable Long requestId) {
        try {
            Optional<PendingVehicleChange> requestOpt = pendingVehicleChangeRepository.findById(requestId);
            if (!requestOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Pending request not found"));
            }

            PendingVehicleChange request = requestOpt.get();
            if (!"PENDING".equals(request.getStatus())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Request is not in pending status"));
            }

            // Get current super admin
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String currentUsername = authentication.getName();
            Admin currentAdmin = adminService.getAdminByEmail(currentUsername);
            if (currentAdmin == null) {
                currentAdmin = adminService.getAdminByUsername(currentUsername);
            }

            // Update request status
            request.setStatus("APPROVED");
            request.setApprovedBy(currentAdmin.getId());
            request.setApprovedAt(LocalDateTime.now());

            // Perform the actual operation
            if ("ADD".equals(request.getChangeType())) {
                try {
                    Map<String, Object> vehicleData = objectMapper.readValue(request.getVehicleData(), Map.class);
                    Vehicle vehicle = new Vehicle();
                    vehicle.setMake((String) vehicleData.get("make"));
                    vehicle.setModel((String) vehicleData.get("model"));
                    vehicle.setVehicleType((String) vehicleData.get("vehicleType"));
                    vehicle.setYear((Integer) vehicleData.get("year"));
                    vehicle.setColor((String) vehicleData.get("color"));
                    vehicle.setLicensePlate((String) vehicleData.get("licensePlate"));
                    if (vehicleData.containsKey("vin")) vehicle.setVin((String) vehicleData.get("vin"));
                    vehicle.setFuelType((String) vehicleData.get("fuelType"));
                    vehicle.setTransmission((String) vehicleData.get("transmission"));
                    vehicle.setSeatingCapacity((Integer) vehicleData.get("seatingCapacity"));
                    if (vehicleData.containsKey("mileage")) vehicle.setMileage((Integer) vehicleData.get("mileage"));
                    vehicle.setPricePerDay(new BigDecimal(vehicleData.get("pricePerDay").toString()));
                    vehicle.setLocation((String) vehicleData.get("location"));
                    if (vehicleData.containsKey("description")) vehicle.setDescription((String) vehicleData.get("description"));
                    if (vehicleData.containsKey("features")) vehicle.setFeatures((String) vehicleData.get("features"));
                    vehicle.setStatus("Available");
                    vehicle.setVehicleImage1((String) vehicleData.get("vehicleImage1"));
                    vehicle.setVehicleImage2((String) vehicleData.get("vehicleImage2"));
                    vehicle.setVehicleImage3((String) vehicleData.get("vehicleImage3"));
                    vehicleService.saveVehicle(vehicle);
                } catch (Exception e) {
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", "Failed to create vehicle: " + e.getMessage()));
                }
            } else if ("REMOVE".equals(request.getChangeType())) {
                try {
                    vehicleService.deleteVehicle(request.getVehicleId());
                } catch (Exception e) {
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", "Failed to delete vehicle: " + e.getMessage()));
                }
            }

            pendingVehicleChangeRepository.save(request);

            return ResponseEntity.ok().body(Map.of(
                "message", "Vehicle change request approved successfully",
                "requestId", requestId
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to approve request: " + e.getMessage()));
        }
    }

    // Reject pending request (SUPER_ADMIN only)
    @PostMapping("/{requestId}/reject")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> rejectPendingRequest(
            @PathVariable Long requestId,
            @RequestBody Map<String, String> rejectionData) {

        try {
            Optional<PendingVehicleChange> requestOpt = pendingVehicleChangeRepository.findById(requestId);
            if (!requestOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Pending request not found"));
            }

            PendingVehicleChange request = requestOpt.get();
            if (!"PENDING".equals(request.getStatus())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Request is not in pending status"));
            }

            String rejectionReason = rejectionData.get("reason");

            // Get current super admin
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String currentUsername = authentication.getName();
            Admin currentAdmin = adminService.getAdminByEmail(currentUsername);
            if (currentAdmin == null) {
                currentAdmin = adminService.getAdminByUsername(currentUsername);
            }

            // Update request status
            request.setStatus("REJECTED");
            request.setApprovedBy(currentAdmin.getId());
            request.setApprovedAt(LocalDateTime.now());
            if (rejectionReason != null && !rejectionReason.trim().isEmpty()) {
                request.setRejectionReason(rejectionReason.trim());
            }
            pendingVehicleChangeRepository.save(request);

            return ResponseEntity.ok().body(Map.of(
                "message", "Vehicle change request rejected",
                "requestId", requestId
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to reject request: " + e.getMessage()));
        }
    }
}
