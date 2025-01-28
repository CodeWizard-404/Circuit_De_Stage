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

@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class AuthController {
 @Autowired
 private AuthService authService;

 @Autowired
 private JwtUtil jwtUtil;

 @Autowired
 private UserRepository utilisateurRepository;

 @Autowired
 private StagiaireRepository stagiaireRepository;

 @PostMapping("/login")
 public ResponseEntity<String> login(@RequestBody Map<String, String> credentials) {
     String email = credentials.get("email");
     String password = credentials.get("password");
     String token = authService.login(email, password);
     return ResponseEntity.ok(token);
 }

 @PostMapping("/forgot-password")
 public ResponseEntity<Void> forgotPassword(@RequestBody Map<String, String> request) throws MessagingException {
     String email = request.get("email");
     authService.recoverPassword(email);
     return ResponseEntity.ok().build();
 }

 @GetMapping("/me")
 public ResponseEntity<Object> getCurrentUser(@RequestHeader("Authorization") String token) {
     String email = jwtUtil.extractUsername(token.substring(7)); 
     User user = utilisateurRepository.findByEmail(email);
     if (user != null) {
         return ResponseEntity.ok(user);
     }
     Stagiaire stagiaire = stagiaireRepository.findByEmail(email);
     if (stagiaire != null) {
         return ResponseEntity.ok(stagiaire);
     }
     return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
 }
}