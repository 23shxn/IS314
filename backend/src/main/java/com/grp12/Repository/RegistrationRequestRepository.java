package com.grp12.Repository;

import com.grp12.Model.RegistrationRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RegistrationRequestRepository extends JpaRepository<RegistrationRequest, Long> {
    
    List<RegistrationRequest> findByStatus(String status);
    
    Optional<RegistrationRequest> findByEmail(String email);
    
    List<RegistrationRequest> findByDriversLicenseNumber(String driversLicenseNumber);
    
    @Query("SELECT r FROM RegistrationRequest r WHERE r.email = :email OR r.driversLicenseNumber = :driversLicenseNumber")
    List<RegistrationRequest> findByEmailOrDriversLicenseNumber(
        @Param("email") String email, 
        @Param("driversLicenseNumber") String driversLicenseNumber
    );
    
    @Query("SELECT r FROM RegistrationRequest r WHERE r.status = 'PENDING' ORDER BY r.createdAt ASC")
    List<RegistrationRequest> findPendingRequestsOrderByCreatedAt();
    
    boolean existsByEmail(String email);
    
    boolean existsByDriversLicenseNumber(String driversLicenseNumber);
    
    // Find requests by status, ordered by creation date (newest first)
    List<RegistrationRequest> findByStatusOrderByCreatedAtDesc(String status);
    
    // Check if phone number exists in registration requests
    boolean existsByPhoneNumber(String phoneNumber);
    
    // Count requests by status
    long countByStatus(String status);
    
    // Find all pending requests (alias for convenience)
    default List<RegistrationRequest> findPendingRequests() {
        return findByStatusOrderByCreatedAtDesc("PENDING");
    }
}
