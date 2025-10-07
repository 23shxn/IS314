package com.grp12.Model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_user_email", columnList = "email"),
    @Index(name = "idx_user_license", columnList = "drivers_license_number")
})
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // Match database column order
    @Lob
    @Column(name = "drivers_license_image", columnDefinition = "TEXT")
    private String driversLicenseImage; // Should be String, not File or byte[]
    
    @Column(name = "drivers_license_number", nullable = false, unique = true, length = 50)
    private String driversLicenseNumber; // Move to position 3
    
    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email; // Now position 4
    
    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName; // Now position 5
    
    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName; // Now position 6
    
    @Column(name = "password", nullable = false, length = 255)
    private String password; // Now position 7
    
    @Column(name = "phone_number", nullable = false, length = 20)
    private String phoneNumber; // Now position 8
    
    @Column(name = "role", nullable = false, length = 50)
    private String role = "ROLE_CUSTOMER"; // Now position 9
    
    @Column(name = "status", nullable = false, length = 20)
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED

    @Column(name = "approved")
    private Boolean approved = false; // Use Boolean (wrapper) instead of boolean (primitive)

    @Column(name = "email_verified")
    private Boolean emailVerified = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    // Default constructor
    public User() {
        this.createdAt = LocalDateTime.now(); // Set default value
    }

    // Constructor for easy creation
    public User(String firstName, String lastName, String phoneNumber, String email, 
                String driversLicenseNumber, String driversLicenseImage) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.phoneNumber = phoneNumber;
        this.email = email;
        this.driversLicenseNumber = driversLicenseNumber;
        this.driversLicenseImage = driversLicenseImage;
        this.status = "PENDING";
        this.createdAt = LocalDateTime.now(); // Set default value
    }

    // New constructor
    public User(Long id, String email, String password, String firstName, String lastName, Boolean approved, Boolean emailVerified) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
        this.approved = approved;
        this.emailVerified = emailVerified;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    public String getDriversLicenseNumber() { return driversLicenseNumber; }
    public void setDriversLicenseNumber(String driversLicenseNumber) { this.driversLicenseNumber = driversLicenseNumber; }
    
    public String getDriversLicenseImage() { return driversLicenseImage; }
    public void setDriversLicenseImage(String driversLicenseImage) {
        this.driversLicenseImage = driversLicenseImage;
    }
    
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Boolean getApproved() { // or isApproved()
        return approved;
    }

    public void setApproved(Boolean approved) {
        this.approved = approved;
    }

    public Boolean getEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(Boolean emailVerified) {
        this.emailVerified = emailVerified;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", email='" + email + '\'' +
                ", phoneNumber='" + phoneNumber + '\'' +
                ", role='" + role + '\'' +
                ", status='" + status + '\'' +
                ", approved=" + approved +
                ", emailVerified=" + emailVerified +
                ", createdAt=" + createdAt +
                '}';
    }
}
