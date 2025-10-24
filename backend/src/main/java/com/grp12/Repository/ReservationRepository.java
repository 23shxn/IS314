package com.grp12.Repository;

import com.grp12.Model.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByUserId(Long userId);
    List<Reservation> findByVehicleId(Long vehicleId);
    List<Reservation> findByStatus(String status);

   
    @Query("SELECT r FROM Reservation r LEFT JOIN FETCH r.vehicle")
    List<Reservation> findAllWithVehicle();
}