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
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
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
import java.util.List;
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
        return new UserDetailsService() {
            @Autowired
            private UserRepository userRepository;
            
            @Autowired
            private AdminRepository adminRepository;

            @Override
            public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
                System.out.println("=== LOADING USER: " + username + " ===");
                
                // First try to find regular user
                Optional<User> userOptional = userRepository.findByEmail(username);
                if (userOptional.isEmpty()) {
                    userOptional = userRepository.findByEmail(username);
                }
                
                if (userOptional.isPresent()) {
                    User user = userOptional.get();
                    System.out.println("Found regular user: " + user.getEmail());
                    return org.springframework.security.core.userdetails.User.builder()
                        .username(user.getEmail())
                        .password(user.getPassword())
                        .roles("USER")
                        .build();
                }
                
                // Then try to find admin user
                Optional<Admin> adminOptional = adminRepository.findByEmail(username);
                if (adminOptional.isEmpty()) {
                    adminOptional = adminRepository.findByUsername(username);
                }
                
                if (adminOptional.isPresent()) {
                    Admin admin = adminOptional.get();
                    System.out.println("Found admin user: " + admin.getEmail() + " with role: " + admin.getRole());
                    return org.springframework.security.core.userdetails.User.builder()
                        .username(admin.getEmail())
                        .password(admin.getPassword())
                        .roles(admin.getRole()) // This should be "ADMIN" or "SUPER_ADMIN"
                        .build();
                }
                
                System.out.println("User not found: " + username);
                throw new UsernameNotFoundException("User not found: " + username);
            }
        };
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("http://localhost:3000"));
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
                // Public endpoints - no authentication required
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
                
                // Admin public endpoints - MUST come before the secured admin endpoints
                .requestMatchers("/api/admin/login").permitAll()
                .requestMatchers("/api/admin/register").permitAll()
                .requestMatchers("/api/admin/is-first-admin").permitAll()
                .requestMatchers("/api/admin/add-admin").permitAll() // Add this if needed
                
                // Admin secured endpoints - comes AFTER the public ones
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/auth/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/auth/users/**").hasRole("ADMIN")
                .requestMatchers("/api/auth/pending-requests").hasRole("ADMIN")
                .requestMatchers("/api/auth/approve-user/**").hasRole("ADMIN")
                .requestMatchers("/api/auth/reject-user/**").hasRole("ADMIN")
                
                // All other endpoints require authentication
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