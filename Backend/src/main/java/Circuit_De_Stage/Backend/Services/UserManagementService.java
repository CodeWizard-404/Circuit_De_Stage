package Circuit_De_Stage.Backend.Services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import Circuit_De_Stage.Backend.Entities.Demande;
import Circuit_De_Stage.Backend.Entities.User;
import Circuit_De_Stage.Backend.Repositories.DemandeRepository;
import Circuit_De_Stage.Backend.Repositories.UserDocumentSeenRepository;
import Circuit_De_Stage.Backend.Repositories.UserRepository;
import jakarta.transaction.Transactional;

@Service
public class UserManagementService {

    @Autowired
    private UserRepository utilisateurRepository;
    
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;  

    @Autowired 
    private DemandeRepository demandeRepository;

    @Autowired 
    private UserDocumentSeenRepository userDocumentSeenRepository;

    
    
    public void createUser(User user) {
        user.setPasse(passwordEncoder.encode(user.getPasse()));
        utilisateurRepository.save(user);
    }

    public void updateUser(User user) {
        User existingUser = utilisateurRepository.findById(user.getId())
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Only update password if provided
        if (user.getPasse() != null && !user.getPasse().isEmpty()) {
            existingUser.setPasse(passwordEncoder.encode(user.getPasse()));
        }
        
        // Update other fields
        existingUser.setNom(user.getNom());
        existingUser.setPrenom(user.getPrenom());
        existingUser.setEmail(user.getEmail());
        existingUser.setType(user.getType());
        
        utilisateurRepository.save(existingUser);
    }

    @Transactional
    public void deleteUser(int userId) {
        User user = utilisateurRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Handle demandes
        List<Demande> demandes = demandeRepository.findByEncadrant(user);
        demandes.forEach(demande -> {
            demande.setEncadrant(null);
            demandeRepository.save(demande);
        });

        // Handle document statuses
        userDocumentSeenRepository.deleteByUtilisateur(user);

        // Clear caches
        utilisateurRepository.flush();
        user = utilisateurRepository.findById(userId).orElseThrow();

        // Final delete
        utilisateurRepository.delete(user);
    }
    
    public List<User> listAllUsers() {
        return utilisateurRepository.findAll();
    }

    public User userInfo(int userId) {
        return utilisateurRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User with ID " + userId + " not found."));
    }
}
