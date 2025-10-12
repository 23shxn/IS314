package com.grp12.Repository;

import com.grp12.Model.PendingVehicleChange;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PendingVehicleChangeRepository extends JpaRepository<PendingVehicleChange, Long> {

    List<PendingVehicleChange> findByStatus(String status);

    List<PendingVehicleChange> findByRequestedBy(Long requestedBy);

    List<PendingVehicleChange> findByChangeType(String changeType);

    @Query("SELECT p FROM PendingVehicleChange p WHERE p.status = :status ORDER BY p.requestedAt DESC")
    List<PendingVehicleChange> findByStatusOrderByRequestedAtDesc(@Param("status") String status);

    @Query("SELECT COUNT(p) FROM PendingVehicleChange p WHERE p.status = :status")
    Long countByStatus(@Param("status") String status);
}
