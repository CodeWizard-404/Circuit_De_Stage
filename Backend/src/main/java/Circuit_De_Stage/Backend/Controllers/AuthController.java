package Circuit_De_Stage.Backend.Controllers;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import Circuit_De_Stage.Backend.Entities.Stagiaire;
import Circuit_De_Stage.Backend.Entities.User;
import Circuit_De_Stage.Backend.Repositories.StagiaireRepository;
import Circuit_De_Stage.Backend.Repositories.UserRepository;
import Circuit_De_Stage.Backend.Security.JwtUtil;
import Circuit_De_Stage.Backend.Services.AuthService;
import jakarta.mail.MessagingException;

@RestController // Marks this class as a REST controller
@RequestMapping("/api/auth") // Base URL path for all endpoints in this controller
@CrossOrigin // Enables CORS for all endpoints in this controller
public class AuthController {

    @Autowired // Injects the AuthService bean
    private AuthService authService;

    @Autowired // Injects the JwtUtil bean
    private JwtUtil jwtUtil;

    @Autowired // Injects the UserRepository bean
    private UserRepository utilisateurRepository;

    @Autowired // Injects the StagiaireRepository bean
    private StagiaireRepository stagiaireRepository;

    /**
     * Handles user login.
     * Accepts email and password, validates credentials, and returns a JWT token.
     */
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email"); // Extract email from request body
        String password = credentials.get("password"); // Extract password from request body
        String token = authService.login(email, password); // Authenticate and generate JWT token
        return ResponseEntity.ok(token); // Return the token in the response
    }

    /**
     * Handles password recovery.
     * Sends a password reset link to the provided email address.
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@RequestBody Map<String, String> request) throws MessagingException {
        String email = request.get("email"); // Extract email from request body
        authService.recoverPassword(email); // Trigger password recovery process
        return ResponseEntity.ok().build(); // Return a 200 OK response
    }

    /**
     * Retrieves the current authenticated user's details.
     * Uses the JWT token from the "Authorization" header to identify the user.
     */
    @GetMapping("/me")
    public ResponseEntity<Object> getCurrentUser(@RequestHeader("Authorization") String token) {
        String email = jwtUtil.extractUsername(token.substring(7)); // Extract email from the JWT token
        User user = utilisateurRepository.findByEmail(email); // Check if the user exists in the "User" table
        if (user != null) {
            return ResponseEntity.ok(user); // Return the user details if found
        }
        Stagiaire stagiaire = stagiaireRepository.findByEmail(email); // Check if the user exists in the "Stagiaire" table
        if (stagiaire != null) {
            return ResponseEntity.ok(stagiaire); // Return the stagiaire details if found
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found"); // Return 404 if no user is found
    }
}