package com.grp12.Services;

import com.grp12.Model.RegistrationRequest;
import com.grp12.Model.User;
import com.grp12.Repository.RegistrationRequestRepository;
import com.grp12.Repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RegistrationRequestRepository registrationRequestRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private UserService userService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setEmail("test@gmail.com");
        testUser.setPassword("password123");
        testUser.setFirstName("John");
        testUser.setLastName("Doe");
        testUser.setPhoneNumber("1234567");
        testUser.setDriversLicenseNumber("1234567");
        testUser.setDriversLicenseImage("base64image");
    }

    @Test
    void registerUser_ValidUser_ShouldCreateRegistrationRequest() {
        // Arrange
        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.empty());
        when(registrationRequestRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(any())).thenReturn("encodedPassword");
        when(registrationRequestRepository.save(any())).thenReturn(new RegistrationRequest());

        // Act
        RegistrationRequest result = userService.registerUser(testUser);

        // Assert
        assertNotNull(result);
        verify(registrationRequestRepository).save(any(RegistrationRequest.class));
    }

    @Test
    void registerUser_InvalidDriversLicenseNumber_ShouldThrowException() {
        // Arrange
        testUser.setDriversLicenseNumber("123456"); // Only 6 digits

        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            userService.registerUser(testUser);
        });
        assertEquals("Driver's license number must be exactly 7 digits", exception.getMessage());
    }

    @Test
    void registerUser_InvalidDriversLicenseNumberWithLetters_ShouldThrowException() {
        // Arrange
        testUser.setDriversLicenseNumber("123456A"); // Contains letter

        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            userService.registerUser(testUser);
        });
        assertEquals("Driver's license number must be exactly 7 digits", exception.getMessage());
    }

    @Test
    void registerUser_ValidDriversLicenseNumber_ShouldAccept() {
        // Arrange
        testUser.setDriversLicenseNumber("1234567"); // Exactly 7 digits
        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.empty());
        when(registrationRequestRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(any())).thenReturn("encodedPassword");
        when(registrationRequestRepository.save(any())).thenReturn(new RegistrationRequest());

        // Act
        RegistrationRequest result = userService.registerUser(testUser);

        // Assert
        assertNotNull(result);
        verify(registrationRequestRepository).save(any(RegistrationRequest.class));
    }

    @Test
    void registerUser_NullDriversLicenseNumber_ShouldThrowException() {
        // Arrange
        testUser.setDriversLicenseNumber(null);

        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            userService.registerUser(testUser);
        });
        assertEquals("Driver's license number is required", exception.getMessage());
    }

    @Test
    void registerUser_EmptyDriversLicenseNumber_ShouldThrowException() {
        // Arrange
        testUser.setDriversLicenseNumber("");

        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            userService.registerUser(testUser);
        });
        assertEquals("Driver's license number is required", exception.getMessage());
    }

    @Test
    void registerUser_WhitespaceDriversLicenseNumber_ShouldThrowException() {
        // Arrange
        testUser.setDriversLicenseNumber("   ");

        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            userService.registerUser(testUser);
        });
        assertEquals("Driver's license number is required", exception.getMessage());
    }
}
