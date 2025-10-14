package com.grp12.Model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "maintenance_records")
public class MaintenanceRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "car_id", nullable = false)
    private Long carId;

    @Column(name = "type", nullable = false, length = 50)
    private String type; 

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "cost", precision = 10, scale = 2)
    private BigDecimal cost;

    @Column(name = "date", nullable = false)
    private LocalDateTime date;

    @Column(name = "next_date")
    private LocalDateTime nextDate;

    @Column(name = "mechanic", length = 100)
    private String mechanic;

    @Column(name = "status", nullable = false, length = 20)
    private String status; 

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "mileage")
    private Integer mileage;

    @Column(name = "receipt", columnDefinition = "TEXT")
    private String receipt; 

    @Column(name = "completed_at", nullable = false)
    private LocalDateTime completedAt;

    
    public MaintenanceRecord() {
        this.completedAt = LocalDateTime.now();
    }

    
    public MaintenanceRecord(PendingMaintenanceRecord pending) {
        this.carId = pending.getCarId();
        this.type = pending.getType();
        this.description = pending.getDescription();
        this.cost = pending.getCost();
        this.date = pending.getDate();
        this.nextDate = pending.getNextDate();
        this.mechanic = pending.getMechanic();
        this.status = pending.getStatus();
        this.notes = pending.getNotes();
        this.mileage = pending.getMileage();
        this.receipt = pending.getReceipt();
        this.completedAt = LocalDateTime.now();
    }

    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCarId() { return carId; }
    public void setCarId(Long carId) { this.carId = carId; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getCost() { return cost; }
    public void setCost(BigDecimal cost) { this.cost = cost; }

    public LocalDateTime getDate() { return date; }
    public void setDate(LocalDateTime date) { this.date = date; }

    public LocalDateTime getNextDate() { return nextDate; }
    public void setNextDate(LocalDateTime nextDate) { this.nextDate = nextDate; }

    public String getMechanic() { return mechanic; }
    public void setMechanic(String mechanic) { this.mechanic = mechanic; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Integer getMileage() { return mileage; }
    public void setMileage(Integer mileage) { this.mileage = mileage; }

    public String getReceipt() { return receipt; }
    public void setReceipt(String receipt) { this.receipt = receipt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
}
