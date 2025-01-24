package Circuit_De_Stage.Backend.Controllers;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import Circuit_De_Stage.Backend.Services.AuthService;
import jakarta.mail.MessagingException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

 @Autowired
 private AuthService authService;

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
}