package Circuit_De_Stage.Backend.Services;

import java.util.HashSet;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import Circuit_De_Stage.Backend.Entities.Demande;
import Circuit_De_Stage.Backend.Entities.Document;
import Circuit_De_Stage.Backend.Entities.Stagiaire;
import Circuit_De_Stage.Backend.Entities.Enum.DemandeStatus;
import Circuit_De_Stage.Backend.Entities.Enum.DocumentType;
import Circuit_De_Stage.Backend.Repositories.DemandeRepository;
import Circuit_De_Stage.Backend.Repositories.StagiaireRepository;

@Service
public class ForumService {

    @Autowired
    private DemandeRepository demandeRepository;

    @Autowired
    private AuthService authService;
    
    @Autowired   
    private EmailService emailService;

    @Autowired
    private StagiaireRepository stagiaireRepository;

    public void submit(Demande demande) {
        // Ensure the associated stagiaire exists
        Stagiaire stagiaire = demande.getStagiaire();
        if (stagiaire != null && stagiaireRepository.existsById(stagiaire.getId())) {
            demande.setStatus(DemandeStatus.SOUMISE);
            demandeRepository.save(demande);
        } else {
            throw new RuntimeException("Invalid stagiaire");
        }
    }

    public void validateDemande(int demandeId) {
        Demande demande = demandeRepository.findById(demandeId)
            .orElseThrow(() -> new RuntimeException("Demande not found"));

        demande.setStatus(DemandeStatus.VALIDE);
        demandeRepository.save(demande);

        authService.registerStagiaire(demande);

    }
    
    public void rejectDemande(int demandeId, String rejectionReason) {
        Demande demande = demandeRepository.findById(demandeId)
                .orElseThrow(() -> new RuntimeException("Demande not found"));

        demande.setStatus(DemandeStatus.REJETEE); 
        demandeRepository.save(demande);

        Stagiaire stagiaire = demande.getStagiaire();
        String subject = "Statut de votre candidature de stage - Tunisair";
        String body = "Madame/Monsieur " + stagiaire.getNom() + " " + stagiaire.getPrenom() + ",\n\n"
            + "Nous vous remercions pour l'intérêt que vous avez porté à Tunisair et pour le temps consacré à votre candidature.\n\n"
            + "Nous regrettons de vous informer que votre demande de stage n'a pas pu être retenue.\n\n"
            + "🔍 Motif de refus :\n" 
            + rejectionReason + "\n\n"
            + "Cordialement,\nService Automatique\nTunisair"
            + "----------------------------------------\n"
            + "*Ce message est généré automatiquement - Merci de ne pas y répondre directement*";
      
        emailService.sendEmail(stagiaire.getEmail(), subject, body);
    }
    
    // Method to get all unique document types for a specific demande
    public Set<DocumentType> getDocumentTypes(int demandeId) {
        // Retrieve the demande from the repository
        Demande demande = demandeRepository.findById(demandeId)
            .orElseThrow(() -> new RuntimeException("Demande not found"));

        // Create a set to hold unique document types
        Set<DocumentType> documentTypes = new HashSet<>();

        // Iterate over the documents associated with the demande
        for (Document document : demande.getDocuments()) {
            documentTypes.add(document.getType()); 
        }

        return documentTypes; 
    }

}
