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

@Component
public class JwtUtil {
	
    @Value("${jwt.secret}")
    private String secret;

    private Key secretKey;

    @PostConstruct
    public void init() {
        byte[] keyBytes = HexFormat.of().parseHex(secret);
        this.secretKey = Keys.hmacShaKeyFor(keyBytes);    }
    
    // Generate a secure key using the HS512 algorithm
    //private final Key secretKey = Keys.secretKeyFor(SignatureAlgorithm.HS512);

public String generateToken(String utilisateur) {
    return Jwts.builder()
            .setSubject(utilisateur)
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + 86400000)) // 1 day expiration
            .signWith(secretKey)
            .compact();
}

    public String extractUsername(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    private boolean isTokenExpired(String token) {
        final Date expiration = Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getExpiration();
        return expiration.before(new Date());
    }
}
