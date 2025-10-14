package com.grp12.Services;

import com.grp12.Model.Reservation;
import com.grp12.Model.Vehicle;
import com.grp12.Repository.ReservationRepository;
import com.grp12.Repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

@Service
@Transactional
public class ReservationService {

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    private static final List<String> VALID_AMENITIES = Arrays.asList("none", "baby-sitter", "gps", "power-bank");
    private static final BigDecimal BABY_SITTER_PRICE = new BigDecimal("20.00");
    private static final BigDecimal GPS_PRICE = new BigDecimal("10.00");
    private static final BigDecimal POWER_BANK_PRICE = new BigDecimal("5.00");
    private static final BigDecimal NONE_PRICE = BigDecimal.ZERO;

    public Reservation createReservation(Reservation reservation) {
        System.out.println("=== RESERVATION DEBUG START ===");
        System.out.println("Received reservation: " + reservation);
        System.out.println("Vehicle: " + reservation.getVehicle());
        System.out.println("Vehicle ID: " + (reservation.getVehicle() != null ? reservation.getVehicle().getId() : "null"));
        System.out.println("User ID: " + reservation.getUserId());
        System.out.println("Rental Date: " + reservation.getRentalDate());
        System.out.println("Return Date: " + reservation.getReturnDate());
        System.out.println("Total Price: " + reservation.getTotalPrice());
        System.out.println("Amenities: " + reservation.getAmenities());
        
        try {
            
            if (reservation.getVehicle() == null) {
                System.out.println("ERROR: Vehicle is null");
                throw new IllegalArgumentException("Vehicle is required");
            }
            System.out.println("✓ Vehicle validation passed");
            
            if (reservation.getUserId() == null) {
                System.out.println("ERROR: User ID is null");
                throw new IllegalArgumentException("User ID is required");
            }
            System.out.println("✓ User ID validation passed");
            
            if (reservation.getRentalDate() == null || reservation.getReturnDate() == null) {
                System.out.println("ERROR: Dates are null");
                throw new IllegalArgumentException("Rental and return dates are required");
            }
            System.out.println("✓ Date validation passed");
            
            if (reservation.getReturnDate().isBefore(reservation.getRentalDate())) {
                System.out.println("ERROR: Return date before rental date");
                throw new IllegalArgumentException("Return date must be after rental date");
            }
            System.out.println("✓ Date order validation passed");
            
            if (reservation.getTotalPrice() == null || reservation.getTotalPrice().compareTo(BigDecimal.ZERO) <= 0) {
                System.out.println("ERROR: Invalid total price");
                throw new IllegalArgumentException("Total price must be greater than zero");
            }
            System.out.println("✓ Price validation passed");

            
            if (reservation.getAmenities() == null || reservation.getAmenities().isEmpty()) {
                System.out.println("ERROR: No amenities provided");
                throw new IllegalArgumentException("At least one amenity or 'none' is required");
            }
            System.out.println("✓ Amenities exist validation passed");
            
            for (String amenity : reservation.getAmenities()) {
                if (!VALID_AMENITIES.contains(amenity)) {
                    System.out.println("ERROR: Invalid amenity: " + amenity);
                    throw new IllegalArgumentException("Invalid amenity: " + amenity);
                }
            }
            System.out.println("✓ Amenities validity validation passed");
            
            if (reservation.getAmenities().contains("none") && reservation.getAmenities().size() > 1) {
                System.out.println("ERROR: 'none' combined with other amenities");
                throw new IllegalArgumentException("'none' cannot be combined with other amenities");
            }
            System.out.println("✓ Amenities 'none' validation passed");

            
            System.out.println("Looking up vehicle with ID: " + reservation.getVehicle().getId());
            Vehicle vehicle = vehicleRepository.findById(reservation.getVehicle().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Vehicle not found"));
            System.out.println("Found vehicle: " + vehicle.getMake() + " " + vehicle.getModel() + " - Status: " + vehicle.getStatus());
            
            if (!"Available".equals(vehicle.getStatus())) {
                System.out.println("ERROR: Vehicle not available, status: " + vehicle.getStatus());
                throw new IllegalArgumentException("Vehicle is not available");
            }
            System.out.println("✓ Vehicle availability validation passed");

            
            long totalDays = reservation.getReturnDate().toEpochDay() - reservation.getRentalDate().toEpochDay() + 1;
            BigDecimal basePrice = vehicle.getPricePerDay().multiply(new BigDecimal(totalDays));
            BigDecimal amenityCost = calculateAmenityCost(reservation.getAmenities());
            BigDecimal expectedTotalPrice = basePrice.add(amenityCost);
            
            System.out.println("Price calculation:");
            System.out.println("- Total days: " + totalDays);
            System.out.println("- Price per day: " + vehicle.getPricePerDay());
            System.out.println("- Base price: " + basePrice);
            System.out.println("- Amenity cost: " + amenityCost);
            System.out.println("- Expected total: " + expectedTotalPrice);
            System.out.println("- Received total: " + reservation.getTotalPrice());
            
            BigDecimal tolerance = new BigDecimal("0.01");
            if (reservation.getTotalPrice().subtract(expectedTotalPrice).abs().compareTo(tolerance) > 0) {
                System.out.println("ERROR: Price mismatch!");
                throw new IllegalArgumentException("Total price mismatch. Expected: " + expectedTotalPrice + ", Received: " + reservation.getTotalPrice());
            }
            System.out.println("✓ Price calculation validation passed");

            
            vehicle.setStatus("Rented");
            vehicleRepository.save(vehicle);
            System.out.println("✓ Vehicle status updated to Rented");

            
            Reservation savedReservation = reservationRepository.save(reservation);
            System.out.println("✓ Reservation saved with ID: " + savedReservation.getId());
            System.out.println("=== RESERVATION DEBUG END ===");
            
            return savedReservation;
            
        } catch (Exception e) {
            System.out.println("EXCEPTION in createReservation: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    private BigDecimal calculateAmenityCost(List<String> amenities) {
        if (amenities == null || amenities.isEmpty() || amenities.contains("none")) {
            return BigDecimal.ZERO;
        }
        BigDecimal cost = BigDecimal.ZERO;
        for (String amenity : amenities) {
            switch (amenity) {
                case "baby-sitter":
                    cost = cost.add(BABY_SITTER_PRICE);
                    break;
                case "gps":
                    cost = cost.add(GPS_PRICE);
                    break;
                case "power-bank":
                    cost = cost.add(POWER_BANK_PRICE);
                    break;
            }
        }
        return cost;
    }

    public List<Reservation> getReservationsByUser(Long userId) {
        return reservationRepository.findByUserId(userId);
    }

    public List<Reservation> getReservationsByVehicle(Long vehicleId) {
        return reservationRepository.findByVehicleId(vehicleId);
    }
}