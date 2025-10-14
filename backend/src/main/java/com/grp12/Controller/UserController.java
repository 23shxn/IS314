package com.grp12.Controller;

import com.grp12.Model.User;
import com.grp12.Model.RegistrationRequest;
import com.grp12.Services.UserService;
import com.grp12.Services.EmailService;
import com.grp12.Services.ImageCompressionService; 
import com.grp12.Repository.RegistrationRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.List;
import java.util.Base64;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http:
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private ImageCompressionService imageCompressionService; 

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            
            if (user.getDriversLicenseImage() != null && !user.getDriversLicenseImage().trim().isEmpty()) {
                System.out.println("Compressing drivers license image...");
                String compressedImage = imageCompressionService.compressBase64Image(user.getDriversLicenseImage());

                if (compressedImage == null) {
                    return ResponseEntity.badRequest()
                        .body(Map.of("error", "Invalid image format. Please upload a valid image."));
                }

                user.setDriversLicenseImage(compressedImage);
                System.out.println("Image compression completed successfully");
            }

            
            User existingUser = userService.getUserByEmail(user.getEmail());
            if (existingUser != null && existingUser.getApproved()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Email already registered and approved"));
            }

            
            Optional<RegistrationRequest> existingRequest = registrationRequestRepository.findByEmailAndStatus(
                user.getEmail(), "PENDING");
            if (existingRequest.isPresent()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Registration request already pending for this email"));
            }

            
            if (existingUser != null && !existingUser.getApproved()) {
                
                userService.deleteUser(existingUser.getId());
            }

            
            registrationRequestRepository.findByEmail(user.getEmail())
                .ifPresent(oldRequest -> {
                    if ("REJECTED".equals(oldRequest.getStatus())) {
                        registrationRequestRepository.delete(oldRequest);
                    }
                });

            
            RegistrationRequest registrationRequest = userService.registerUser(user);

            return ResponseEntity.ok().body(Map.of(
                "message", "Registration request submitted successfully! Please wait for admin approval.",
                "request", Map.of(
                    "id", registrationRequest.getId(),
                    "email", registrationRequest.getEmail(),
                    "status", registrationRequest.getStatus()
                )
            ));

        } catch (Exception e) {
            System.err.println("Registration error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Registration failed: " + e.getMessage()));
        }
    }

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private EmailService emailService;

    @Autowired
    private RegistrationRequestRepository registrationRequestRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user, HttpServletRequest request) {
        try {
            
            UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(user.getEmail(), user.getPassword());

            Authentication authentication = authenticationManager.authenticate(authToken);
            SecurityContextHolder.getContext().setAuthentication(authentication);

            
            request.getSession().setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
                SecurityContextHolder.getContext());

            
            User authenticatedUser = userService.loginUser(user.getEmail(), user.getPassword());
            if (authenticatedUser != null) {
                
                Map<String, Object> response = new HashMap<>();
                response.put("id", authenticatedUser.getId());
                response.put("email", authenticatedUser.getEmail());
                response.put("firstName", authenticatedUser.getFirstName());
                response.put("lastName", authenticatedUser.getLastName());
                response.put("phoneNumber", authenticatedUser.getPhoneNumber());
                response.put("status", authenticatedUser.getStatus());
                response.put("role", "customer"); 

                return ResponseEntity.ok(response);
            }

            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid email, password, or account not approved");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Login failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUserAuth() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();

            if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            }

            String email = auth.getName();
            User user = userService.getUserByEmail(email);

            if (user == null) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "User not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }

            
            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getId());
            response.put("email", user.getEmail());
            response.put("firstName", user.getFirstName());
            response.put("lastName", user.getLastName());
            response.put("phoneNumber", user.getPhoneNumber());
            response.put("status", user.getStatus());
            response.put("role", "customer"); 
            response.put("authenticated", true);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to get user info: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
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

    @GetMapping("/requests/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> getPendingRequests() {
        try {
            List<RegistrationRequest> requests = userService.getPendingRequests();
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch pending requests: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping("/approve/{requestId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> approveRegistration(@PathVariable Long requestId) {
        try {
            
            User user = userService.approveUser(requestId);

            
            return ResponseEntity.ok(Map.of(
                "message", "User approved successfully! Notification email sent.",
                "user", user
            ));
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to approve registration: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping("/reject/{requestId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> rejectRegistration(@PathVariable Long requestId) {
        try {
            
            userService.rejectUser(requestId);

            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Registration rejected successfully! Notification email sent.");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to reject registration: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/users/customers")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> getAllCustomers() {
        try {
            List<User> customers = userService.getAllCustomers();
            return ResponseEntity.ok(customers);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch customers: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    
    @DeleteMapping("/users/{userId}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        try {
            userService.deleteUser(userId);
            return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to delete user: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/current")
    public ResponseEntity<?> getCurrentUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated() &&
                !authentication.getName().equals("anonymousUser")) {

                String email = authentication.getName();
                User user = userService.getUserByEmail(email);
                if (user != null) {
                    user.setPassword(null);
                    return ResponseEntity.ok(user);
                }
            }

            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Not authenticated");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to get current user: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping("/request-password-reset")
    public ResponseEntity<?> requestPasswordReset(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");

            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Email is required"));
            }

            
            if (!email.matches("^[a-zA-Z0-9._%+-]+@gmail\\.com$")) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Please enter a valid Gmail address"));
            }

            userService.requestPasswordReset(email.trim());

            return ResponseEntity.ok()
                .body(Map.of("message", "Password reset code sent to your email"));

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Password reset request error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to process password reset request"));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String resetToken = request.get("resetToken");
            String newPassword = request.get("newPassword");

            if (email == null || resetToken == null || newPassword == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Email, reset token, and new password are required"));
            }

            userService.resetPassword(email.trim(), resetToken.trim(), newPassword);

            return ResponseEntity.ok()
                .body(Map.of("message", "Password reset successful. You can now login with your new password."));

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Password reset error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to reset password"));
        }
    }

    @PostMapping("/verify-reset-code")
    public ResponseEntity<?> verifyResetCode(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String resetToken = request.get("resetToken");

            
            boolean isValid = userService.verifyResetToken(email, resetToken);

            if (isValid) {
                return ResponseEntity.ok().body(Map.of("message", "Reset code verified successfully"));
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired reset code"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to verify reset code"));
        }
    }
}
