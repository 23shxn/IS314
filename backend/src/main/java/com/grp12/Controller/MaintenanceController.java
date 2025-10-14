package com.grp12.Controller;

import com.grp12.Model.MaintenanceRecord;
import com.grp12.Repository.MaintenanceRecordRepository;
import com.grp12.Services.ImageCompressionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/maintenance")

public class MaintenanceController {

    @Autowired
    private MaintenanceRecordRepository maintenanceRecordRepository;

    @Autowired
    private ImageCompressionService imageCompressionService;

    // Get all maintenance records (ADMIN, SUPER_ADMIN)
    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> getAllMaintenanceRecords() {
        try {
            List<MaintenanceRecord> records = maintenanceRecordRepository.findAllOrderByCompletedAtDesc();
            return ResponseEntity.ok(records);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch maintenance records: " + e.getMessage()));
        }
    }

    // Get maintenance records by car ID (ADMIN, SUPER_ADMIN)
    @GetMapping("/car/{carId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> getMaintenanceRecordsByCar(@PathVariable Long carId) {
        try {
            List<MaintenanceRecord> records = maintenanceRecordRepository.findByCarIdOrderByDateDesc(carId);
            return ResponseEntity.ok(records);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch maintenance records for car: " + e.getMessage()));
        }
    }

    // Create maintenance record (SUPER_ADMIN only - for direct creation)
    @PostMapping("/create")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> createMaintenanceRecord(
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
            // Validate required fields
            if (carId == null || type == null || type.trim().isEmpty() || date == null || date.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Car ID, type, and date are required"));
            }

            // Create maintenance record
            MaintenanceRecord record = new MaintenanceRecord();
            record.setCarId(carId);
            record.setType(type.trim());
            if (description != null && !description.trim().isEmpty()) record.setDescription(description.trim());
            if (cost != null && !cost.trim().isEmpty()) record.setCost(new BigDecimal(cost));
            record.setDate(LocalDate.parse(date).atStartOfDay());
            if (nextDate != null && !nextDate.trim().isEmpty()) record.setNextDate(LocalDate.parse(nextDate).atStartOfDay());
            if (mechanic != null && !mechanic.trim().isEmpty()) record.setMechanic(mechanic.trim());
            if (status != null && !status.trim().isEmpty()) record.setStatus(status.trim());
            else record.setStatus("Completed");
            if (notes != null && !notes.trim().isEmpty()) record.setNotes(notes.trim());
            if (mileage != null) record.setMileage(mileage);
            if (receipt != null && !receipt.isEmpty()) {
                try {
                    byte[] bytes = receipt.getBytes();
                    String base64 = Base64.getEncoder().encodeToString(bytes);
                    String compressedBase64 = imageCompressionService.compressBase64Image(base64);
                    record.setReceipt(compressedBase64);
                } catch (Exception e) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Failed to process receipt image"));
                }
            }

            MaintenanceRecord savedRecord = maintenanceRecordRepository.save(record);

            return ResponseEntity.ok().body(Map.of(
                "message", "Maintenance record created successfully",
                "recordId", savedRecord.getId()
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to create maintenance record: " + e.getMessage()));
        }
    }

    // Update maintenance record (SUPER_ADMIN only)
    @PutMapping("/{recordId}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> updateMaintenanceRecord(
            @PathVariable Long recordId,
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "cost", required = false) String cost,
            @RequestParam(value = "date", required = false) String date,
            @RequestParam(value = "nextDate", required = false) String nextDate,
            @RequestParam(value = "mechanic", required = false) String mechanic,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "notes", required = false) String notes,
            @RequestParam(value = "mileage", required = false) Integer mileage,
            @RequestParam(value = "receipt", required = false) MultipartFile receipt) {

        try {
            Optional<MaintenanceRecord> recordOpt = maintenanceRecordRepository.findById(recordId);
            if (!recordOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Maintenance record not found"));
            }

            MaintenanceRecord record = recordOpt.get();

            // Update fields if provided
            if (type != null && !type.trim().isEmpty()) record.setType(type.trim());
            if (description != null) record.setDescription(description.trim());
            if (cost != null && !cost.trim().isEmpty()) record.setCost(new BigDecimal(cost));
            if (date != null && !date.trim().isEmpty()) record.setDate(LocalDate.parse(date).atStartOfDay());
            if (nextDate != null) {
                if (nextDate.trim().isEmpty()) record.setNextDate(null);
                else record.setNextDate(LocalDate.parse(nextDate).atStartOfDay());
            }
            if (mechanic != null) record.setMechanic(mechanic.trim());
            if (status != null && !status.trim().isEmpty()) record.setStatus(status.trim());
            if (notes != null) record.setNotes(notes.trim());
            if (mileage != null) record.setMileage(mileage);
            if (receipt != null && !receipt.isEmpty()) {
                try {
                    byte[] bytes = receipt.getBytes();
                    String base64 = Base64.getEncoder().encodeToString(bytes);
                    String compressedBase64 = imageCompressionService.compressBase64Image(base64);
                    record.setReceipt(compressedBase64);
                } catch (Exception e) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Failed to process receipt image"));
                }
            }

            maintenanceRecordRepository.save(record);

            return ResponseEntity.ok().body(Map.of(
                "message", "Maintenance record updated successfully"
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update maintenance record: " + e.getMessage()));
        }
    }

    // Delete maintenance record (SUPER_ADMIN only)
    @DeleteMapping("/{recordId}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> deleteMaintenanceRecord(@PathVariable Long recordId) {
        try {
            Optional<MaintenanceRecord> recordOpt = maintenanceRecordRepository.findById(recordId);
            if (!recordOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Maintenance record not found"));
            }

            maintenanceRecordRepository.deleteById(recordId);

            return ResponseEntity.ok().body(Map.of(
                "message", "Maintenance record deleted successfully"
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to delete maintenance record: " + e.getMessage()));
        }
    }
}
