package com.grp12.Controller;

import com.grp12.Model.PendingMaintenanceRecord;
import com.grp12.Model.MaintenanceRecord;
import com.grp12.Model.Admin;
import com.grp12.Repository.PendingMaintenanceRecordRepository;
import com.grp12.Repository.MaintenanceRecordRepository;
import com.grp12.Services.AdminService;
import com.grp12.Services.ImageCompressionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

@RestController
@RequestMapping("/api/maintenance/pending")

public class PendingMaintenanceController {

    @Autowired
    private PendingMaintenanceRecordRepository pendingMaintenanceRecordRepository;

    @Autowired
    private MaintenanceRecordRepository maintenanceRecordRepository;

    @Autowired
    private AdminService adminService;

    @Autowired
    private ImageCompressionService imageCompressionService;

    // Submit pending maintenance record request (ADMIN only)
    @PostMapping("/add")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> submitMaintenanceRequest(
            @RequestParam("carId") Long carId,
            @RequestParam("type") String type,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "cost", required = false) String cost,
            @RequestParam("date") String date,
            @RequestParam(value = "nextDate", required = false) String nextDate,
            @RequestParam(value = "mechanic", required = false) String mechanic,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "notes", required = false) String notes,
            @RequestParam(value = "mileage", required = false) Integer mileage,
            @RequestParam(value = "receipt", required = false) MultipartFile receipt) {

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

           
            
            if ("SUPER_ADMIN".equals(currentAdmin.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Super admins should use direct add endpoint"));
            }

            // Validate required fields
            if (carId == null || type == null || type.trim().isEmpty() || date == null || date.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Car ID, type, and date are required"));
            }

            // Create pending maintenance record
            PendingMaintenanceRecord pendingRecord = new PendingMaintenanceRecord();
            pendingRecord.setApprovalStatus("PENDING");
            pendingRecord.setCarId(carId);
            pendingRecord.setType(type.trim());
            if (description != null && !description.trim().isEmpty()) pendingRecord.setDescription(description.trim());
            if (cost != null && !cost.trim().isEmpty()) pendingRecord.setCost(new BigDecimal(cost));
            pendingRecord.setDate(LocalDate.parse(date).atStartOfDay());
            if (nextDate != null && !nextDate.trim().isEmpty()) {
                pendingRecord.setNextDate(LocalDate.parse(nextDate).atStartOfDay());
            } else {
                // Auto-calculate nextDate as current date + 3 months
                pendingRecord.setNextDate(pendingRecord.getDate().toLocalDate().plusMonths(3).atStartOfDay());
            }
            if (mechanic != null && !mechanic.trim().isEmpty()) pendingRecord.setMechanic(mechanic.trim());
            if (status != null && !status.trim().isEmpty()) pendingRecord.setStatus(status.trim());
            else pendingRecord.setStatus("Completed");
            if (notes != null && !notes.trim().isEmpty()) pendingRecord.setNotes(notes.trim());
            if (mileage != null) pendingRecord.setMileage(mileage);
            if (receipt != null && !receipt.isEmpty()) {
                try {
                    byte[] bytes = receipt.getBytes();
                    String base64 = Base64.getEncoder().encodeToString(bytes);
                    String compressedBase64 = imageCompressionService.compressBase64Image(base64);
                    pendingRecord.setReceipt(compressedBase64);
                } catch (Exception e) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Failed to process receipt image"));
                }
            }
            pendingRecord.setRequestedBy(currentAdmin.getId());

            PendingMaintenanceRecord savedRecord = pendingMaintenanceRecordRepository.save(pendingRecord);

            return ResponseEntity.ok().body(Map.of(
                "message", "Maintenance record request submitted for approval",
                "requestId", savedRecord.getId()
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to submit maintenance request: " + e.getMessage()));
        }
    }

    // Get all pending maintenance requests (SUPER_ADMIN only)
    @GetMapping("/all")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> getAllPendingMaintenanceRequests() {
        try {
            List<PendingMaintenanceRecord> pendingRequests = pendingMaintenanceRecordRepository.findByApprovalStatusOrderByRequestedAtDesc("PENDING");
            return ResponseEntity.ok(pendingRequests);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch pending maintenance requests: " + e.getMessage()));
        }
    }

    // Approve pending maintenance request (SUPER_ADMIN only)
    @PostMapping("/{requestId}/approve")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> approvePendingMaintenanceRequest(@PathVariable Long requestId) {
        try {
            Optional<PendingMaintenanceRecord> requestOpt = pendingMaintenanceRecordRepository.findById(requestId);
            if (!requestOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Pending request not found"));
            }

            PendingMaintenanceRecord request = requestOpt.get();
            if (!"PENDING".equals(request.getApprovalStatus())) {
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
            request.setApprovalStatus("APPROVED");
            request.setApprovedBy(currentAdmin.getId());
            request.setApprovedAt(LocalDateTime.now());
            pendingMaintenanceRecordRepository.save(request);

            // Create actual maintenance record from approved request
            MaintenanceRecord maintenanceRecord = new MaintenanceRecord(request);
            maintenanceRecordRepository.save(maintenanceRecord);

            return ResponseEntity.ok().body(Map.of(
                "message", "Maintenance request approved successfully",
                "requestId", requestId,
                "maintenanceRecordId", maintenanceRecord.getId()
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to approve request: " + e.getMessage()));
        }
    }

    // Reject pending maintenance request (SUPER_ADMIN only)
    @PostMapping("/{requestId}/reject")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> rejectPendingMaintenanceRequest(
            @PathVariable Long requestId,
            @RequestBody Map<String, String> rejectionData) {

        try {
            Optional<PendingMaintenanceRecord> requestOpt = pendingMaintenanceRecordRepository.findById(requestId);
            if (!requestOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Pending request not found"));
            }

            PendingMaintenanceRecord request = requestOpt.get();
            if (!"PENDING".equals(request.getApprovalStatus())) {
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
            request.setApprovalStatus("REJECTED");
            request.setApprovedBy(currentAdmin.getId());
            request.setApprovedAt(LocalDateTime.now());
            if (rejectionReason != null && !rejectionReason.trim().isEmpty()) {
                request.setRejectionReason(rejectionReason.trim());
            }
            pendingMaintenanceRecordRepository.save(request);

            return ResponseEntity.ok().body(Map.of(
                "message", "Maintenance request rejected",
                "requestId", requestId
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to reject request: " + e.getMessage()));
        }
    }
}
