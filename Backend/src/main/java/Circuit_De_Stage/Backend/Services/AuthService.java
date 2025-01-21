package Circuit_De_Stage.Backend.Services;

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

@Service
public class AuthService {

    @Autowired
    private UserRepository utilisateurRepository;

    @Autowired
    private StagiaireRepository stagiaireRepository;

    @Autowired
    private JwtUtil jwtTokenUtil;

    @Autowired
    private EmailService emailService;  

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;  

    public String login(String email, String password) {
        // Check if the email belongs to a User or Stagiaire
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

        // If neither found, throw exception
        throw new IllegalArgumentException("Invalid email or password");
    }

    public void recoverPassword(String email) throws MessagingException {
        // Check if the email belongs to a User or Stagiaire
        User utilisateur = utilisateurRepository.findByEmail(email);
        if (utilisateur != null) {
            sendPasswordRecoveryEmail(utilisateur.getEmail(), utilisateur.getPasse());
            return;
        }

        Stagiaire stagiaire = stagiaireRepository.findByEmail(email);
        if (stagiaire != null) {
            sendPasswordRecoveryEmail(stagiaire.getEmail(), stagiaire.getPasse());
            return;
        }

        throw new IllegalArgumentException("Email not found");
    }

    private void sendPasswordRecoveryEmail(String email, String password) throws MessagingException {
        String subject = "Password Recovery";
        String message = "Your Password Is: " + password;
        emailService.sendEmail(email, subject, message);
    }

    public void registerStagiaire(Demande demande) {
        Stagiaire stagiaire = demande.getStagiaire();
        
        String email = stagiaire.getNom() + stagiaire.getPrenom() + "@tunisair.com.tn";
        String password = generateRandomPassword();

        stagiaire.setEmail(email);
        stagiaire.setPasse(password);
        
        stagiaireRepository.save(stagiaire);
        
        String subject = "Confirmation de votre stage - Accès à la plateforme Tunisair";
        String message = "Madame/Monsieur " + stagiaire.getNom() + " " + stagiaire.getPrenom() + ",\n\n" 
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

        emailService.sendEmail(email, subject, message);
    }
    	
    private String generateRandomPassword() {
        // Generate a random password consisting of 6 alphanumeric characters
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder password = new StringBuilder(6);
        for (int i = 0; i < 6; i++) {
            int randomIndex = (int) (Math.random() * chars.length());
            password.append(chars.charAt(randomIndex));
        }
        return "@Tunisair" + password.toString();
    }
}
