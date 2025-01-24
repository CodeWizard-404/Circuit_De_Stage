package Circuit_De_Stage.Backend.Services;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import Circuit_De_Stage.Backend.Entities.Demande;
import Circuit_De_Stage.Backend.Entities.Document;
import Circuit_De_Stage.Backend.Entities.Stagiaire;
import Circuit_De_Stage.Backend.Entities.User;
import Circuit_De_Stage.Backend.Entities.Enum.DemandeStatus;
import Circuit_De_Stage.Backend.Entities.Enum.DocumentType;
import Circuit_De_Stage.Backend.Repositories.DemandeRepository;
import Circuit_De_Stage.Backend.Repositories.StagiaireRepository;
import Circuit_De_Stage.Backend.Repositories.UserRepository;
import io.jsonwebtoken.io.IOException;

@Service
public class ForumService {

    @Autowired
    private DemandeRepository demandeRepository;

    @Autowired
    private AuthService authService;
    
    @Autowired   
    private EmailService emailService;
    
    @Autowired
    private DocumentService documentService;
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StagiaireRepository stagiaireRepository;

    
    @Transactional
    public void submit(Demande demande ,Map<DocumentType, MultipartFile> documents) throws IOException, Throwable  {
        Stagiaire incomingStagiaire = demande.getStagiaire();
        String emailPerso = incomingStagiaire.getEmailPerso();

        // Check for existing stagiaire with same personal email
        Stagiaire existingStagiaire = stagiaireRepository.findByEmailPerso(emailPerso);
        
        if (existingStagiaire != null) {
            // Check if existing demande has same stage type
            if (existingStagiaire.getDemandes() != null 
            	    && ((Demande) existingStagiaire.getDemandes()).getStage() == demande.getStage()) {
            	    throw new RuntimeException("A request for this stage type already exists");
            	}
            
            // Use existing stagiaire for new demande
            demande.setStagiaire(existingStagiaire);
        } else {
            // Create new stagiaire without credentials
            Stagiaire newStagiaire = new Stagiaire();
            newStagiaire.setNom(incomingStagiaire.getNom());
            newStagiaire.setPrenom(incomingStagiaire.getPrenom());
            newStagiaire.setEmailPerso(emailPerso);
            newStagiaire.setCin(incomingStagiaire.getCin());
            newStagiaire.setTel(incomingStagiaire.getTel());
            newStagiaire.setInstitut(incomingStagiaire.getInstitut());
            newStagiaire.setNiveau(incomingStagiaire.getNiveau());
            newStagiaire.setAnnee(incomingStagiaire.getAnnee());
            newStagiaire.setSpecialite(incomingStagiaire.getSpecialite());
            
            Stagiaire savedStagiaire = stagiaireRepository.save(newStagiaire);
            demande.setStagiaire(savedStagiaire);
        }
        

        demande.setStatus(DemandeStatus.SOUMISE);
        // Save demande first
        Demande savedDemande = demandeRepository.save(demande);

        // Upload documents and add to Demande's collection
        Set<Document> savedDocuments = new HashSet<>();
        for (Map.Entry<DocumentType, MultipartFile> entry : documents.entrySet()) {
            Document doc = documentService.uploadDocument(savedDemande.getId(), entry.getValue(), entry.getKey());
            savedDemande.getDocuments().add(doc); // Add to existing collection
            savedDocuments.add(doc);
        }
        
        // Update Demande's documents collection
        savedDemande.getDocuments().addAll(savedDocuments);
        demandeRepository.save(savedDemande); 

        // Now validate
        validateRequiredDocuments(savedDemande); // No need to re-fetch
    }
      
    private void validateRequiredDocuments(Demande demande) throws Exception {
        Set<DocumentType> required = switch(demande.getStage()) {
            case PFE,PFA -> Set.of(DocumentType.CV, DocumentType.LETTRE_DE_MOTIVATION, DocumentType.DEMANDE_DE_STAGE);
            case STAGE_PERFECTIONNEMENT,STAGE_INITIATION -> Set.of(DocumentType.CV, DocumentType.DEMANDE_DE_STAGE);
            default -> throw new IllegalStateException("Unexpected stage type: " + demande.getStage());
        };

        Set<DocumentType> submitted = demande.getDocuments()
                                          .stream()
                                          .map(Document::getType)
                                          .collect(Collectors.toSet());

        if(!submitted.containsAll(required)) {
            Set<DocumentType> missing = new HashSet<>(required);
            missing.removeAll(submitted);
            throw new Exception("Missing required documents for " + demande.getStage() + ": " + missing);
        }
    }
    
    public void validateDemande(int demandeId, int encadrantId) {
        Demande demande = demandeRepository.findById(demandeId)
            .orElseThrow(() -> new RuntimeException("Demande not found"));
        
        User encadrant = userRepository.findById(encadrantId)
                .orElseThrow(() -> new RuntimeException("Encadrant not found"));

        demande.setStatus(DemandeStatus.VALIDE);
        demande.setEncadrant(encadrant); 
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
