package Circuit_De_Stage.Backend.Controllers;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import Circuit_De_Stage.Backend.Services.EmailService;

@RestController // Marks this class as a REST controller
@RequestMapping("/api/email") // Base URL path for all endpoints in this controller
@CrossOrigin // Enables CORS for all endpoints in this controller
public class EmailController {

    private final EmailService emailService; // Service for sending emails

    // Constructor-based dependency injection
    public EmailController(EmailService emailService) {
        this.emailService = emailService;
    }

    /**
     * Sends a test email.
     * Accepts a JSON payload with email details (not used in this example).
     */
    @PostMapping("/sendTest")
    public ResponseEntity<Void> sendTestEmail(@RequestBody Map<String, String> request) {
        // Call the email service to send a test email
        emailService.sendEmail("test@ggmail.com", "Test Email", "This is a test email");
        return ResponseEntity.ok().build(); // Return a 200 OK response
    }
}