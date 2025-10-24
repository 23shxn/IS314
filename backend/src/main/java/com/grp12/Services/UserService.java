package com.grp12.Services;

import com.grp12.Model.RegistrationRequest;
import com.grp12.Model.User;
import com.grp12.Repository.RegistrationRequestRepository;
import com.grp12.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.mail.MessagingException;
import java.util.Optional;
import java.util.List;
import java.util.regex.Pattern;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.time.LocalDateTime;
import java.util.Random;

@Service
@Transactional
public class UserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RegistrationRequestRepository registrationRequestRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private EmailService emailService;

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[a-zA-Z0-9._%+-]+@gmail\\.com$");
    private static final Pattern PHONE_PATTERN = Pattern.compile("^\\d{7}$");
    private static final Pattern NAME_PATTERN = Pattern.compile("^[a-zA-Z\\s]+$");
    private static final Pattern PASSWORD_PATTERN = Pattern.compile("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$");

    private final Map<String, String> passwordResetTokens = new ConcurrentHashMap<>();
    private final Map<String, LocalDateTime> tokenExpiryTimes = new ConcurrentHashMap<>();

    public RegistrationRequest registerUser(User user) {
        try {
            // Validate input
            if (user.getEmail() == null || user.getPassword() == null) {
                throw new IllegalArgumentException("Email and password are required");
            }
            
            // Check if email already exists for APPROVED users only
            Optional<User> existingUser = userRepository.findByEmail(user.getEmail());
            if (existingUser.isPresent() && "APPROVED".equals(existingUser.get().getStatus())) {
                throw new IllegalArgumentException("Email already registered and approved");
            }
            
            // Check for pending registration requests
            Optional<RegistrationRequest> existingRequest = registrationRequestRepository.findByEmail(user.getEmail());
            if (existingRequest.isPresent() && "PENDING".equals(existingRequest.get().getStatus())) {
                throw new IllegalArgumentException("Registration request already pending for this email");
            }
            
            // Clean up old rejected/non-approved records
            if (existingUser.isPresent() && !"APPROVED".equals(existingUser.get().getStatus())) {
                userRepository.delete(existingUser.get());
                System.out.println("Deleted old non-approved user record for: " + user.getEmail());
            }
            
            if (existingRequest.isPresent() && "REJECTED".equals(existingRequest.get().getStatus())) {
                registrationRequestRepository.delete(existingRequest.get());
                System.out.println("Deleted old rejected registration request for: " + user.getEmail());
            }
            
            // Create RegistrationRequest
            RegistrationRequest request = new RegistrationRequest();
            request.setFirstName(user.getFirstName());
            request.setLastName(user.getLastName());
            request.setPhoneNumber(user.getPhoneNumber());
            request.setEmail(user.getEmail());
            request.setPassword(passwordEncoder.encode(user.getPassword()));
            request.setDriversLicenseNumber(user.getDriversLicenseNumber());
            request.setDriversLicenseImage(user.getDriversLicenseImage());
            request.setStatus("PENDING");
            request.setCreatedAt(LocalDateTime.now());
            
            RegistrationRequest savedRequest = registrationRequestRepository.save(request);
            System.out.println("Registration request created with ID: " + savedRequest.getId());
            
            return savedRequest;
            
        } catch (Exception e) {
            System.err.println("Error in registerUser: " + e.getMessage());
            if (e instanceof IllegalArgumentException) {
                throw e;
            }
            throw new RuntimeException("Failed to process registration: " + e.getMessage());
        }
    }

    public User loginUser(String email, String password) {
        try {
            System.out.println("LoginUser called with email: " + email);
            
            if (!EMAIL_PATTERN.matcher(email).matches()) {
                System.out.println("Invalid email format");
                throw new IllegalArgumentException("Email must end with @gmail.com");
            }
            
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                System.out.println("User not found for email: " + email);
                return null;
            }
            
            User user = userOpt.get();
            System.out.println("Found user: " + user.getEmail() + ", status: " + user.getStatus() + ", role: " + user.getRole());
            
            if (!"APPROVED".equals(user.getStatus())) {
                System.out.println("User not approved, status: " + user.getStatus());
                return null;
            }
            
            if (!passwordEncoder.matches(password, user.getPassword())) {
                System.out.println("Password does not match for user: " + email);
                return null;
            }
            
            System.out.println("Login successful for user: " + email);
            return user;
            
        } catch (Exception e) {
            System.err.println("Error in loginUser: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    public User getUserByEmail(String email) {
        try {
            System.out.println("GetUserByEmail called with: " + email);
            
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                System.out.println("User not found for email: " + email);
                return null;
            }
            
            User user = userOpt.get();
            System.out.println("Found user: " + user.getEmail() + ", status: " + user.getStatus());
            
            if (!"APPROVED".equals(user.getStatus())) {
                System.out.println("User not approved, status: " + user.getStatus());
                return null;
            }
            
            return user;
            
        } catch (Exception e) {
            System.err.println("Error in getUserByEmail: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    public User approveUser(Long requestId) {
        RegistrationRequest request = registrationRequestRepository.findById(requestId)
            .orElseThrow(() -> new RuntimeException("Registration request not found"));
        
        if (!"PENDING".equals(request.getStatus())) {
            throw new RuntimeException("Registration request is not pending");
        }
        
        // Create new user from registration request
        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setDriversLicenseNumber(request.getDriversLicenseNumber());
        user.setDriversLicenseImage(request.getDriversLicenseImage());
        user.setPassword(request.getPassword());
        user.setStatus("APPROVED");
        user.setEmailVerified(true);
        user.setCreatedAt(java.time.LocalDateTime.now());
        
        User savedUser = userRepository.save(user);
        
        // Update request status
        request.setStatus("APPROVED");
        request.setApprovedAt(java.time.LocalDateTime.now());
        registrationRequestRepository.save(request);
        
        // Send approval email
        try {
            emailService.sendApprovalNotification(request.getEmail(), request.getFirstName(), request.getLastName(), true);
        } catch (Exception e) {
            System.err.println("Failed to send approval email: " + e.getMessage());
        }
        
        return savedUser; 
    
    }

    public void rejectUser(Long userId) {
        try {
            RegistrationRequest request = registrationRequestRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Registration request not found"));
            
            if (!"PENDING".equals(request.getStatus())) {
                throw new RuntimeException("Request already processed");
            }
            
          
            try {
                emailService.sendApprovalNotification(
                    request.getEmail(), 
                    request.getFirstName(), 
                    request.getLastName(), 
                    false
                );
                System.out.println("Rejection email sent to: " + request.getEmail());
            } catch (MessagingException e) {
                System.err.println("Failed to send rejection email: " + e.getMessage());
            }
            
            // Update request status to rejected
            request.setStatus("REJECTED");
            registrationRequestRepository.save(request);
            
            System.out.println("Registration request rejected: " + userId);
            
        } catch (Exception e) {
            System.err.println("Error in rejectUser: " + e.getMessage());
            throw new RuntimeException("Failed to reject user: " + e.getMessage());
        }
    }

    public List<RegistrationRequest> getPendingRequests() {
        try {
            return registrationRequestRepository.findByStatusOrderByCreatedAtDesc("PENDING");
        } catch (Exception e) {
            System.err.println("Error in getPendingRequests: " + e.getMessage());
            throw new RuntimeException("Failed to fetch pending requests: " + e.getMessage());
        }
    }

    public List<User> getAllCustomers() {
        try {
            return userRepository.findByRoleAndStatus("ROLE_CUSTOMER", "APPROVED");
        } catch (Exception e) {
            System.err.println("Error in getAllCustomers: " + e.getMessage());
            throw new RuntimeException("Failed to fetch customers: " + e.getMessage());
        }
    }

    public User getUserById(Long id) {
        try {
            return userRepository.findById(id)
                    .filter(user -> "APPROVED".equals(user.getStatus()))
                    .orElse(null);
        } catch (Exception e) {
            System.err.println("Error in getUserById: " + e.getMessage());
            return null;
        }
    }

    public User updateUserStatus(Long userId, String status) {
        try {
            User user = userRepository.findById(userId)
                    .filter(u -> "ROLE_CUSTOMER".equals(u.getRole()))
                    .orElseThrow(() -> new RuntimeException("Customer not found"));
            
            user.setStatus(status);
            return userRepository.save(user);
        } catch (Exception e) {
            System.err.println("Error in updateUserStatus: " + e.getMessage());
            if (e instanceof RuntimeException) {
                throw e;
            }
            throw new RuntimeException("Failed to update user status: " + e.getMessage());
        }
    }

    public void deleteUser(Long userId) {
        try {
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
            
            userRepository.delete(user);
            System.out.println("User deleted successfully: " + user.getEmail());
            
        } catch (Exception e) {
            System.err.println("Error in deleteUser: " + e.getMessage());
            throw new RuntimeException("Failed to delete user: " + e.getMessage());
        }
    }

    // Password Reset Methods
    public void requestPasswordReset(String email) {
        try {
            // Check if user exists
            User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No account found with this email address"));
            
            if (!"APPROVED".equals(user.getStatus())) {
                throw new RuntimeException("Account is not approved. Please contact admin.");
            }
            
            // Generate 6-digit reset code
            String resetToken = String.format("%06d", new Random().nextInt(1000000));
            
            // Store token with expiry (15 minutes)
            passwordResetTokens.put(email.toLowerCase(), resetToken);
            tokenExpiryTimes.put(email.toLowerCase(), LocalDateTime.now().plusMinutes(15));
            
            emailService.sendPasswordResetEmail(email, resetToken);
            System.out.println("Password reset email sent to: " + email);
            
        } catch (MessagingException e) {
            // Clean up tokens if email fails
            passwordResetTokens.remove(email.toLowerCase());
            tokenExpiryTimes.remove(email.toLowerCase());
            throw new RuntimeException("Failed to send password reset email: " + e.getMessage());
        } catch (RuntimeException e) {
            throw e; 
        } catch (Exception e) {
            System.err.println("Unexpected error in requestPasswordReset: " + e.getMessage());
            throw new RuntimeException("Failed to process password reset request: " + e.getMessage());
        }
    }
    
    public void resetPassword(String email, String resetToken, String newPassword) {
        try {
            String emailKey = email.toLowerCase();
            
            // Validate token exists
            String storedToken = passwordResetTokens.get(emailKey);
            if (storedToken == null) {
                throw new RuntimeException("Invalid or expired reset token");
            }
            
            // Check if token has expired
            LocalDateTime expiryTime = tokenExpiryTimes.get(emailKey);
            if (expiryTime == null || LocalDateTime.now().isAfter(expiryTime)) {
                // Clean up expired tokens
                passwordResetTokens.remove(emailKey);
                tokenExpiryTimes.remove(emailKey);
                throw new RuntimeException("Reset token has expired. Please request a new one.");
            }
            
            // Validate token matches
            if (!storedToken.equals(resetToken)) {
                throw new RuntimeException("Invalid reset token");
            }
            
            // Find user
            User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Validate new password
            if (!isValidPassword(newPassword)) {
                throw new RuntimeException("Password must be at least 8 characters, including uppercase, lowercase, number, and special character");
            }
            
            // Update password with proper encoding
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);
            
            // Clean up tokens
            passwordResetTokens.remove(emailKey);
            tokenExpiryTimes.remove(emailKey);
            
            System.out.println("Password reset successful for: " + email);
            
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            System.err.println("Unexpected error in resetPassword: " + e.getMessage());
            throw new RuntimeException("Failed to reset password: " + e.getMessage());
        }
    }
    
    private boolean isValidPassword(String password) {
        return password != null && PASSWORD_PATTERN.matcher(password).matches();
    }

    public boolean verifyResetToken(String email, String resetToken) {
        try {
            User user = getUserByEmail(email);
            if (user == null) {
                return false;
            }
            
            String emailKey = email.toLowerCase();
            String storedToken = passwordResetTokens.get(emailKey);
            LocalDateTime expiryTime = tokenExpiryTimes.get(emailKey);
            
            // Check if token exists, matches, and is still valid
            return resetToken != null && storedToken != null 
                   && resetToken.equals(storedToken)
                   && expiryTime != null 
                   && LocalDateTime.now().isBefore(expiryTime);
        } catch (Exception e) {
            return false;
        }
    }
}