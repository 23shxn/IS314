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
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.GrantedAuthority;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    @Autowired
    private ReservationService reservationService;

    @Autowired
    private VehicleService vehicleService;

    @Autowired
    private EmailService emailService;

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
                reservation.setCreatedAt(LocalDateTime.now());
            }

            // Fetch vehicle from database
            Vehicle vehicle = vehicleService.getVehicleById(reservation.getVehicle().getId());
            if (vehicle == null) {
                return ResponseEntity.status(404).body(new ErrorResponse("Vehicle not found"));
            }
            reservation.setVehicle(vehicle);

            // Fetch user details and populate reservation
            Optional<User> userOpt = userRepository.findById(reservation.getUserId());
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                reservation.setTitle(user.getTitle());
                reservation.setFirstName(user.getFirstName());
                reservation.setLastName(user.getLastName());
            }

            // Ensure status is set
            if (reservation.getStatus() == null || reservation.getStatus().isEmpty()) {
                reservation.setStatus("Confirmed");
            }

            // Save reservation via service
            Reservation savedReservation = reservationService.createReservation(reservation);

            // Mark vehicle as rented after successful reservation
            vehicle.setStatus("Rented");
            vehicleRepository.save(vehicle);

            // Send reservation confirmation email
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
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN") || auth.getAuthority().equals("ROLE_SUPER_ADMIN"));

            Optional<Reservation> reservationOpt = reservationRepository.findById(id);
            if (!reservationOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Reservation reservation = reservationOpt.get();

            if (!isAdmin) {
                // Must be a regular user, check ownership
                String currentUserEmail = authentication.getName();
                Optional<User> currentUserOpt = userRepository.findByEmailForAuth(currentUserEmail);
                if (!currentUserOpt.isPresent()) {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not authenticated"));
                }
                User currentUser = currentUserOpt.get();
                boolean isOwner = reservation.getUserId().equals(currentUser.getId());
                if (!isOwner) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "You can only cancel your own reservations"));
                }
            }
            // If admin or owner, proceed

            // Update reservation status
            reservation.setStatus("Cancelled");
            reservationRepository.save(reservation);

            // Update vehicle status - make it available again
            Vehicle vehicle = reservation.getVehicle();
            if (vehicle != null) {
                vehicle.setStatus("Available");
                vehicleRepository.save(vehicle);
            }

            // Calculate cancellation fee based on hours to pickup
            BigDecimal cancellationFee = BigDecimal.ZERO;
            if (reservation.getRentalDate() != null) {
                long hoursToPickup = java.time.Duration.between(java.time.LocalDateTime.now(), reservation.getRentalDate().atStartOfDay()).toHours();
                BigDecimal totalAmount = reservation.getTotalPrice();

                if (hoursToPickup < 24) {
                    cancellationFee = totalAmount.multiply(BigDecimal.valueOf(0.3)); // 30%
                } else if (hoursToPickup < 72) {
                    cancellationFee = totalAmount.multiply(BigDecimal.valueOf(0.1)); // 10%
                }
                // No fee if more than 72 hours
            }

            // Send cancellation email to user
            Optional<User> userOpt = userRepository.findById(reservation.getUserId());
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                String vehicleName = vehicle != null ? vehicle.getMake() + " " + vehicle.getModel() : "Unknown Vehicle";
                emailService.sendCancellationEmail(
                    user.getEmail(),
                    user.getFirstName(),
                    user.getLastName(),
                    reservation.getId(),
                    vehicleName,
                    cancellationFee.setScale(2, java.math.RoundingMode.HALF_UP).toString(),
                    reservation.getTotalPrice().toString()
                );
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

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserReservations(@PathVariable Long userId, Authentication authentication) {
        try {
            boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN") || auth.getAuthority().equals("ROLE_SUPER_ADMIN"));

            if (!isAdmin) {
                // Must be a regular user, check ownership
                String currentUserEmail = authentication.getName();
                Optional<User> currentUserOpt = userRepository.findByEmailForAuth(currentUserEmail);
                if (!currentUserOpt.isPresent()) {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not authenticated"));
                }
                User currentUser = currentUserOpt.get();
                boolean isOwner = userId.equals(currentUser.getId());
                if (!isOwner) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "You can only view your own reservations"));
                }
            }
            // If admin or owner, proceed

            List<Reservation> reservations = reservationRepository.findByUserId(userId);
            return ResponseEntity.ok(reservations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to get reservations: " + e.getMessage()));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllReservations() {
        try {
            // Use the new query to eagerly fetch vehicles
            List<Reservation> reservations = reservationRepository.findAllWithVehicle();

            // Populate user details for reservations that don't have them
            for (Reservation res : reservations) {
                if (res.getFirstName() == null || res.getFirstName().isEmpty()) {
                    Optional<User> userOpt = userRepository.findById(res.getUserId());
                    if (userOpt.isPresent()) {
                        User user = userOpt.get();
                        res.setTitle(user.getTitle());
                        res.setFirstName(user.getFirstName());
                        res.setLastName(user.getLastName());
                    }
                }
            }

            return ResponseEntity.ok(reservations);
        } catch (Exception e) {
            // Log the full stack trace for debugging
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to get all reservations: " + e.getMessage()));
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
    private BigDecimal totalPrice;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

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
    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}