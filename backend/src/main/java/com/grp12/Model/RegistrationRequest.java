package com.grp12.Model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "registration_requests", indexes = {
    @Index(name = "idx_reg_email", columnList = "email"),
    @Index(name = "idx_reg_status", columnList = "status"),
    @Index(name = "idx_reg_license", columnList = "drivers_license_number")
})
public class RegistrationRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;
    
    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;
    
    @Column(name = "phone_number", nullable = false, length = 20)
    private String phoneNumber;
    
    @Column(name = "email", nullable = false, length = 255)
    private String email;
    
    @Column(name = "password", nullable = false, length = 255)
    private String password;
    
    @Column(name = "drivers_license_number", nullable = false, length = 50)
    private String driversLicenseNumber;
    
    @Column(name = "drivers_license_image", columnDefinition = "TEXT")
    private String driversLicenseImage;
    
    @Column(name = "status", nullable = false, length = 20)
    private String status; 

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    
    public RegistrationRequest() {
        this.createdAt = LocalDateTime.now();
        this.status = "PENDING";
    }

    
    public RegistrationRequest(String firstName, String lastName, String phoneNumber, 
                             String email, String password, String driversLicenseNumber, String driversLicenseImage) {
        this();
        this.firstName = firstName;
        this.lastName = lastName;
        this.phoneNumber = phoneNumber;
        this.email = email;
        this.password = password;
        this.driversLicenseNumber = driversLicenseNumber;
        this.driversLicenseImage = driversLicenseImage;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    
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
    public void setDriversLicenseImage(String driversLicenseImage) { this.driversLicenseImage = driversLicenseImage; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { 
        this.status = status;
        this.updatedAt = LocalDateTime.now();
    }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public LocalDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; }

    @Override
    public String toString() {
        return "RegistrationRequest{" +
                "id=" + id +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", email='" + email + '\'' +
                ", status='" + status + '\'' +
                ", createdAt=" + createdAt +
                ", approvedAt=" + approvedAt +
                '}';
    }
}