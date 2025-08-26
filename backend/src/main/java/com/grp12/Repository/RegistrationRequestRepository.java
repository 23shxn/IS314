package com.grp12.Repository;



import com.grp12.Model.RegistrationRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RegistrationRequestRepository extends JpaRepository<RegistrationRequest, Long> {
    
    List<RegistrationRequest> findByStatus(String status);
    
    List<RegistrationRequest> findByEmail(String email);
    
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
}
