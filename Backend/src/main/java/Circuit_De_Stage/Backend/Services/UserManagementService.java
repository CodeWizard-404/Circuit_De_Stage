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

@Service // Marks this class as a Spring-managed service
public class UserManagementService {

    @Autowired // Injects the UserRepository bean
    private UserRepository utilisateurRepository;

    @Autowired // Injects the BCryptPasswordEncoder bean for password hashing
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired // Injects the DemandeRepository bean
    private DemandeRepository demandeRepository;

    @Autowired // Injects the UserDocumentSeenRepository bean
    private UserDocumentSeenRepository userDocumentSeenRepository;

    /**
     * Creates a new user.
     * Checks if a user with the same email already exists before saving.
     */
    public void createUser(User user) {
        // Check if a user with the same email already exists
        boolean emailExists = utilisateurRepository.existsByEmail(user.getEmail());
        if (emailExists) {
            throw new RuntimeException("Email already exists");
        }

        // Encode the password and save the user
        user.setPasse(passwordEncoder.encode(user.getPasse()));
        utilisateurRepository.save(user);
    }

    /**
     * Updates an existing user's details.
     * Only updates the password if a new one is provided.
     */
    public void updateUser(User user) {
        // Retrieve the existing user from the database
        User existingUser = utilisateurRepository.findById(user.getId())
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Update the password only if it is provided
        if (user.getPasse() != null && !user.getPasse().isEmpty()) {
            existingUser.setPasse(passwordEncoder.encode(user.getPasse()));
        }

        // Update other fields
        existingUser.setNom(user.getNom());
        existingUser.setPrenom(user.getPrenom());
        existingUser.setEmail(user.getEmail());
        existingUser.setType(user.getType());

        // Save the updated user to the database
        utilisateurRepository.save(existingUser);
    }

    /**
     * Deletes a user by their ID.
     * Handles associated demandes and document statuses before deletion.
     */
    @Transactional // Ensures all operations are executed within a single transaction
    public void deleteUser(int userId) {
        // Retrieve the user to be deleted
        User user = utilisateurRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Handle associated demandes by removing the user as an encadrant
        List<Demande> demandes = demandeRepository.findByEncadrant(user);
        demandes.forEach(demande -> {
            demande.setEncadrant(null); // Remove the user as the encadrant
            demandeRepository.save(demande); // Save the updated demande
        });

        // Delete all records of documents seen by the user
        userDocumentSeenRepository.deleteByUtilisateur(user);

        // Clear caches and perform the final deletion
        utilisateurRepository.flush(); // Flush any pending changes to the database
        user = utilisateurRepository.findById(userId).orElseThrow(); // Reload the user
        utilisateurRepository.delete(user); // Delete the user
    }

    /**
     * Retrieves a list of all users.
     */
    public List<User> listAllUsers() {
        return utilisateurRepository.findAll();
    }

    /**
     * Retrieves detailed information about a specific user by their ID.
     */
    public User userInfo(int userId) {
        return utilisateurRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User with ID " + userId + " not found."));
    }
}