package Circuit_De_Stage.Backend.Security;

import java.security.Key;
import java.util.Date;
import java.util.HexFormat;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;

@Component // Marks this class as a Spring-managed component
public class JwtUtil {

    @Value("${jwt.secret}") // Injects the secret key from the application properties file
    private String secret; // Secret key used for signing JWT tokens
    private Key secretKey; // Cryptographic key derived from the secret

    /**
     * Initializes the secret key after the bean is constructed.
     * Converts the hexadecimal secret into a cryptographic key using HMAC-SHA.
     */
    @PostConstruct
    public void init() {
        byte[] keyBytes = HexFormat.of().parseHex(secret); // Parse the secret from hexadecimal format
        this.secretKey = Keys.hmacShaKeyFor(keyBytes); // Generate a secure HMAC-SHA key
    }

    /**
     * Generates a JWT token for a given user.
     * The token includes the user's identifier, issue time, and expiration time.
     */
    public String generateToken(String utilisateur) {
        return Jwts.builder()
                .setSubject(utilisateur) // Set the subject (user identifier) of the token
                .setIssuedAt(new Date()) // Set the issue time to the current date and time
                .setExpiration(new Date(System.currentTimeMillis() + 86400000)) // Set expiration to 1 day (86400000 ms)
                .signWith(secretKey) // Sign the token with the secret key
                .compact(); // Compact the token into a URL-safe string
    }

    /**
     * Extracts the username (subject) from a JWT token.
     */
    public String extractUsername(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(secretKey) // Use the secret key to verify the token's signature
                .build()
                .parseClaimsJws(token) // Parse the token to extract claims
                .getBody() // Get the payload (claims) of the token
                .getSubject(); // Extract the subject (username) from the claims
    }

    /**
     * Validates a JWT token by checking its expiration and matching the username.
     */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token); // Extract the username from the token
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token)); // Check if the username matches and the token is not expired
    }

    /**
     * Checks if a JWT token has expired.
     */
    private boolean isTokenExpired(String token) {
        final Date expiration = Jwts.parserBuilder()
                .setSigningKey(secretKey) // Use the secret key to verify the token's signature
                .build()
                .parseClaimsJws(token) // Parse the token to extract claims
                .getBody() // Get the payload (claims) of the token
                .getExpiration(); // Extract the expiration date from the claims
        return expiration.before(new Date()); // Check if the expiration date is before the current date
    }
}