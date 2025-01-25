package Circuit_De_Stage.Backend.Controllers;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import Circuit_De_Stage.Backend.Services.EmailService;

@RestController
@RequestMapping("/api/email")
public class EmailController {

    private final EmailService emailService;

    public EmailController(EmailService emailService) {
        this.emailService = emailService;
    }

    @PostMapping("/sendTest")
    public ResponseEntity<Void> sendTestEmail(@RequestBody Map<String, String> request) {
        emailService.sendEmail("test@ggmail.com", "Test Email", "This is a test email");
        return ResponseEntity.ok().build();
    }
}