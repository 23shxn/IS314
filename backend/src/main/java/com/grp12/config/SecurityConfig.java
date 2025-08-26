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
        return email -> {
            try {
                Optional<Admin> adminOpt = adminRepository.findByEmailOrUsername(email, email);
                if (adminOpt.isPresent()) {
                    Admin admin = adminOpt.get();
                    if ("ACTIVE".equals(admin.getStatus())) {
                        return org.springframework.security.core.userdetails.User.builder()
                                .username(admin.getEmail())
                                .password(admin.getPassword())
                                .authorities(List.of(new SimpleGrantedAuthority("ROLE_ADMIN")))
                                .build();
                    }
                }
            } catch (Exception e) {
                System.err.println("Error loading admin: " + e.getMessage());
            }
            
            try {
                Optional<User> userOpt = userRepository.findByEmail(email);
                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    if ("APPROVED".equals(user.getStatus())) {
                        return org.springframework.security.core.userdetails.User.builder()
                                .username(user.getEmail())
                                .password(user.getPassword())
                                .authorities(List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER")))
                                .build();
                    }
                }
            } catch (Exception e) {
                System.err.println("Error loading user: " + e.getMessage());
            }
            
            throw new UsernameNotFoundException("User not found: " + email);
        };
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/register", "/api/auth/login").permitAll()
                .requestMatchers("/api/admin/register", "/api/admin/login", "/api/admin/is-first-admin").permitAll()
                .requestMatchers("/h2-console/**").permitAll()
                .requestMatchers("/api/vehicles/available", "/api/vehicles/search", 
                               "/api/vehicles/locations", "/api/vehicles/types").permitAll()
                .requestMatchers("/api/vehicles/all", "/api/vehicles/add", "/api/vehicles/*/status",
                               "/api/vehicles/stats", "/api/vehicles/*").permitAll()
                .requestMatchers("/api/auth/requests/pending", "/api/auth/approve/**", "/api/auth/reject/**").hasRole("ADMIN")
                .requestMatchers("/api/auth/users/customers").hasRole("ADMIN")
                .requestMatchers("/api/admin/all", "/api/admin/*/deactivate", "/api/admin/*/activate").hasRole("ADMIN")
                .requestMatchers("/api/admin/*").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setContentType("application/json");
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.getWriter().write("{\"error\": \"Unauthorized: Please log in as admin\"}");
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.setContentType("application/json");
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.getWriter().write("{\"error\": \"Forbidden: Admin access required\"}");
                })
            )
            .formLogin(form -> form.disable())
            .httpBasic(httpBasic -> httpBasic.disable())
            .headers(headers -> headers.frameOptions().disable());
        return http.build();
    }
}