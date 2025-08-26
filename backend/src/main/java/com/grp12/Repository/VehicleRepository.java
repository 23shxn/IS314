package com.grp12.Repository;



import com.grp12.Model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    
    List<Vehicle> findByStatus(String status);
    
    List<Vehicle> findByLocation(String location);
    
    List<Vehicle> findByVehicleType(String vehicleType);
    
    List<Vehicle> findByMakeAndModel(String make, String model);
    
    Optional<Vehicle> findByLicensePlate(String licensePlate);
    
    Optional<Vehicle> findByVin(String vin);
    
    @Query("SELECT v FROM Vehicle v WHERE v.location = :location AND v.status = :status")
    List<Vehicle> findByLocationAndStatus(@Param("location") String location, @Param("status") String status);
    
    @Query("SELECT v FROM Vehicle v WHERE v.vehicleType = :vehicleType AND v.status = :status")
    List<Vehicle> findByVehicleTypeAndStatus(@Param("vehicleType") String vehicleType, @Param("status") String status);
    
    @Query("SELECT v FROM Vehicle v WHERE v.pricePerDay BETWEEN :minPrice AND :maxPrice AND v.status = :status")
    List<Vehicle> findByPriceRangeAndStatus(@Param("minPrice") Double minPrice, 
                                           @Param("maxPrice") Double maxPrice, 
                                           @Param("status") String status);
    
    @Query("SELECT v FROM Vehicle v WHERE " +
           "(:location IS NULL OR LOWER(v.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:vehicleType IS NULL OR LOWER(v.vehicleType) LIKE LOWER(CONCAT('%', :vehicleType, '%'))) AND " +
           "(:minPrice IS NULL OR v.pricePerDay >= :minPrice) AND " +
           "(:maxPrice IS NULL OR v.pricePerDay <= :maxPrice) AND " +
           "(:status IS NULL OR v.status = :status)")
    List<Vehicle> findVehiclesWithFilters(@Param("location") String location,
                                         @Param("vehicleType") String vehicleType,
                                         @Param("minPrice") Double minPrice,
                                         @Param("maxPrice") Double maxPrice,
                                         @Param("status") String status);
    
    @Query("SELECT DISTINCT v.location FROM Vehicle v ORDER BY v.location")
    List<String> findDistinctLocations();
    
    @Query("SELECT DISTINCT v.vehicleType FROM Vehicle v ORDER BY v.vehicleType")
    List<String> findDistinctVehicleTypes();
    
    boolean existsByLicensePlate(String licensePlate);
    
    boolean existsByVin(String vin);
    
    @Query("SELECT COUNT(v) FROM Vehicle v WHERE v.status = :status")
    Long countByStatus(@Param("status") String status);
}
