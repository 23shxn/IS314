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
    
    
    @Query("SELECT u FROM User u WHERE LOWER(u.email) = LOWER(:email)")
    Optional<User> findByEmail(@Param("email") String email);
    
    @Query("SELECT new User(u.id, u.email, u.password, u.firstName, u.lastName, u.approved, u.emailVerified) FROM User u WHERE LOWER(u.email) = LOWER(:email)")
    Optional<User> findByEmailForAuth(@Param("email") String email);
    
    
    List<User> findByRole(String role);
    
    
    List<User> findByStatus(String status);
    
    
    List<User> findByRoleAndStatus(String role, String status);
    
    
    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM User u WHERE LOWER(u.email) = LOWER(:email)")
    boolean existsByEmail(@Param("email") String email);
    
    
    Optional<User> findByPhoneNumber(String phoneNumber);
    
    
    boolean existsByPhoneNumber(String phoneNumber);
    
    
    Optional<User> findByDriversLicenseNumber(String driversLicenseNumber);
    
    
    boolean existsByDriversLicenseNumber(String driversLicenseNumber);
    
    
    @Query("SELECT u FROM User u WHERE u.role = 'ROLE_CUSTOMER'")
    List<User> findAllCustomers();
    
    
    @Query("SELECT u FROM User u WHERE u.role = 'ROLE_CUSTOMER' AND u.status = 'APPROVED'")
    List<User> findAllApprovedCustomers();
    
    
    @Query("SELECT u FROM User u WHERE u.status = 'PENDING'")
    List<User> findPendingUsers();
    
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.status = :status")
    long countByStatus(@Param("status") String status);
    
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.role = :role")
    long countByRole(@Param("role") String role);
    
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.role = 'ROLE_CUSTOMER' AND u.status = 'APPROVED'")
    long countApprovedCustomers();
}