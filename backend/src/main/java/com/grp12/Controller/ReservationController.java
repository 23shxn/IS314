package com.grp12.Controller;

import com.grp12.Model.Reservation;
import com.grp12.Model.Vehicle;
import com.grp12.Services.ReservationService;
import com.grp12.Services.VehicleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true", allowedHeaders = "*")
public class ReservationController {

    @Autowired
    private ReservationService reservationService;

    @Autowired
    private VehicleService vehicleService;

    @PostMapping
    public ResponseEntity<?> createReservation(@RequestBody Reservation reservation) {
        try {
            // Validate required fields
            if (reservation.getVehicle() == null || reservation.getVehicle().getId() == null) {
                return ResponseEntity.status(400).body(new ErrorResponse("Vehicle ID is required"));
            }
            if (reservation.getUserId() == null) {
                return ResponseEntity.status(400).body(new ErrorResponse("User ID is required"));
            }
            if (reservation.getRentalDate() == null) {
                return ResponseEntity.status(400).body(new ErrorResponse("Rental date is required"));
            }
            if (reservation.getReturnDate() == null) {
                return ResponseEntity.status(400).body(new ErrorResponse("Return date is required"));
            }
            if (reservation.getTotalPrice() == null) {
                return ResponseEntity.status(400).body(new ErrorResponse("Total price is required"));
            }
            if (reservation.getCreatedAt() == null) {
                reservation.setCreatedAt(java.time.LocalDateTime.now());
            }

            // Fetch vehicle from database
            Vehicle vehicle = vehicleService.getVehicleById(reservation.getVehicle().getId());
            if (vehicle == null) {
                return ResponseEntity.status(404).body(new ErrorResponse("Vehicle not found"));
            }
            reservation.setVehicle(vehicle);

            // Ensure status is set
            if (reservation.getStatus() == null || reservation.getStatus().isEmpty()) {
                reservation.setStatus("Confirmed");
            }

            // Save reservation via service
            Reservation savedReservation = reservationService.createReservation(reservation);

            // Create a lightweight response to avoid sending large vehicle data (e.g., base64 images)
            ReservationResponse response = new ReservationResponse();
            response.setId(savedReservation.getId());
            response.setVehicleId(savedReservation.getVehicle().getId());
            response.setUserId(savedReservation.getUserId());
            response.setRentalDate(savedReservation.getRentalDate());
            response.setReturnDate(savedReservation.getReturnDate());
            response.setStatus(savedReservation.getStatus());
            response.setAmenities(savedReservation.getAmenities());
            response.setTotalPrice(savedReservation.getTotalPrice());
            response.setCreatedAt(savedReservation.getCreatedAt());
            response.setUpdatedAt(savedReservation.getUpdatedAt());

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(new ErrorResponse(e.getMessage()));
        } catch (DateTimeParseException e) {
            return ResponseEntity.status(400).body(new ErrorResponse("Invalid date format: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ErrorResponse("Failed to create reservation: " + e.getMessage()));
        }
    }
}

class ErrorResponse {
    private String error;

    public ErrorResponse(String error) {
        this.error = error;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }
}

class ReservationResponse {
    private Long id;
    private Long vehicleId;
    private Long userId;
    private LocalDate rentalDate;
    private LocalDate returnDate;
    private String status;
    private List<String> amenities;
    private java.math.BigDecimal totalPrice;
    private java.time.LocalDateTime createdAt;
    private java.time.LocalDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getVehicleId() { return vehicleId; }
    public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public LocalDate getRentalDate() { return rentalDate; }
    public void setRentalDate(LocalDate rentalDate) { this.rentalDate = rentalDate; }
    public LocalDate getReturnDate() { return returnDate; }
    public void setReturnDate(LocalDate returnDate) { this.returnDate = returnDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public List<String> getAmenities() { return amenities; }
    public void setAmenities(List<String> amenities) { this.amenities = amenities; }
    public java.math.BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(java.math.BigDecimal totalPrice) { this.totalPrice = totalPrice; }
    public java.time.LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(java.time.LocalDateTime createdAt) { this.createdAt = createdAt; }
    public java.time.LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(java.time.LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}