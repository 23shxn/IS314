package com.grp12.Controller;

import com.grp12.Model.Admin;
import com.grp12.Repository.AdminRepository; 
import com.grp12.Services.AdminService;
import com.grp12.Services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder; 
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime; 
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    
    @Autowired
    private AdminService adminService;
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private AdminRepository adminRepository; 
    
    @Autowired
    private PasswordEncoder passwordEncoder; 

    @PostMapping("/register")
    public ResponseEntity<?> registerAdmin(@RequestBody Admin admin) {
        try {
            Admin registeredAdmin = adminService.registerAdmin(admin);
            // Remove password from response for security
            registeredAdmin.setPassword(null);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Admin registered successfully");
            response.put("admin", registeredAdmin);
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Admin registration failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginAdmin(@RequestBody Map<String, String> loginRequest, 
                                       HttpServletRequest request) {
        try {
            String email = loginRequest.get("email");
            String password = loginRequest.get("password");
            
            System.out.println("=== ADMIN LOGIN ATTEMPT ===");
            System.out.println("Email/Username: " + email);
            System.out.println("Password length: " + (password != null ? password.length() : 0));
            
            // Check if admin exists before authentication
            Admin existingAdmin = adminService.getAdminByEmail(email);
            if (existingAdmin == null) {
                existingAdmin = adminService.getAdminByUsername(email);
            }
            
            if (existingAdmin == null) {
                System.out.println("Admin not found in database");
                return ResponseEntity.badRequest().body(Map.of("error", "Admin not found"));
            }
            
            System.out.println("Found admin: " + existingAdmin.getUsername() + " with role: " + existingAdmin.getRole());
            
          
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password)
            );
            
            System.out.println("Authentication successful");
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            // Save to session
            HttpSessionSecurityContextRepository repo = new HttpSessionSecurityContextRepository();
            repo.saveContext(SecurityContextHolder.getContext(), request, null);
            
            existingAdmin.setPassword(null); // Remove password from response
            return ResponseEntity.ok(existingAdmin);
            
        } catch (Exception e) {
            System.err.println("=== LOGIN ERROR ===");
            System.err.println("Error type: " + e.getClass().getSimpleName());
            System.err.println("Error message: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid credentials"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutAdmin(HttpServletRequest request) {
        try {
            SecurityContextHolder.clearContext();
            request.getSession().invalidate();
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Logged out successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Logout failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllAdmins() {
        try {
            List<Admin> admins = adminService.getAllAdmins();
            // Remove passwords from response
            admins.forEach(admin -> admin.setPassword(null));
            return ResponseEntity.ok(admins);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch admins: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getAdminById(@PathVariable Long id) {
        try {
            Admin admin = adminService.getAdminById(id);
            if (admin != null) {
                admin.setPassword(null); // Remove password from response
                return ResponseEntity.ok(admin);
            }
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Admin not found or inactive");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch admin: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAdmin(@PathVariable Long id, @RequestBody Admin admin) {
        try {
            Admin updatedAdmin = adminService.updateAdmin(id, admin);
            updatedAdmin.setPassword(null); // Remove password from response
            return ResponseEntity.ok(updatedAdmin);
        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to update admin: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivateAdmin(@PathVariable Long id) {
        try {
            adminService.deactivateAdmin(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Admin deactivated successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to deactivate admin: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping("/{id}/activate")
    public ResponseEntity<?> activateAdmin(@PathVariable Long id) {
        try {
            adminService.activateAdmin(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Admin activated successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to activate admin: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/is-first-admin")
    public ResponseEntity<?> isFirstAdmin() {
        try {
            boolean isFirst = adminService.isFirstAdmin();
            Map<String, Boolean> response = new HashMap<>();
            response.put("isFirstAdmin", isFirst);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to check admin status: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    @GetMapping("/current")
    public ResponseEntity<?> getCurrentAdmin() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated() && 
                !authentication.getName().equals("anonymousUser")) {
                
                String email = authentication.getName();
                Admin admin = adminService.getAdminByEmail(email);
                if (admin != null) {
                    admin.setPassword(null);
                    return ResponseEntity.ok(admin);
                }
            }
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Not authenticated");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to get current admin: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping("/add-admin")
    public ResponseEntity<?> addAdmin(@RequestBody Admin admin, HttpServletRequest request) {
        try {
            // Get current admin from security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated() ||
                authentication.getName().equals("anonymousUser")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Not authenticated"));
            }

            // Get current admin by email/username
            String currentUsername = authentication.getName();
            Admin currentAdmin = adminService.getAdminByEmail(currentUsername);
            if (currentAdmin == null) {
                currentAdmin = adminService.getAdminByUsername(currentUsername);
            }

            if (currentAdmin == null || !"SUPER_ADMIN".equals(currentAdmin.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only super admins can add new admin accounts"));
            }

            // Validate input
            if (admin.getUsername() == null || admin.getUsername().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Username is required"));
            }

            if (admin.getEmail() == null || admin.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Email is required"));
            }

            if (admin.getPassword() == null || admin.getPassword().length() < 6) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Password must be at least 6 characters"));
            }

            // Check if username or email already exists
            if (adminRepository.findByUsername(admin.getUsername()).isPresent()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Username already exists"));
            }

            if (adminRepository.findByEmail(admin.getEmail()).isPresent()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Email already exists"));
            }

            // Set admin properties
            admin.setPassword(passwordEncoder.encode(admin.getPassword()));
            admin.setRole("ADMIN"); // New admins get regular admin role
            admin.setCreatedAt(LocalDateTime.now());
            admin.setActive(true); // Make sure new admin is active

            Admin savedAdmin = adminRepository.save(admin);
            savedAdmin.setPassword(null); // Remove password from response

            return ResponseEntity.ok().body(Map.of(
                "message", "Admin added successfully",
                "admin", savedAdmin
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to add admin: " + e.getMessage()));
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> request) {
        try {
            // Get current admin from security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated() ||
                authentication.getName().equals("anonymousUser")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Not authenticated"));
            }

            String currentUsername = authentication.getName();
            String currentPassword = request.get("currentPassword");
            String newPassword = request.get("newPassword");

            // Validate input
            if (currentPassword == null || currentPassword.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Current password is required"));
            }

            if (newPassword == null || newPassword.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "New password is required"));
            }

            if (newPassword.length() < 6) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "New password must be at least 6 characters long"));
            }

            // Change password
            adminService.changePassword(currentUsername, currentPassword.trim(), newPassword.trim());

            return ResponseEntity.ok()
                .body(Map.of("message", "Password changed successfully"));

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to change password: " + e.getMessage()));
        }
    }
}
