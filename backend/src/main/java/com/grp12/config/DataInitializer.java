package com.grp12.config;

import com.grp12.Model.Admin;
import com.grp12.Model.Vehicle;
import com.grp12.Repository.AdminRepository;
import com.grp12.Repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.Base64;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Initialize admins if none exist
        if (adminRepository.count() == 0) {
            initializeDefaultAdmins();
        }

        // Initialize vehicles if none exist
        if (vehicleRepository.count() == 0) {
            initializeDefaultVehicles();
        }
    }

    private void initializeDefaultAdmins() {
        // Super Admin (Manager)
        Admin superAdmin = new Admin();
        superAdmin.setFirstName("Manager");
        superAdmin.setLastName("Super");
        superAdmin.setUsername("manager");
        superAdmin.setEmail("manager@ronaldosrentals.com");
        superAdmin.setPassword(passwordEncoder.encode("Manager123!"));
        superAdmin.setRole("SUPER_ADMIN");
        superAdmin.setCreatedAt(LocalDateTime.now());
        Admin savedSuperAdmin = adminRepository.save(superAdmin);
        
        System.out.println("=== CREATED SUPER ADMIN ===");
        System.out.println("ID: " + savedSuperAdmin.getId());
        System.out.println("Username: " + savedSuperAdmin.getUsername());
        System.out.println("Email: " + savedSuperAdmin.getEmail());
        System.out.println("Role: " + savedSuperAdmin.getRole());
        System.out.println("Encoded Password: " + savedSuperAdmin.getPassword());

        // Admin 1
        Admin admin1 = new Admin();
        admin1.setFirstName("Admin");
        admin1.setLastName("One");
        admin1.setUsername("admin1");
        admin1.setEmail("admin1@ronaldosrentals.com");
        admin1.setPassword(passwordEncoder.encode("Admin123!"));
        admin1.setRole("ADMIN");
        admin1.setCreatedAt(LocalDateTime.now());
        Admin savedAdmin1 = adminRepository.save(admin1);
        
        System.out.println("=== CREATED ADMIN 1 ===");
        System.out.println("ID: " + savedAdmin1.getId());
        System.out.println("Username: " + savedAdmin1.getUsername());
        System.out.println("Email: " + savedAdmin1.getEmail());

        long totalAdmins = adminRepository.count();
        System.out.println("=== TOTAL ADMINS IN DATABASE: " + totalAdmins + " ===");
    }

    private void initializeDefaultVehicles() throws IOException {
        // Sample vehicle 1: Toyota Camry
        Vehicle vehicle1 = new Vehicle();
        vehicle1.setMake("Nissan");
        vehicle1.setModel("Xtrail");
        vehicle1.setVehicleType("SUV");
        vehicle1.setYear(2020);
        vehicle1.setColor("RED");
        vehicle1.setLicensePlate("AB 123");
        vehicle1.setVin("4T1BF1FK0LU123456");
        vehicle1.setFuelType("Petrol");
        vehicle1.setTransmission("Automatic");
        vehicle1.setSeatingCapacity(5);
        vehicle1.setMileage(50000);
        vehicle1.setPricePerDay(new BigDecimal("150.00"));
        vehicle1.setLocation("Suva");
        vehicle1.setStatus("Available");
        vehicle1.setDescription("Reliable and fuel-efficient sedan, perfect for city driving.");
        vehicle1.setFeatures("{\"AC\": true, \"GPS\": true, \"Bluetooth\": true}");
        vehicle1.setCreatedAt(LocalDateTime.now());

        
        String[] toyotaImages = {"xtrail1.jpg", "xtrail2.jpg", "xtrail3.jpg"};
        for (int i = 0; i < toyotaImages.length; i++) {
            Path imagePath = Paths.get("DB Images", toyotaImages[i]);
            if (Files.exists(imagePath)) {
                byte[] imageBytes = Files.readAllBytes(imagePath);
                String base64Image = Base64.getEncoder().encodeToString(imageBytes);
                if (i == 0) vehicle1.setVehicleImage1(base64Image);
                else if (i == 1) vehicle1.setVehicleImage2(base64Image);
                else vehicle1.setVehicleImage3(base64Image);
            } else {
                System.out.println("Warning: Image file not found at " + imagePath);
            }
        }

        Vehicle savedVehicle1 = vehicleRepository.save(vehicle1);
        
        System.out.println("=== CREATED VEHICLE 1 ===");
        System.out.println("ID: " + savedVehicle1.getId());
        System.out.println("Make: " + savedVehicle1.getMake());
        System.out.println("Model: " + savedVehicle1.getModel());
        System.out.println("License Plate: " + savedVehicle1.getLicensePlate());

        // Sample vehicle 2: Honda CR-V
        Vehicle vehicle2 = new Vehicle();
        vehicle2.setMake("Toyota");
        vehicle2.setModel("Land Cruiser");
        vehicle2.setVehicleType("SUV");
        vehicle2.setYear(2021);
        vehicle2.setColor("Black");
        vehicle2.setLicensePlate("MA 789");
        vehicle2.setVin("5J6RW2H51MA123456");
        vehicle2.setFuelType("Hybrid");
        vehicle2.setTransmission("Automatic");
        vehicle2.setSeatingCapacity(5);
        vehicle2.setMileage(30000);
        vehicle2.setPricePerDay(new BigDecimal("170.00"));
        vehicle2.setLocation("Nadi");
        vehicle2.setStatus("Available");
        vehicle2.setDescription("Spacious and eco-friendly SUV, great for family trips.");
        vehicle2.setFeatures("{\"AC\": true, \"GPS\": true, \"Sunroof\": true}");
        vehicle2.setCreatedAt(LocalDateTime.now());

      
        String[] hondaImages = {"lc1.jpg", "lc2.jpg", "lc3.jpg"};
        for (int i = 0; i < hondaImages.length; i++) {
            Path imagePath = Paths.get("DB Images", hondaImages[i]);
            if (Files.exists(imagePath)) {
                byte[] imageBytes = Files.readAllBytes(imagePath);
                String base64Image = Base64.getEncoder().encodeToString(imageBytes);
                if (i == 0) vehicle2.setVehicleImage1(base64Image);
                else if (i == 1) vehicle2.setVehicleImage2(base64Image);
                else vehicle2.setVehicleImage3(base64Image);
            } else {
                System.out.println("Warning: Image file not found at " + imagePath);
            }
        }

        Vehicle savedVehicle2 = vehicleRepository.save(vehicle2);
        
        System.out.println("=== CREATED VEHICLE 2 ===");
        System.out.println("ID: " + savedVehicle2.getId());
        System.out.println("Make: " + savedVehicle2.getMake());
        System.out.println("Model: " + savedVehicle2.getModel());
        System.out.println("License Plate: " + savedVehicle2.getLicensePlate());

        long totalVehicles = vehicleRepository.count();
        System.out.println("=== TOTAL VEHICLES IN DATABASE: " + totalVehicles + " ===");
    }
}