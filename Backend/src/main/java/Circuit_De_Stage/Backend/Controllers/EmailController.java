package Circuit_De_Stage.Backend.Controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import Circuit_De_Stage.Backend.Services.EmailService;

@RestController
@RequestMapping("/email")
public class EmailController {
    @Autowired
    private EmailService emailService;

    @GetMapping("/send")
    public String sendTestEmail() {
        emailService.sendEmail("recipient@example.com", "Test Subject", "This is a test email.");
        return "Email sent successfully!";
    }
}
