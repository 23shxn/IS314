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
            // Validate inputs
            if (!NAME_PATTERN.matcher(user.getFirstName()).matches()) {
                throw new IllegalArgumentException("First name must contain only letters and spaces");
            }
            
            if (!NAME_PATTERN.matcher(user.getLastName()).matches()) {
                throw new IllegalArgumentException("Last name must contain only letters and spaces");
            }
            
            if (!PHONE_PATTERN.matcher(user.getPhoneNumber()).matches()) {
                throw new IllegalArgumentException("Phone number must be exactly 7 digits");
            }
            
            if (!EMAIL_PATTERN.matcher(user.getEmail()).matches()) {
                throw new IllegalArgumentException("Email must end with @gmail.com");
            }
            
            if (!PASSWORD_PATTERN.matcher(user.getPassword()).matches()) {
                throw new IllegalArgumentException("Password must be at least 8 characters, including uppercase, lowercase, number, and special character");
            }
            
            // Check if email already exists in User table (more efficient)
            if (userRepository.existsByEmail(user.getEmail())) {
                throw new IllegalArgumentException("Email already exists");
            }
            
            // Check if phone number already exists in User table
            if (userRepository.existsByPhoneNumber(user.getPhoneNumber())) {
                throw new IllegalArgumentException("Phone number already exists");
            }
            
            // Check if driver's license already exists in User table (more efficient)
            if (userRepository.existsByDriversLicenseNumber(user.getDriversLicenseNumber())) {
                throw new IllegalArgumentException("Driver's license number already exists");
            }
            
            // Check in pending requests as well
            if (registrationRequestRepository.existsByEmail(user.getEmail())) {
                throw new IllegalArgumentException("Email already has a pending request");
            }
            
            if (registrationRequestRepository.existsByPhoneNumber(user.getPhoneNumber())) {
                throw new IllegalArgumentException("Phone number already has a pending request");
            }
            
            if (registrationRequestRepository.existsByDriversLicenseNumber(user.getDriversLicenseNumber())) {
                throw new IllegalArgumentException("Driver's license number already has a pending request");
            }
            
            // Create new registration request
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

    public User approveUser(Long userId) {
        try {
            RegistrationRequest request = registrationRequestRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Registration request not found"));
            
            if (!"PENDING".equals(request.getStatus())) {
                throw new RuntimeException("Request already processed");
            }
            
            // Create user from registration request
            User user = new User();
            user.setFirstName(request.getFirstName());
            user.setLastName(request.getLastName());
            user.setEmail(request.getEmail());
            user.setPassword(request.getPassword());
            user.setPhoneNumber(request.getPhoneNumber());
            user.setDriversLicenseNumber(request.getDriversLicenseNumber());
            user.setDriversLicenseImage(request.getDriversLicenseImage());
            user.setRole("ROLE_CUSTOMER");
            user.setStatus("APPROVED");
            // Set createdAt to current time instead of just checking if it's null
            user.setCreatedAt(LocalDateTime.now());
            
            // Save user to User table
            User savedUser = userRepository.save(user);
            
            // Update request status
            request.setStatus("APPROVED");
            registrationRequestRepository.save(request);
            
            // Send approval email
            try {
                emailService.sendApprovalNotification(
                    request.getEmail(), 
                    request.getFirstName(), 
                    request.getLastName(), 
                    true
                );
                System.out.println("Approval email sent to: " + request.getEmail());
            } catch (MessagingException e) {
                System.err.println("Failed to send approval email: " + e.getMessage());
            }
            
            return savedUser;
            
        } catch (Exception e) {
            System.err.println("Error in approveUser: " + e.getMessage());
            throw new RuntimeException("Failed to approve user: " + e.getMessage());
        }
    }

    public void rejectUser(Long userId) {
        try {
            RegistrationRequest request = registrationRequestRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Registration request not found"));
            
            if (!"PENDING".equals(request.getStatus())) {
                throw new RuntimeException("Request already processed");
            }
            
            // Send rejection email before marking as rejected
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
            throw e; // Re-throw runtime exceptions as-is
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
            throw e; // Re-throw runtime exceptions as-is
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