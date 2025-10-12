package com.grp12.Repository;

import com.grp12.Model.PendingMaintenanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PendingMaintenanceRecordRepository extends JpaRepository<PendingMaintenanceRecord, Long> {

    List<PendingMaintenanceRecord> findByApprovalStatus(String approvalStatus);

    List<PendingMaintenanceRecord> findByRequestedBy(Long requestedBy);

    List<PendingMaintenanceRecord> findByCarId(Long carId);

    @Query("SELECT p FROM PendingMaintenanceRecord p WHERE LOWER(p.approvalStatus) = LOWER(:status) ORDER BY p.requestedAt DESC")
    List<PendingMaintenanceRecord> findByApprovalStatusOrderByRequestedAtDesc(@Param("status") String status);

    @Query("SELECT COUNT(p) FROM PendingMaintenanceRecord p WHERE LOWER(p.approvalStatus) = LOWER(:status)")
    Long countByApprovalStatus(@Param("status") String status);
}
