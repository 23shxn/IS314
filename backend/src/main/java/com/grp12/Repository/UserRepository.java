package com.grp12.Repository;



import com.grp12.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    
    Optional<User> findByDriversLicenseNumber(String driversLicenseNumber);
    
    List<User> findByStatus(String status);
    
    @Query("SELECT u FROM User u WHERE u.email = :email OR u.driversLicenseNumber = :licenseNumber")
    List<User> findByEmailOrDriversLicenseNumber(@Param("email") String email, 
                                                 @Param("licenseNumber") String licenseNumber);
    
    boolean existsByEmail(String email);
    
    boolean existsByDriversLicenseNumber(String driversLicenseNumber);
}