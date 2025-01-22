package Circuit_De_Stage.Backend.config;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import Circuit_De_Stage.Backend.Security.CustomUserDetailsService;
import Circuit_De_Stage.Backend.Security.JwtFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final CustomUserDetailsService customUserDetailsService;
    private JwtFilter jwtFilter;


    public SecurityConfig(CustomUserDetailsService customUserDetailsService, JwtFilter jwtFilter) { 
    	this.customUserDetailsService = customUserDetailsService;
	}
    
    @Autowired
    public void setJwtFilter(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }
    
    @Bean
    static BCryptPasswordEncoder passwordEncoder() { 
        return new BCryptPasswordEncoder();
    }

    @Bean
    AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Autowired
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.userDetailsService(customUserDetailsService).passwordEncoder(passwordEncoder());
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/login", "/api/auth/forgot-password", "/api-docs/**","/api/demandes","/api/email/sendTest").permitAll()
                .requestMatchers("/admin/**").hasRole("SERVICE_ADMINISTRATIVE")
                .requestMatchers("/encadrant/**").hasRole("ENCADRANT")
                .requestMatchers("/DCRH/**").hasRole("DCRH")
                .requestMatchers("/CF/**").hasRole("CF")
                .requestMatchers("/stagiaire/**").hasRole("STAGIAIRE")
                .anyRequest().permitAll()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
            
        return http.build();
    }

}
