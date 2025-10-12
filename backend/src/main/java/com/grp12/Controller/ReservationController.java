package com.grp12.Controller;

import com.grp12.Model.Reservation;
import com.grp12.Model.User;
import com.grp12.Model.Vehicle;
import com.grp12.Repository.ReservationRepository;
import com.grp12.Repository.UserRepository;
import com.grp12.Repository.VehicleRepository;
import com.grp12.Services.EmailService;
import com.grp12.Services.ReservationService;
import com.grp12.Services.VehicleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/reservations")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true", allowedHeaders = "*")
public class ReservationController {

    @Autowired
    private ReservationService reservationService;

    @Autowired
    private VehicleService vehicleService;

    @Autowired
    private EmailService emailService;

    // Add these missing repository dependencies
    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private UserRepository userRepository;

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

            // Mark vehicle as rented after successful reservation
            vehicle.setStatus("Rented"); // Use status instead of availability
            vehicleRepository.save(vehicle);

            // Send reservation confirmation email
            Optional<User> userOpt = userRepository.findById(savedReservation.getUserId());
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                String vehicleName = vehicle.getMake() + " " + vehicle.getModel();
                emailService.sendReservationConfirmationEmail(
                    user.getEmail(),
                    user.getFirstName(),
                    user.getLastName(),
                    savedReservation.getId(),
                    vehicleName,
                    savedReservation.getRentalDate().toString(),
                    savedReservation.getReturnDate().toString(),
                    savedReservation.getTotalPrice().toString()
                );
            }

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

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelReservation(@PathVariable Long id) {
        try {
            Optional<Reservation> reservationOpt = reservationRepository.findById(id);
            if (!reservationOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Reservation reservation = reservationOpt.get();

            // Update reservation status
            reservation.setStatus("Cancelled");
            reservationRepository.save(reservation);

            // Update vehicle status - make it available again
            Vehicle vehicle = reservation.getVehicle();
            if (vehicle != null) {
                vehicle.setStatus("Available"); // Use status instead of availability
                vehicleRepository.save(vehicle);
            }

            // Send cancellation email to user
            Optional<User> userOpt = userRepository.findById(reservation.getUserId());
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                String vehicleName = vehicle != null ? vehicle.getMake() + " " + vehicle.getModel() : "Unknown Vehicle";
                emailService.sendCancellationEmail(user.getEmail(), user.getFirstName(), user.getLastName(), reservation.getId(), vehicleName);
            }

            return ResponseEntity.ok().body(Map.of(
                "message", "Reservation cancelled successfully",
                "reservation", reservation
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to cancel reservation: " + e.getMessage()));
        }
    }

    // Add endpoint to get user reservations
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserReservations(@PathVariable Long userId) {
        try {
            List<Reservation> reservations = reservationRepository.findByUserId(userId);
            return ResponseEntity.ok(reservations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to get reservations: " + e.getMessage()));
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

    // Getters and setters
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