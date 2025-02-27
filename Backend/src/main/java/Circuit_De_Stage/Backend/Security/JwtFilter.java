package Circuit_De_Stage.Backend.Security;

import java.io.IOException;

import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component // Marks this class as a Spring-managed component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil; // Utility class for handling JWT operations
    private final CustomUserDetailsService customUserDetailsService; // Service for loading user details

    /**
     * Determines whether the filter should be skipped for specific requests.
     * Skips filtering for login and forgot-password endpoints.
     */
    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
        String path = request.getServletPath(); // Get the request path
        return path.startsWith("/api/auth/login") || 
               path.startsWith("/api/auth/forgot-password"); // Skip filtering for these paths
    }

    // Constructor-based dependency injection
    public JwtFilter(JwtUtil jwtUtil, CustomUserDetailsService customUserDetailsService) {
        this.jwtUtil = jwtUtil;
        this.customUserDetailsService = customUserDetailsService;
    }

    /**
     * Filters incoming HTTP requests to validate JWT tokens and set authentication context.
     */
    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request, 
            @NonNull HttpServletResponse response, 
            @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        
        final String authorizationHeader = request.getHeader("Authorization"); // Extract the "Authorization" header
        String email = null; // To store the email extracted from the JWT token
        String jwtToken = null; // To store the JWT token

        // Check if the "Authorization" header exists and starts with "Bearer "
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwtToken = authorizationHeader.substring(7); // Extract the JWT token (remove "Bearer ")
            try {
                email = jwtUtil.extractUsername(jwtToken); // Extract the email from the JWT token
            } catch (ExpiredJwtException e) {
                // Handle expired JWT tokens
                logger.error("JWT token is expired: " + e.getMessage());
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // Return 401 Unauthorized
                response.getWriter().write("JWT token is expired.");
                return;
            } catch (MalformedJwtException e) {
                // Handle malformed JWT tokens
                logger.error("JWT token is malformed: " + e.getMessage());
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST); // Return 400 Bad Request
                response.getWriter().write("Malformed JWT token.");
                return;
            } catch (Exception e) {
                // Handle other JWT-related errors
                logger.error("JWT token error: " + e.getMessage());
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // Return 401 Unauthorized
                response.getWriter().write("Error processing JWT token.");
                return;
            }
        }

        // If an email is extracted and no authentication exists in the security context
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = customUserDetailsService.loadUserByUsername(email); // Load user details by email
            if (jwtUtil.isTokenValid(jwtToken, userDetails)) { // Validate the JWT token
                // Create an authentication token and set it in the security context
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // Continue the filter chain
        filterChain.doFilter(request, response);
    }
}