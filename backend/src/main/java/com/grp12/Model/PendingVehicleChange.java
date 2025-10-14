package com.grp12.Model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "pending_vehicle_changes")
public class PendingVehicleChange {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "change_type", nullable = false)
    private String changeType; 

    @Column(name = "vehicle_data", columnDefinition = "TEXT")
    private String vehicleData; 

    @Column(name = "vehicle_id")
    private Long vehicleId; 

    @Column(name = "requested_by", nullable = false)
    private Long requestedBy; 

    @Column(name = "requested_at", nullable = false)
    private LocalDateTime requestedAt;

    @Column(name = "status", nullable = false)
    private String status; // "PENDING", "APPROVED", "REJECTED"

    @Column(name = "approved_by")
    private Long approvedBy; // SuperAdmin ID who approved/rejected

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    // Default constructor
    public PendingVehicleChange() {
        this.requestedAt = LocalDateTime.now();
        this.status = "PENDING";
    }

    // Constructor for ADD request
    public PendingVehicleChange(String vehicleData, Long requestedBy) {
        this();
        this.changeType = "ADD";
        this.vehicleData = vehicleData;
        this.requestedBy = requestedBy;
    }

    // Constructor for REMOVE request
    public PendingVehicleChange(Long vehicleId, Long requestedBy) {
        this();
        this.changeType = "REMOVE";
        this.vehicleId = vehicleId;
        this.requestedBy = requestedBy;
    }

    // Constructor for UPDATE request
    public PendingVehicleChange(String vehicleData, Long vehicleId, Long requestedBy) {
        this();
        this.changeType = "UPDATE";
        this.vehicleData = vehicleData;
        this.vehicleId = vehicleId;
        this.requestedBy = requestedBy;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getChangeType() { return changeType; }
    public void setChangeType(String changeType) { this.changeType = changeType; }

    public String getVehicleData() { return vehicleData; }
    public void setVehicleData(String vehicleData) { this.vehicleData = vehicleData; }

    public Long getVehicleId() { return vehicleId; }
    public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }

    public Long getRequestedBy() { return requestedBy; }
    public void setRequestedBy(Long requestedBy) { this.requestedBy = requestedBy; }

    public LocalDateTime getRequestedAt() { return requestedAt; }
    public void setRequestedAt(LocalDateTime requestedAt) { this.requestedAt = requestedAt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getApprovedBy() { return approvedBy; }
    public void setApprovedBy(Long approvedBy) { this.approvedBy = approvedBy; }

    public LocalDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
}
