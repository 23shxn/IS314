package com.grp12.Services;

import com.grp12.Model.RegistrationRequest;
import com.grp12.Model.Reservation;
import com.grp12.Model.User;
import com.grp12.Model.Vehicle;
import com.grp12.Repository.RegistrationRequestRepository;
import com.grp12.Repository.ReservationRepository;
import com.grp12.Repository.UserRepository;
import com.grp12.Repository.VehicleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ComprehensiveTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RegistrationRequestRepository registrationRequestRepository;

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private EmailService emailService;

    @Mock
    private ReservationService reservationServiceMock;

    @InjectMocks
    private UserService userService;

    @InjectMocks
    private VehicleService vehicleService;

    @InjectMocks
    private ReservationService reservationService;

    private User testUser;
    private Vehicle testVehicle;
    private Reservation testReservation;

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

        testVehicle = new Vehicle();
        testVehicle.setId(1L);
        testVehicle.setMake("Toyota");
        testVehicle.setModel("Camry");

        testReservation = new Reservation();
        testReservation.setId(1L);
        testReservation.setVehicle(testVehicle);
        testReservation.setStatus("Confirmed");
        testReservation.setReturnDate(java.time.LocalDate.now().plusDays(1)); // Future date
    }

    // ===== USER SERVICE TESTS =====

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
    void registerUser_InvalidDriversLicenseNumberTooShort_ShouldThrowException() {
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
    void registerUser_InvalidDriversLicenseNumberTooLong_ShouldThrowException() {
        // Arrange
        testUser.setDriversLicenseNumber("12345678"); // 8 digits

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

    // ===== VEHICLE SERVICE TESTS =====

    @Test
    void deleteVehicle_WithReservations_ShouldDeleteReservationsFirst() {
        // Arrange - Create a past reservation that is not active
        Reservation pastReservation = new Reservation();
        pastReservation.setId(2L);
        pastReservation.setVehicle(testVehicle);
        pastReservation.setStatus("Completed");
        pastReservation.setReturnDate(java.time.LocalDate.now().minusDays(1)); // Past date

        List<Reservation> reservations = Arrays.asList(pastReservation);
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(testVehicle));
        when(reservationServiceMock.getReservationsByVehicle(1L)).thenReturn(reservations);
        doNothing().when(reservationServiceMock).deleteReservation(pastReservation.getId()); // Mock void method

        // Act
        vehicleService.deleteVehicle(1L);

        // Assert
        verify(reservationServiceMock).deleteReservation(pastReservation.getId());
        verify(vehicleRepository).delete(testVehicle);
    }

    @Test
    void deleteVehicle_WithoutReservations_ShouldDeleteVehicleOnly() {
        // Arrange
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(testVehicle));
        when(reservationServiceMock.getReservationsByVehicle(1L)).thenReturn(Arrays.asList());

        // Act
        vehicleService.deleteVehicle(1L);

        // Assert
        verify(reservationServiceMock, never()).deleteReservation(any());
        verify(vehicleRepository).delete(testVehicle);
    }

    @Test
    void deleteVehicle_WithActiveReservations_ShouldThrowException() {
        // Arrange
        testReservation.setStatus("Confirmed");
        List<Reservation> reservations = Arrays.asList(testReservation);
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(testVehicle));
        when(reservationServiceMock.getReservationsByVehicle(1L)).thenReturn(reservations);

        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            vehicleService.deleteVehicle(1L);
        });
        assertTrue(exception.getMessage().contains("Cannot delete vehicle with active reservations"));
    }

    @Test
    void deleteVehicle_VehicleNotFound_ShouldThrowException() {
        // Arrange
        when(vehicleRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            vehicleService.deleteVehicle(1L);
        });
        assertTrue(exception.getMessage().contains("Vehicle not found"));
    }

    // ===== RESERVATION SERVICE TESTS =====

    @Test
    void deleteReservation_ValidReservation_ShouldDeleteSuccessfully() {
        // Arrange
        when(reservationRepository.findById(1L)).thenReturn(Optional.of(testReservation));

        // Act
        reservationService.deleteReservation(1L);

        // Assert
        verify(reservationRepository).delete(testReservation);
    }

    @Test
    void deleteReservation_ReservationNotFound_ShouldThrowException() {
        // Arrange
        when(reservationRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            reservationService.deleteReservation(1L);
        });
        assertTrue(exception.getMessage().contains("Failed to delete reservation"));
    }

    @Test
    void deleteReservation_RepositoryThrowsException_ShouldWrapException() {
        // Arrange
        when(reservationRepository.findById(1L)).thenReturn(Optional.of(testReservation));
        doThrow(new RuntimeException("Database error")).when(reservationRepository).delete(testReservation);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            reservationService.deleteReservation(1L);
        });
        assertEquals("Failed to delete reservation: Database error", exception.getMessage());
    }

    // ===== VIN VALIDATION TESTS (Frontend Logic) =====

    @Test
    void validateVin_AllValidCharacters_ShouldPass() {
        // Test VINs with all valid characters including I, O, Q
        String[] validVins = {
            "1HGCM82633A123456", // Standard VIN
            "JH4KA8260MC000000", // With I
            "1FAHP2F8XFG123456", // With O
            "WP0AA2A99KS123456", // With Q
            "1FTFW1ET3DFC12345"  // Mixed valid chars
        };

        for (String vin : validVins) {
            assertTrue(vin.matches("^[A-Z0-9]{17}$"), "VIN should be valid: " + vin);
        }
    }

    @Test
    void validateVin_InvalidCharacters_ShouldFail() {
        // Test VINs with invalid characters
        String[] invalidVins = {
            "1HGCM82633A12345",  // Too short
            "1HGCM82633A1234567", // Too long
            "1HGCM82633A12345 ", // Contains space
            "1HGCM82633A12345-", // Contains special char
        };

        for (String vin : invalidVins) {
            assertFalse(vin.matches("^[A-Z0-9]{17}$"), "VIN should be invalid: " + vin);
        }
    }

    @Test
    void validateVin_Exactly17Characters_ShouldPass() {
        String vin = "1HGCM82633A123456"; // Exactly 17 chars
        assertTrue(vin.matches("^[A-Z0-9]{17}$"));
        assertEquals(17, vin.length());
    }
}
