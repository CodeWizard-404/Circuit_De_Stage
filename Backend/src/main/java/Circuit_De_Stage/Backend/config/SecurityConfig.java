package Circuit_De_Stage.Backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;


import Circuit_De_Stage.Backend.Security.JwtFilter;

@Configuration // Marks this class as a Spring configuration class
@EnableWebSecurity // Enables Spring Security's web security support
public class SecurityConfig {

    private JwtFilter jwtFilter; // Custom JWT filter to handle token-based authentication

    // Inject JwtFilter using setter injection to avoid circular dependency issues
    @Autowired
    public void setJwtFilter(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    // Static PasswordEncoder bean to avoid circular dependency
    @Bean
    static BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(); // Provides a BCrypt password encoder for hashing passwords
    }

    // Define the security filter chain
    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configure(http)) // Enable CORS (Cross-Origin Resource Sharing)
            .csrf(csrf -> csrf.disable()) // Disable CSRF protection (useful for APIs)
            .authorizeHttpRequests(auth -> auth
                // Public endpoints that do not require authentication
                .requestMatchers("/api/auth/login", "/api/auth/forgot-password", "/api/demande", "/api/email/sendTest").permitAll()
                // Endpoints that require authentication
                .requestMatchers("/api/auth/me").authenticated()
                // All other requests must be authenticated
                .anyRequest().authenticated()
            )
            // Add the custom JWT filter before the UsernamePasswordAuthenticationFilter
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build(); // Build and return the configured security filter chain
    }
}