package com.grp12.Services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Random;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

   
    private final Map<String, VerificationData> verificationCodes = new ConcurrentHashMap<>();

    public void sendVerificationCode(String email) throws MessagingException {
        // Generate 6-digit verification code
        String code = String.format("%06d", new Random().nextInt(999999));
        
        // Store code with 10-minute expiration
        verificationCodes.put(email, new VerificationData(code, System.currentTimeMillis() + 600000));
        
        // Create and send email
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        
        helper.setTo(email);
        helper.setSubject("Email Verification - Ronaldo's Rentals");
        helper.setText(buildEmailHtml(code), true);
        
        mailSender.send(message);
        
        System.out.println("Verification email sent to: " + email);
    }

    public boolean verifyCode(String email, String code) {
        VerificationData data = verificationCodes.get(email);
        
        if (data == null) {
            return false;
        }
        
        // Check if expired
        if (System.currentTimeMillis() > data.expirationTime) {
            verificationCodes.remove(email);
            return false;
        }
        
        // Check if code matches
        if (data.code.equals(code)) {
            verificationCodes.remove(email); 
            return true;
        }
        
        return false;
    }

    // Send approval notification
    public void sendApprovalNotification(String email, String firstName, String lastName, boolean isApproved) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        
        helper.setTo(email);
        
        if (isApproved) {
            helper.setSubject("Account Approved - Welcome to Ronaldo's Rentals!");
            helper.setText(buildApprovalEmailHtml(firstName, lastName), true);
        } else {
            helper.setSubject("Account Application Update - Ronaldo's Rentals");
            helper.setText(buildRejectionEmailHtml(firstName, lastName), true);
        }
        
        mailSender.send(message);
        
        System.out.println("Approval notification sent to: " + email + " (approved: " + isApproved + ")");
    }

    // Password reset email method 
    public void sendPasswordResetEmail(String email, String resetToken) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setTo(email);
        helper.setSubject("Password Reset - Ronaldo's Rentals");
        helper.setText(buildPasswordResetEmailHtml(resetToken), true);

        mailSender.send(message);

        System.out.println("Password reset email sent to: " + email);
    }

    // Send cancellation notification
    public void sendCancellationEmail(String email, String firstName, String lastName, Long reservationId, String vehicleName, String cancellationFee, String totalAmount, String refundAmount) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setTo(email);
        helper.setSubject("Reservation Cancelled - Ronaldo's Rentals");
        helper.setText(buildCancellationEmailHtml(firstName, lastName, reservationId, vehicleName, cancellationFee, totalAmount, refundAmount), true);

        mailSender.send(message);

        System.out.println("Cancellation email sent to: " + email);
    }

    // Send admin credentials email
    public void sendAdminCredentialsEmail(String email, String firstName, String lastName, String username, String password) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setTo(email);
        helper.setSubject("Admin Account Created - Ronaldo's Rentals");
        helper.setText(buildAdminCredentialsEmailHtml(firstName, lastName, username, password), true);

        mailSender.send(message);

        System.out.println("Admin credentials email sent to: " + email);
    }

    // Send reservation confirmation notification
    public void sendReservationConfirmationEmail(String email, String firstName, String lastName, Long reservationId, String vehicleName, String rentalDate, String returnDate, String totalPrice) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setTo(email);
        helper.setSubject("Reservation Confirmed - Ronaldo's Rentals");
        helper.setText(buildReservationConfirmationEmailHtml(firstName, lastName, reservationId, vehicleName, rentalDate, returnDate, totalPrice), true);

        mailSender.send(message);

        System.out.println("Reservation confirmation email sent to: " + email);
    }

    private String buildReservationConfirmationEmailHtml(String firstName, String lastName, Long reservationId, String vehicleName, String rentalDate, String returnDate, String totalPrice) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<style>" +
                "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }" +
                ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                ".header { background-color: #27ae60; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }" +
                ".content { padding: 30px; background-color: #f9f9f9; }" +
                ".footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }" +
                ".info-box { background-color: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 4px; margin: 15px 0; }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'>" +
                "<h1>🚗 Ronaldo's Rentals</h1>" +
                "<h2>Your Payment Receipt</h2>" +
                "</div>" +
                "<div class='content'>" +
                "<h3>Dear " + firstName + " " + lastName + ",</h3>" +
                "<div class='info-box'>" +
                "<p><strong>Your reservation has been successfully confirmed!</strong></p>" +
                "</div>" +
                "<p><strong>Reservation Details:</strong></p>" +
                "<ul>" +
                "<li><strong>Reservation ID:</strong> " + reservationId + "</li>" +
                "<li><strong>Vehicle:</strong> " + vehicleName + "</li>" +
                "<li><strong>Rental Date:</strong> " + rentalDate + "</li>" +
                "<li><strong>Return Date:</strong> " + returnDate + "</li>" +
                "<li><strong>Total Price:</strong> $" + totalPrice + "</li>" +
                "</ul>" +
                "<p>Thank you for choosing Ronaldo's Rentals. We look forward to serving you!</p>" +
                "<p>If you have any questions about your reservation, please contact our support team.</p>" +
                "</div>" +
                "<div class='footer'>" +
                "<p>© 2025 Ronaldo's Rentals. All rights reserved.</p>" +
                "<p>This email was sent to " + firstName + " " + lastName + "</p>" +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>";
    }

    // Build password reset email HTML
    private String buildPasswordResetEmailHtml(String resetToken) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<style>" +
                "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }" +
                ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                ".header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }" +
                ".content { padding: 30px; background-color: #f9f9f9; }" +
                ".code { font-size: 32px; font-weight: bold; color: #667eea; text-align: center; " +
                "padding: 20px; background-color: white; border: 2px dashed #667eea; margin: 20px 0; border-radius: 8px; letter-spacing: 8px; }" +
                ".footer { background: #333; color: white; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }" +
                ".warning { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin: 15px 0; }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'>" +
                "<h1>Password Reset Request</h1>" +
                "</div>" +
                "<div class='content'>" +
                "<p>Hello,</p>" +
                "<p>You have requested to reset your password for your Ronaldo's Rentals account.</p>" +
                "<p>Your password reset code is:</p>" +
                "<div class='code'>" + resetToken + "</div>" +
                "<div class='warning'>" +
                "<strong>⚠️ Important:</strong> This code will expire in 15 minutes for security reasons." +
                "</div>" +
                "<p>If you did not request this password reset, please ignore this email and your password will remain unchanged.</p>" +
                "<p>Enter this code in the password reset form to set your new password.</p>" +
                "</div>" +
                "<div class='footer'>" +
                "<p>&copy; 2024 Ronaldo's Rentals. All rights reserved.</p>" +
                "<p>This is an automated message, please do not reply to this email.</p>" +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>";
    }

    private String buildApprovalEmailHtml(String firstName, String lastName) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<style>" +
                "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }" +
                ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                ".header { background-color: #27ae60; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }" +
                ".content { padding: 30px; background-color: #f9f9f9; }" +
                ".cta-button { display: inline-block; background-color: #2c3e50; color: white; padding: 15px 30px; " +
                "text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }" +
                ".cta-button:hover { background-color: #34495e; }" +
                ".footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }" +
                ".success-box { background-color: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 4px; margin: 15px 0; }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'>" +
                "<h1>🚗 Ronaldo's Rentals</h1>" +
                "<h2>🎉 Account Approved!</h2>" +
                "</div>" +
                "<div class='content'>" +
                "<h3>Congratulations, " + firstName + " " + lastName + "!</h3>" +
                "<div class='success-box'>" +
                "<p><strong>Great news!</strong> Your account has been approved by our admin team.</p>" +
                "</div>" +
                "<p>You can now access all features of Ronaldo's Rentals, including:</p>" +
                "<ul>" +
                "<li>Browse our extensive vehicle fleet</li>" +
                "<li>Make reservations online</li>" +
                "<li>Manage your bookings</li>" +
                "<li>Track your rental history</li>" +
                "</ul>" +
                "<p>Ready to get started? Click the button below to access your dashboard:</p>" +
                "<div style='text-align: center;'>" +
                "<a href='http://localhost:3000/dashboard' class='cta-button'>Access Your Dashboard</a>" +
                "</div>" +
                "<p>You can also visit our website directly at: <a href='http://localhost:3000'>http://localhost:3000</a></p>" +
                "<p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>" +
                "<p>Welcome to the Ronaldo's Rentals family!</p>" +
                "</div>" +
                "<div class='footer'>" +
                "<p>© 2025 Ronaldo's Rentals. All rights reserved.</p>" +
                "<p>This email was sent to " + firstName + " " + lastName + "</p>" +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>";
    }

    private String buildRejectionEmailHtml(String firstName, String lastName) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<style>" +
                "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }" +
                ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                ".header { background-color: #e74c3c; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }" +
                ".content { padding: 30px; background-color: #f9f9f9; }" +
                ".cta-button { display: inline-block; background-color: #2c3e50; color: white; padding: 15px 30px; " +
                "text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }" +
                ".cta-button:hover { background-color: #34495e; }" +
                ".footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }" +
                ".warning-box { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin: 15px 0; }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'>" +
                "<h1>🚗 Ronaldo's Rentals</h1>" +
                "<h2>Account Application Update</h2>" +
                "</div>" +
                "<div class='content'>" +
                "<h3>Dear " + firstName + " " + lastName + ",</h3>" +
                "<div class='warning-box'>" +
                "<p><strong>Account Status:</strong> Unfortunately, your account application was not approved at this time.</p>" +
                "</div>" +
                "<p>We appreciate your interest in Ronaldo's Rentals. After reviewing your application, we were unable to approve your account based on our current requirements.</p>" +
                "<p><strong>What you can do:</strong></p>" +
                "<ul>" +
                "<li>Review your submitted information for accuracy</li>" +
                "<li>Ensure all required documents are clear and valid</li>" +
                "<li>Contact our support team for specific feedback</li>" +
                "<li>Reapply after addressing any issues</li>" +
                "</ul>" +
                "<p>You're welcome to submit a new application if you believe this decision was made in error or if your circumstances have changed.</p>" +
                "<div style='text-align: center;'>" +
                "<a href='http://localhost:3000/login' class='cta-button'>Visit Our Website</a>" +
                "</div>" +
                "<p>If you have questions about this decision, please contact our support team.</p>" +
                "</div>" +
                "<div class='footer'>" +
                "<p>© 2025 Ronaldo's Rentals. All rights reserved.</p>" +
                "<p>This email was sent to " + firstName + " " + lastName + "</p>" +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>";
    }

    private String buildEmailHtml(String code) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<style>" +
                "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }" +
                ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                ".header { background-color: #2c3e50; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }" +
                ".content { padding: 20px; background-color: #f9f9f9; }" +
                ".code { font-size: 32px; font-weight: bold; color: #2c3e50; text-align: center; " +
                "padding: 20px; background-color: white; border: 2px dashed #2c3e50; margin: 20px 0; border-radius: 8px; }" +
                ".footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }" +
                ".warning { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin: 15px 0; }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'>" +
                "<h1>🚗 Ronaldo's Rentals</h1>" +
                "</div>" +
                "<div class='content'>" +
                "<h2>Email Verification Required</h2>" +
                "<p>Thank you for registering with Ronaldo's Rentals!</p>" +
                "<p>To complete your registration, please use the following verification code:</p>" +
                "<div class='code'>" + code + "</div>" +
                "<div class='warning'>" +
                "<strong>⚠️ Important:</strong> This verification code will expire in 10 minutes." +
                "</div>" +
                "<p>If you didn't request this verification, please ignore this email.</p>" +
                "<p>After verification, your account will be reviewed by our admin team for approval.</p>" +
                "</div>" +
                "<div class='footer'>" +
                "<p>© 2025 Ronaldo's Rentals. All rights reserved.</p>" +
                "<p>This is an automated message, please do not reply to this email.</p>" +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>";
    }

    // Build admin credentials email HTML
    private String buildAdminCredentialsEmailHtml(String firstName, String lastName, String username, String password) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<style>" +
                "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }" +
                ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                ".header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }" +
                ".content { padding: 30px; background-color: #f9f9f9; }" +
                ".credentials-box { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0; }" +
                ".credential-item { margin: 10px 0; padding: 10px; background-color: white; border-radius: 4px; border-left: 4px solid #667eea; }" +
                ".warning { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin: 15px 0; }" +
                ".cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; " +
                "text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }" +
                ".footer { background: #333; color: white; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'>" +
                "<h1>🚗 Ronaldo's Rentals</h1>" +
                "<h2>Admin Account Created!</h2>" +
                "</div>" +
                "<div class='content'>" +
                "<h3>Welcome, " + firstName + " " + lastName + "!</h3>" +
                "<p><strong>Congratulations!</strong> You have been granted admin access to Ronaldo's Rentals management system.</p>" +
                "<div class='credentials-box'>" +
                "<h4 style='margin-top: 0; color: #856404;'>Your Login Credentials</h4>" +
                "<div class='credential-item'>" +
                "<strong>Username:</strong> " + username + "</div>" +
                "<div class='credential-item'>" +
                "<strong>Password:</strong> " + password + "</div>" +
                "</div>" +
                "<div class='warning'>" +
                "<strong>⚠️ Security Notice:</strong> Please change your password after your first login for security purposes." +
                "</div>" +
                "<p><strong>As an admin, you can:</strong></p>" +
                "<ul>" +
                "<li>Manage vehicle inventory and maintenance</li>" +
                "<li>Review and approve customer registrations</li>" +
                "<li>Handle reservation requests</li>" +
                "<li>Access administrative reports</li>" +
                "</ul>" +
                "<div style='text-align: center;'>" +
                "<a href='http://localhost:3000/login' class='cta-button'>Login to Admin Panel</a>" +
                "</div>" +
                "<p>If you have any questions about your admin privileges or need assistance, please contact the super admin.</p>" +
                "</div>" +
                "<div class='footer'>" +
                "<p>&copy; 2025 Ronaldo's Rentals. All rights reserved.</p>" +
                "<p>This is an automated message, please do not reply to this email.</p>" +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>";
    }

    private String buildCancellationEmailHtml(String firstName, String lastName, Long reservationId, String vehicleName, String cancellationFee, String totalAmount, String refundAmount) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<style>" +
                "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }" +
                ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                ".header { background-color: #e74c3c; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }" +
                ".content { padding: 30px; background-color: #f9f9f9; }" +
                ".footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }" +
                ".info-box { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin: 15px 0; }" +
                ".fee-box { background-color: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 4px; margin: 15px 0; }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'>" +
                "<h1>🚗 Ronaldo's Rentals</h1>" +
                "<h2>Your Payment Receipt</h2>" +
                "</div>" +
                "<div class='content'>" +
                "<h3>Dear " + firstName + " " + lastName + ",</h3>" +
                "<div class='info-box'>" +
                "<p><strong>Your reservation has been successfully cancelled.</strong></p>" +
                "</div>" +
                "<p><strong>Reservation Details:</strong></p>" +
                "<ul>" +
                "<li><strong>Reservation ID:</strong> " + reservationId + "</li>" +
                "<li><strong>Vehicle:</strong> " + vehicleName + "</li>" +
                "<li><strong>Original Total Amount:</strong> $" + totalAmount + " FJD</li>" +
                "</ul>" +
                "<div class='fee-box'>" +
                "<p><strong>Refund Amount:</strong> $" + refundAmount + " FJD</p>" +
                "<p><em>Note: All bookings are non-refundable. The refund amount is after deducting any applicable cancellation fees.</em></p>" +
                "</div>" +
                "<p>If this cancellation was made in error or if you have any questions, please contact our support team immediately.</p>" +
                "<p>You can make a new reservation anytime through our website.</p>" +
                "</div>" +
                "<div class='footer'>" +
                "<p>© 2025 Ronaldo's Rentals. All rights reserved.</p>" +
                "<p>This email was sent to " + firstName + " " + lastName + "</p>" +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>";
    }

   
    private static class VerificationData {
        final String code;
        final long expirationTime;

        VerificationData(String code, long expirationTime) {
            this.code = code;
            this.expirationTime = expirationTime;
        }
    }
}