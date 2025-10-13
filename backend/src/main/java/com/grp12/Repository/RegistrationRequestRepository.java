package com.grp12.Repository;

import com.grp12.Model.RegistrationRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RegistrationRequestRepository extends JpaRepository<RegistrationRequest, Long> {
    Optional<RegistrationRequest> findByEmail(String email);
    Optional<RegistrationRequest> findByEmailAndStatus(String email, String status);
    List<RegistrationRequest> findByStatus(String status);
    List<RegistrationRequest> findByDriversLicenseNumber(String driversLicenseNumber);
    List<RegistrationRequest> findByEmailOrDriversLicenseNumber(String email, String driversLicenseNumber);
    
   
    @Query("SELECT r FROM RegistrationRequest r WHERE r.status = 'PENDING' ORDER BY r.createdAt ASC")
    List<RegistrationRequest> findPendingRequestsOrderByCreatedAt();
    
    boolean existsByEmail(String email);
    boolean existsByDriversLicenseNumber(String driversLicenseNumber);
    List<RegistrationRequest> findByStatusOrderByCreatedAtDesc(String status);
    boolean existsByPhoneNumber(String phoneNumber);
    long countByStatus(String status);
    
    default List<RegistrationRequest> findPendingRequests() {
        return findByStatusOrderByCreatedAtDesc("PENDING");
    }
}
