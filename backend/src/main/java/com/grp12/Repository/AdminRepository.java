package com.grp12.Repository;



import com.grp12.Model.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Long> {
    
    Optional<Admin> findByEmail(String email);
    
    Optional<Admin> findByUsername(String username);
    
    @Query("SELECT a FROM Admin a WHERE a.email = :email OR a.username = :username")
    Optional<Admin> findByEmailOrUsername(@Param("email") String email, @Param("username") String username);
    
    List<Admin> findByStatus(String status);
    
    boolean existsByEmail(String email);
    
    boolean existsByUsername(String username);
    
    @Query("SELECT COUNT(a) FROM Admin a WHERE a.status = 'ACTIVE'")
    long countActiveAdmins();
    
    @Query("SELECT a FROM Admin a WHERE a.status = 'ACTIVE' ORDER BY a.createdAt ASC")
    List<Admin> findActiveAdminsOrderByCreatedAt();
}