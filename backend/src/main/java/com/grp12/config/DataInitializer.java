package com.grp12.config;

import com.grp12.Model.Admin;
import com.grp12.Repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        
        if (adminRepository.count() == 0) {
            initializeDefaultAdmins();
        }
    }

    private void initializeDefaultAdmins() {
        
        Admin superAdmin = new Admin();
        superAdmin.setFirstName("Manager");
        superAdmin.setLastName("Super");
        superAdmin.setUsername("manager");
        superAdmin.setEmail("manager@ronaldosrentals.com");
        superAdmin.setPassword(passwordEncoder.encode("Manager123!"));
        superAdmin.setRole("SUPER_ADMIN");
        superAdmin.setCreatedAt(java.time.LocalDateTime.now());
        Admin savedSuperAdmin = adminRepository.save(superAdmin);
        
        System.out.println("=== CREATED SUPER ADMIN ===");
        System.out.println("ID: " + savedSuperAdmin.getId());
        System.out.println("Username: " + savedSuperAdmin.getUsername());
        System.out.println("Email: " + savedSuperAdmin.getEmail());
        System.out.println("Role: " + savedSuperAdmin.getRole());
        System.out.println("Encoded Password: " + savedSuperAdmin.getPassword());

        
        Admin admin1 = new Admin();
        admin1.setFirstName("Admin");
        admin1.setLastName("One");
        admin1.setUsername("admin1");
        admin1.setEmail("admin1@ronaldosrentals.com");
        admin1.setPassword(passwordEncoder.encode("Admin123!"));
        admin1.setRole("ADMIN");
        admin1.setCreatedAt(java.time.LocalDateTime.now());
        Admin savedAdmin1 = adminRepository.save(admin1);
        
        System.out.println("=== CREATED ADMIN 1 ===");
        System.out.println("ID: " + savedAdmin1.getId());
        System.out.println("Username: " + savedAdmin1.getUsername());
        System.out.println("Email: " + savedAdmin1.getEmail());

        
        
        
        long totalAdmins = adminRepository.count();
        System.out.println("=== TOTAL ADMINS IN DATABASE: " + totalAdmins + " ===");
    }
}
