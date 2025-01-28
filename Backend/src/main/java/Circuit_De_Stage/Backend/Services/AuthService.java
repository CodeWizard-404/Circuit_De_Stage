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
        User user = utilisateurRepository.findByEmail(email);
        String subject = "Password Recovery";
        String message = "Your New Password Is: ";
        if (user != null) {
            String newPass = generateAndSetNewPassword(user);
            emailService.sendEmail(user.getEmail(), subject,message + newPass);
            return;
        }

        Stagiaire stagiaire = stagiaireRepository.findByEmail(email);
        if (stagiaire != null) {
            String newPass = generateAndSetNewPassword(stagiaire);
            emailService.sendEmail(stagiaire.getEmailPerso(), subject,message + newPass);
            return;
        }

        throw new IllegalArgumentException("Email not found");
    }

    public void registerStagiaire(Demande demande) {
        Stagiaire stagiaire = demande.getStagiaire();
        
        String email = generateUniqueEmail(stagiaire);
        String password = generateRandomPassword();
        
        stagiaire.setEmail(email);
        stagiaire.setPasse(passwordEncoder.encode(password));
        
        stagiaireRepository.save(stagiaire);
        
        
        String reciver = stagiaire.getNom() + " " + stagiaire.getPrenom();
        
    	if (stagiaire.getNom2() != null) {
    		reciver = reciver +" et " + stagiaire.getNom2() + " " + stagiaire.getPrenom2();
    	}

        String subject = "Confirmation de votre "+ demande.getStage() +" - Accès à la plateforme Tunisair";
        String message = "Madame/Monsieur " + reciver + ",\n\n" 
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

        emailService.sendEmail(stagiaire.getEmailPerso(), subject, message);
        if (stagiaire.getEmailPerso2() != null ) {
            emailService.sendEmail(stagiaire.getEmailPerso2(), subject, message);
        }
    }
    	
    private String generateUniqueEmail(Stagiaire stagiaire) {
    	
    	String base = stagiaire.getNom() + stagiaire.getPrenom();
    	
    	if (stagiaire.getNom2() != null) {
    		base = stagiaire.getNom() + stagiaire.getNom2();
    	}
    	
        String finalEmail = base + "@tunisair.com.tn";
        int suffix = 1;
        
        while (stagiaireRepository.existsByEmail(finalEmail)) {
            suffix++;
            finalEmail = base + suffix + "@tunisair.com.tn";
        }
        return finalEmail;
    }

    private String generateRandomPassword() {
        SecureRandom random = new SecureRandom();
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#*";
        StringBuilder password = new StringBuilder(6);
        
        for (int i = 0; i < 6; i++) {
            int randomIndex = random.nextInt(chars.length());
            password.append(chars.charAt(randomIndex));
        }
        return "@Tunisair" + password;
    }
    
    private String generateAndSetNewPassword(Object user) {
        String newPassword = generateRandomPassword(); 
        if (user instanceof User u) {
            u.setPasse(passwordEncoder.encode(newPassword));
            utilisateurRepository.save(u);
        } else if (user instanceof Stagiaire s) {
            s.setPasse(passwordEncoder.encode(newPassword));
            stagiaireRepository.save(s);
        }
        return newPassword;
    }
    
    
}
