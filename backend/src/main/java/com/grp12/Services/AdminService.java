package com.grp12.Services;

import com.grp12.Model.Admin;
import com.grp12.Repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class AdminService {
    @Autowired
    private AdminRepository adminRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    public Admin registerAdmin(Admin admin) {
        try {
            // Check if email already exists
            if (adminRepository.existsByEmail(admin.getEmail())) {
                throw new IllegalArgumentException("Email already exists");
            }
            
            // Check if username already exists
            if (adminRepository.existsByUsername(admin.getUsername())) {
                throw new IllegalArgumentException("Username already exists");
            }
            
            // Encode password
            admin.setPassword(passwordEncoder.encode(admin.getPassword()));
            
            // Set default values
            admin.setRole("ROLE_ADMIN");
            admin.setStatus("ACTIVE");
            
            Admin savedAdmin = adminRepository.save(admin);
            System.out.println("Admin registered successfully with ID: " + savedAdmin.getId());
            return savedAdmin;
            
        } catch (Exception e) {
            System.err.println("Error in registerAdmin: " + e.getMessage());
            if (e instanceof IllegalArgumentException) {
                throw e;
            }
            throw new RuntimeException("Failed to register admin: " + e.getMessage());
        }
    }

    public Admin loginAdmin(String emailOrUsername, String password) {
        try {
            Optional<Admin> adminOpt = adminRepository.findByEmailOrUsername(emailOrUsername, emailOrUsername);
            
            if (adminOpt.isPresent()) {
                Admin admin = adminOpt.get();
                if ("ACTIVE".equals(admin.getStatus()) && passwordEncoder.matches(password, admin.getPassword())) {
                    return admin;
                }
            }
            return null;
        } catch (Exception e) {
            System.err.println("Error in loginAdmin: " + e.getMessage());
            return null;
        }
    }

    public Admin getAdminByEmail(String email) {
        return adminRepository.findByEmail(email).orElse(null);
    }

    public List<Admin> getAllAdmins() {
        try {
            return adminRepository.findActiveAdminsOrderByCreatedAt();
        } catch (Exception e) {
            System.err.println("Error in getAllAdmins: " + e.getMessage());
            throw new RuntimeException("Failed to fetch admins: " + e.getMessage());
        }
    }

    public Admin getAdminById(Long id) {
        try {
            return adminRepository.findById(id)
                    .filter(admin -> "ACTIVE".equals(admin.getStatus()))
                    .orElse(null);
        } catch (Exception e) {
            System.err.println("Error in getAdminById: " + e.getMessage());
            return null;
        }
    }

    public Admin updateAdmin(Long id, Admin updatedAdmin) {
        try {
            Admin existingAdmin = adminRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Admin not found"));

            // Check if email is being changed and already exists
            if (!existingAdmin.getEmail().equals(updatedAdmin.getEmail()) && 
                adminRepository.existsByEmail(updatedAdmin.getEmail())) {
                throw new IllegalArgumentException("Email already exists");
            }

            // Check if username is being changed and already exists
            if (!existingAdmin.getUsername().equals(updatedAdmin.getUsername()) && 
                adminRepository.existsByUsername(updatedAdmin.getUsername())) {
                throw new IllegalArgumentException("Username already exists");
            }

            existingAdmin.setFirstName(updatedAdmin.getFirstName());
            existingAdmin.setLastName(updatedAdmin.getLastName());
            existingAdmin.setUsername(updatedAdmin.getUsername());
            existingAdmin.setEmail(updatedAdmin.getEmail());
            
            // Only update password if provided
            if (updatedAdmin.getPassword() != null && !updatedAdmin.getPassword().isEmpty()) {
                existingAdmin.setPassword(passwordEncoder.encode(updatedAdmin.getPassword()));
            }

            return adminRepository.save(existingAdmin);
        } catch (Exception e) {
            System.err.println("Error in updateAdmin: " + e.getMessage());
            if (e instanceof IllegalArgumentException || e instanceof RuntimeException) {
                throw e;
            }
            throw new RuntimeException("Failed to update admin: " + e.getMessage());
        }
    }

    public void deactivateAdmin(Long id) {
        try {
            Admin admin = adminRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Admin not found"));
            
            // Prevent deactivating the last admin
            long activeAdminCount = adminRepository.countActiveAdmins();
            if (activeAdminCount <= 1) {
                throw new RuntimeException("Cannot deactivate the last admin account");
            }
            
            admin.setStatus("INACTIVE");
            adminRepository.save(admin);
            System.out.println("Admin deactivated: " + id);
            
        } catch (Exception e) {
            System.err.println("Error in deactivateAdmin: " + e.getMessage());
            if (e instanceof RuntimeException) {
                throw e;
            }
            throw new RuntimeException("Failed to deactivate admin: " + e.getMessage());
        }
    }

    public void activateAdmin(Long id) {
        try {
            Admin admin = adminRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Admin not found"));
            
            admin.setStatus("ACTIVE");
            adminRepository.save(admin);
            System.out.println("Admin activated: " + id);
            
        } catch (Exception e) {
            System.err.println("Error in activateAdmin: " + e.getMessage());
            throw new RuntimeException("Failed to activate admin: " + e.getMessage());
        }
    }

    public boolean isFirstAdmin() {
        return adminRepository.countActiveAdmins() == 0;
    }

    public Admin getAdminByUsername(String username) {
        return adminRepository.findByUsername(username).orElse(null);
    }

    public void changePassword(String emailOrUsername, String currentPassword, String newPassword) {
        try {
            // Find admin by email or username
            Admin admin = adminRepository.findByEmailOrUsername(emailOrUsername, emailOrUsername)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

            // Verify current password
            if (!passwordEncoder.matches(currentPassword, admin.getPassword())) {
                throw new RuntimeException("Current password is incorrect");
            }

            // Validate new password
            if (newPassword == null || newPassword.length() < 6) {
                throw new RuntimeException("New password must be at least 6 characters long");
            }

            // Update password
            admin.setPassword(passwordEncoder.encode(newPassword));
            adminRepository.save(admin);

            System.out.println("Password changed successfully for admin: " + admin.getUsername());

        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            System.err.println("Error in changePassword: " + e.getMessage());
            throw new RuntimeException("Failed to change password: " + e.getMessage());
        }
    }
}
