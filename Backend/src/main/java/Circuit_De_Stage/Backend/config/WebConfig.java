package Circuit_De_Stage.Backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.lang.NonNull;

@Configuration // Marks this class as a Spring configuration class
public class WebConfig implements WebMvcConfigurer {

    /**
     * Configures an ObjectMapper bean for JSON serialization/deserialization.
     * This ensures proper handling of Java 8 date/time types and disables timestamp formatting.
     */
    @Bean
    ObjectMapper objectMapper() {
        ObjectMapper objectMapper = new ObjectMapper(); // Create a new ObjectMapper instance
        objectMapper.registerModule(new JavaTimeModule()); // Register the JavaTimeModule for Java 8 date/time support
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS); // Disable writing dates as timestamps
        return objectMapper; // Return the configured ObjectMapper
    }

    /**
     * Configures CORS (Cross-Origin Resource Sharing) settings for the application.
     * This allows the frontend (e.g., Angular running on localhost:4200) to communicate with the backend.
     */
    @Bean
    WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(@NonNull CorsRegistry registry) {
                registry.addMapping("/**") // Apply CORS configuration to all endpoints
                        .allowedOrigins("http://localhost:4200") // Allow requests from the Angular frontend
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Allow these HTTP methods
                        .allowedHeaders("Authorization", "Content-Type", "Accept") // Allow these headers in requests
                        .exposedHeaders("Authorization") // Expose the "Authorization" header to the client
                        .allowCredentials(true) // Allow sending cookies or authorization headers with requests
                        .maxAge(36000L); // Cache preflight responses for 1 hour (36000 seconds)
            }
        };
    }
}