package com.grp12.config;

import com.grp12.Model.Admin;
import com.grp12.Model.User;
import com.grp12.Repository.AdminRepository;
import com.grp12.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import jakarta.servlet.http.HttpServletResponse;
import java.util.Arrays;
import java.util.Optional;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private AdminRepository adminRepository;
    
    @Autowired
    private UserRepository userRepository;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return username -> {
            System.out.println("=== LOADING USER: " + username + " ===");
            
            try {
                
                Optional<Admin> adminOptional = adminRepository.findByEmail(username);
                if (!adminOptional.isPresent()) {
                    
                    adminOptional = adminRepository.findByUsername(username);
                }
                
                if (adminOptional.isPresent()) {
                    Admin admin = adminOptional.get();
                    System.out.println("Found admin user: " + admin.getEmail());
                    String authority = "SUPER_ADMIN".equals(admin.getRole()) ? "ROLE_SUPER_ADMIN" : "ROLE_ADMIN";
                    return org.springframework.security.core.userdetails.User.builder()
                        .username(admin.getEmail())
                        .password(admin.getPassword())
                        .authorities(authority)
                        .build();
                }
                
                
                Optional<User> userOptional = userRepository.findByEmailForAuth(username);
                if (userOptional.isPresent()) {
                    User user = userOptional.get();
                    System.out.println("Found regular user: " + user.getEmail());
                    
                    
                    return org.springframework.security.core.userdetails.User.builder()
                        .username(user.getEmail())
                        .password(user.getPassword())
                        .authorities("ROLE_USER")
                        .disabled(!user.getApproved()) 
                        .build();
                }
                
                System.out.println("User not found: " + username);
                throw new UsernameNotFoundException("User not found: " + username);
                
            } catch (Exception e) {
                System.err.println("Error in UserDetailsService: " + e.getMessage());
                e.printStackTrace();
                throw new UsernameNotFoundException("Error loading user: " + username, e);
            }
        };
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("http:
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(authz -> authz
                
                .requestMatchers("/api/auth/login").permitAll()
                .requestMatchers("/api/auth/register").permitAll()
                .requestMatchers("/api/auth/logout").permitAll()
                .requestMatchers("/api/email/send-verification").permitAll()
                .requestMatchers("/api/email/verify-code").permitAll()
                .requestMatchers("/api/auth/request-password-reset").permitAll()
                .requestMatchers("/api/auth/verify-reset-code").permitAll()
                .requestMatchers("/api/auth/reset-password").permitAll()
                .requestMatchers("/api/auth/send-verification").permitAll()
                .requestMatchers("/api/auth/verify-email").permitAll()
                .requestMatchers("/api/vehicles/available").permitAll()
                .requestMatchers("/api/vehicles/locations").permitAll()
                .requestMatchers("/api/vehicles/types").permitAll()
                
                
                .requestMatchers("/api/admin/login").permitAll()
                .requestMatchers("/api/admin/register").permitAll()
                .requestMatchers("/api/admin/is-first-admin").permitAll()
                .requestMatchers("/api/admin/add-admin").permitAll() 
                
                
                .requestMatchers("/api/admin/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                .requestMatchers("/api/auth/admin/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                .requestMatchers("/api/auth/users/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                .requestMatchers("/api/auth/pending-requests").hasAnyRole("ADMIN", "SUPER_ADMIN")
                .requestMatchers("/api/auth/approve-user/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                .requestMatchers("/api/auth/reject-user/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                
                
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                .maximumSessions(1)
                .maxSessionsPreventsLogin(false)
            );

        return http.build();
    }
}