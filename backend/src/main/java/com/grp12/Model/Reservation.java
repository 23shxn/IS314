package com.grp12.Model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "reservations")
public class Reservation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "rental_date", nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate rentalDate;

    @Column(name = "return_date", nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate returnDate;

    @Column(name = "status", nullable = false, length = 20)
    private String status = "Confirmed"; // Default value

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "reservation_amenities", joinColumns = @JoinColumn(name = "reservation_id"))
    @Column(name = "amenity")
    private List<String> amenities = new ArrayList<>();

    @Column(name = "total_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice;

    @Column(name = "created_at", nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;

    // Default constructor
    public Reservation() {
        this.createdAt = LocalDateTime.now();
        this.status = "Confirmed";
        this.amenities = new ArrayList<>();
    }

    // Constructor with parameters for easier testing
    public Reservation(Vehicle vehicle, Long userId, LocalDate rentalDate, LocalDate returnDate, 
                      List<String> amenities, BigDecimal totalPrice) {
        this();
        this.vehicle = vehicle;
        this.userId = userId;
        this.rentalDate = rentalDate;
        this.returnDate = returnDate;
        this.amenities = amenities != null ? new ArrayList<>(amenities) : new ArrayList<>();
        this.totalPrice = totalPrice;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Vehicle getVehicle() { return vehicle; }
    public void setVehicle(Vehicle vehicle) { this.vehicle = vehicle; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public LocalDate getRentalDate() { return rentalDate; }
    public void setRentalDate(LocalDate rentalDate) { this.rentalDate = rentalDate; }

    public LocalDate getReturnDate() { return returnDate; }
    public void setReturnDate(LocalDate returnDate) { this.returnDate = returnDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public List<String> getAmenities() { 
        return amenities != null ? amenities : new ArrayList<>(); 
    }
    public void setAmenities(List<String> amenities) { 
        this.amenities = amenities != null ? amenities : new ArrayList<>(); 
    }

    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.status == null || this.status.isEmpty()) {
            this.status = "Confirmed";
        }
        if (this.amenities == null) {
            this.amenities = new ArrayList<>();
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    @Override
    public String toString() {
        return "Reservation{" +
                "id=" + id +
                ", vehicle=" + (vehicle != null ? vehicle.getId() : "null") +
                ", userId=" + userId +
                ", rentalDate=" + rentalDate +
                ", returnDate=" + returnDate +
                ", status='" + status + '\'' +
                ", amenities=" + amenities +
                ", totalPrice=" + totalPrice +
                ", createdAt=" + createdAt +
                '}';
    }
}