package Circuit_De_Stage.Backend.Services;

import java.security.SecureRandom;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import Circuit_De_Stage.Backend.Entities.Demande;
import Circuit_De_Stage.Backend.Entities.Stagiaire;
import Circuit_De_Stage.Backend.Entities.User;
import Circuit_De_Stage.Backend.Repositories.StagiaireRepository;
import Circuit_De_Stage.Backend.Repositories.UserRepository;
import Circuit_De_Stage.Backend.Security.JwtUtil;
import jakarta.mail.MessagingException;

@Service // Marks this class as a Spring-managed service
public class AuthService {

    @Autowired // Injects the UserRepository bean
    private UserRepository utilisateurRepository;

    @Autowired // Injects the StagiaireRepository bean
    private StagiaireRepository stagiaireRepository;

    @Autowired // Injects the JwtUtil bean
    private JwtUtil jwtTokenUtil;

    @Autowired // Injects the EmailService bean
    private EmailService emailService;

    @Autowired // Injects the BCryptPasswordEncoder bean
    private BCryptPasswordEncoder passwordEncoder;

    /**
     * Authenticates a user or stagiaire by their email and password.
     * Generates and returns a JWT token if authentication is successful.
     */
    public String login(String email, String password) {
        // Check if the email belongs to a User
        User utilisateur = utilisateurRepository.findByEmail(email);
        if (utilisateur != null && passwordEncoder.matches(password, utilisateur.getPasse())) {
            // Generate JWT token for User
            return jwtTokenUtil.generateToken(utilisateur.getEmail());
        }

        // If User not found, check Stagiaire repository
        Stagiaire stagiaire = stagiaireRepository.findByEmail(email);
        if (stagiaire != null && passwordEncoder.matches(password, stagiaire.getPasse())) {
            // Generate JWT token for Stagiaire
            return jwtTokenUtil.generateToken(stagiaire.getEmail());
        }

        // If neither User nor Stagiaire is found, throw an exception
        throw new IllegalArgumentException("Invalid email or password");
    }

    /**
     * Recovers a user's password by generating a new one and sending it via email.
     */
    public void recoverPassword(String email) throws MessagingException {
        User user = utilisateurRepository.findByEmail(email);
        String subject = "Password Recovery";
        String message = "Your New Password Is: ";

        if (user != null) {
            // Generate and set a new password for the user
            String newPass = generateAndSetNewPassword(user);
            emailService.sendEmail(user.getEmail(), subject, message + newPass);
            return;
        }

        // If User not found, check Stagiaire repository
        Stagiaire stagiaire = stagiaireRepository.findByEmail(email);
        if (stagiaire != null) {
            // Generate and set a new password for the stagiaire
            String newPass = generateAndSetNewPassword(stagiaire);
            emailService.sendEmail(stagiaire.getEmailPerso(), subject, message + newPass);
            return;
        }

        // If neither User nor Stagiaire is found, throw an exception
        throw new IllegalArgumentException("Email not found");
    }

    /**
     * Registers a new stagiaire based on the provided demande.
     * Generates unique credentials (email and password) and sends them via email.
     */
    public void registerStagiaire(Demande demande) {
        Stagiaire stagiaire = demande.getStagiaire();

        // Generate a unique email and random password for the stagiaire
        String email = generateUniqueEmail(stagiaire);
        String password = generateRandomPassword();

        // Set the generated email and hashed password
        stagiaire.setEmail(email);
        stagiaire.setPasse(passwordEncoder.encode(password));

        // Save the stagiaire to the database
        stagiaireRepository.save(stagiaire);

        // Prepare the recipient's name(s)
        String receiver = stagiaire.getNom() + " " + stagiaire.getPrenom();
        if (stagiaire.getNom2() != null) {
            receiver += " et " + stagiaire.getNom2() + " " + stagiaire.getPrenom2();
        }

        // Prepare the email subject and message
        String subject = "Confirmation de votre " + demande.getStage() + " - Accès à la plateforme Tunisair";
        String message = "Madame/Monsieur " + receiver + ",\n\n"
                + "Nous avons le plaisir de vous informer que votre candidature pour un stage au sein de Tunisair a été approuvée.\n\n"
                + "🔐 Vos coordonnées d'accès :\n"
                + "E-mail : " + email + "\n"
                + "Mot de passe : " + password + "\n\n"
                + "📌 Étapes à suivre :\n"
                + "1. Connectez-vous à : [lien_plateforme]\n"
                + "2. Consultez votre espace personnalisé\n\n"
                + "Cordialement,\nService Automatique\nTunisair"
                + "----------------------------------------\n"
                + "*Ce message est généré automatiquement - Merci de ne pas y répondre directement*";

        // Send the email to the stagiaire's personal email address
        emailService.sendEmail(stagiaire.getEmailPerso(), subject, message);

        // If a secondary email exists, send the email to it as well
        if (stagiaire.getEmailPerso2() != null) {
            emailService.sendEmail(stagiaire.getEmailPerso2(), subject, message);
        }
    }

    /**
     * Generates a unique email address for a stagiaire.
     */
    private String generateUniqueEmail(Stagiaire stagiaire) {
        // Start with the first person's full name
        String base = stagiaire.getNom().toLowerCase() + "." + stagiaire.getPrenom().toLowerCase();

        // If there's a second person, create a combined email
        if (stagiaire.getNom2() != null && stagiaire.getPrenom2() != null) {
            base = stagiaire.getNom().toLowerCase() + stagiaire.getNom2().toLowerCase();
        }

        // Remove any spaces and special characters
        base = base.replaceAll("\\s+", "")
                   .replaceAll("[^a-zA-Z0-9]", "");

        // Append the domain to create the final email
        String finalEmail = base + "@tunisair.com.tn";
        int suffix = 1;

        // Check for existing email and add a suffix if needed
        while (utilisateurRepository.existsByEmail(finalEmail) ||
               stagiaireRepository.existsByEmail(finalEmail)) {
            suffix++;
            finalEmail = base + suffix + "@tunisair.com.tn";
        }

        return finalEmail;
    }

    /**
     * Generates a random password using secure randomization.
     */
    private String generateRandomPassword() {
        SecureRandom random = new SecureRandom();
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#*";
        StringBuilder password = new StringBuilder(6);

        // Generate a 6-character random password
        for (int i = 0; i < 6; i++) {
            int randomIndex = random.nextInt(chars.length());
            password.append(chars.charAt(randomIndex));
        }

        return "@Tunisair" + password; // Prefix the password with "@Tunisair"
    }

    /**
     * Generates a new password, sets it for the user or stagiaire, and saves it to the database.
     */
    private String generateAndSetNewPassword(Object user) {
        String newPassword = generateRandomPassword(); // Generate a random password
        if (user instanceof User u) {
            u.setPasse(passwordEncoder.encode(newPassword)); // Hash and set the new password
            utilisateurRepository.save(u); // Save the updated user
        } else if (user instanceof Stagiaire s) {
            s.setPasse(passwordEncoder.encode(newPassword)); // Hash and set the new password
            stagiaireRepository.save(s); // Save the updated stagiaire
        }
        return newPassword; // Return the plain-text password
    }
}