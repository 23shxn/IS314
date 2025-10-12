package com.grp12.Repository;

import com.grp12.Model.MaintenanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceRecordRepository extends JpaRepository<MaintenanceRecord, Long> {

    List<MaintenanceRecord> findByCarId(Long carId);

    @Query("SELECT m FROM MaintenanceRecord m ORDER BY m.completedAt DESC")
    List<MaintenanceRecord> findAllOrderByCompletedAtDesc();

    @Query("SELECT m FROM MaintenanceRecord m WHERE m.carId = :carId ORDER BY m.date DESC")
    List<MaintenanceRecord> findByCarIdOrderByDateDesc(@Param("carId") Long carId);
}
