package com.grp12.Controller;

import com.grp12.Services.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.mail.MessagingException;
import java.util.Map;

@RestController
@RequestMapping("/api/email")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class EmailController {

    @Autowired
    private EmailService emailService;

    @PostMapping("/send-verification")
    public ResponseEntity<?> sendVerificationCode(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            
            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
            }
            
            if (!email.endsWith("@gmail.com")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email must end with @gmail.com"));
            }
            
            emailService.sendVerificationCode(email);
            return ResponseEntity.ok(Map.of("message", "Verification code sent successfully"));
            
        } catch (MessagingException e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to send verification email"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "An unexpected error occurred"));
        }
    }

    @PostMapping("/verify-code")
    public ResponseEntity<?> verifyCode(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String code = request.get("code");
            
            if (email == null || code == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Email and verification code are required"));
            }
            
            boolean isValid = emailService.verifyCode(email, code);
            
            if (isValid) {
                return ResponseEntity.ok(Map.of("message", "Email verified successfully"));
            } else {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Invalid or expired verification code"));
            }
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "An unexpected error occurred"));
        }
    }
}