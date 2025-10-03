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
    
    // Find user by email (case-insensitive for better matching)
    @Query("SELECT u FROM User u WHERE LOWER(u.email) = LOWER(:email)")
    Optional<User> findByEmail(@Param("email") String email);
    
    // Find users by role
    List<User> findByRole(String role);
    
    // Find users by status
    List<User> findByStatus(String status);
    
    // Find users by role and status
    List<User> findByRoleAndStatus(String role, String status);
    
    // Check if email exists (useful for validation)
    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM User u WHERE LOWER(u.email) = LOWER(:email)")
    boolean existsByEmail(@Param("email") String email);
    
    // Find by phone number (if needed for validation)
    Optional<User> findByPhoneNumber(String phoneNumber);
    
    // Check if phone number exists
    boolean existsByPhoneNumber(String phoneNumber);
    
    // Find by driver's license number (if needed for validation)
    Optional<User> findByDriversLicenseNumber(String driversLicenseNumber);
    
    // Check if driver's license number exists
    boolean existsByDriversLicenseNumber(String driversLicenseNumber);
    
    // Find all customers (shorthand method)
    @Query("SELECT u FROM User u WHERE u.role = 'ROLE_CUSTOMER'")
    List<User> findAllCustomers();
    
    // Find all approved customers
    @Query("SELECT u FROM User u WHERE u.role = 'ROLE_CUSTOMER' AND u.status = 'APPROVED'")
    List<User> findAllApprovedCustomers();
    
    // Find pending users (not approved yet)
    @Query("SELECT u FROM User u WHERE u.status = 'PENDING'")
    List<User> findPendingUsers();
    
    // Count users by status
    @Query("SELECT COUNT(u) FROM User u WHERE u.status = :status")
    long countByStatus(@Param("status") String status);
    
    // Count users by role
    @Query("SELECT COUNT(u) FROM User u WHERE u.role = :role")
    long countByRole(@Param("role") String role);
    
    // Count approved customers specifically
    @Query("SELECT COUNT(u) FROM User u WHERE u.role = 'ROLE_CUSTOMER' AND u.status = 'APPROVED'")
    long countApprovedCustomers();
}