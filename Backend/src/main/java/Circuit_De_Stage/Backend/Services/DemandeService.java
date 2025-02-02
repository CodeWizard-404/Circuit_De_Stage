package Circuit_De_Stage.Backend.Services;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import Circuit_De_Stage.Backend.Entities.Demande;
import Circuit_De_Stage.Backend.Entities.Document;
import Circuit_De_Stage.Backend.Entities.Stagiaire;
import Circuit_De_Stage.Backend.Entities.User;
import Circuit_De_Stage.Backend.Entities.Enum.DemandeStatus;
import Circuit_De_Stage.Backend.Entities.Enum.DocumentType;
import Circuit_De_Stage.Backend.Entities.Enum.RoleType;
import Circuit_De_Stage.Backend.Repositories.DemandeRepository;
import Circuit_De_Stage.Backend.Repositories.StagiaireRepository;
import Circuit_De_Stage.Backend.Repositories.UserRepository;
import io.jsonwebtoken.io.IOException;

@Service
public class DemandeService {

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

    @Autowired
    private TaskScheduler taskScheduler;

    @Autowired
    private StagiaireService stagiaireService;

    
    @Transactional
    public void submit(Demande demande, Map<DocumentType, MultipartFile> documents) throws IOException, Throwable {
        // Initial validation
        if (documents == null || documents.isEmpty()) {
            throw new RuntimeException("No documents were provided with the submission");
        }

        // Validate all files before processing
        for (Map.Entry<DocumentType, MultipartFile> entry : documents.entrySet()) {
            if (entry.getValue() == null || entry.getValue().isEmpty()) {
                throw new RuntimeException("Empty or invalid file provided for document type: " + entry.getKey());
            }
        }

        // Pre-validate required documents based on stage type and stagiaire info
        Set<DocumentType> providedTypes = documents.keySet();
        Stagiaire incomingStagiaire = demande.getStagiaire();
        
        // Get required documents based on stage type
        Set<DocumentType> required = switch(demande.getStage()) {
            case PFE, PFA -> Set.of(
                DocumentType.CV, 
                DocumentType.LETTRE_DE_MOTIVATION, 
                DocumentType.DEMANDE_DE_STAGE
            );
            case STAGE_PERFECTIONNEMENT, STAGE_INITIATION -> Set.of(
                DocumentType.CV, 
                DocumentType.DEMANDE_DE_STAGE
            );
            default -> throw new IllegalStateException("Unexpected stage type: " + demande.getStage());
        };

        // Add CV2 requirement if there's a second intern (check for both non-null and non-empty)
        if (incomingStagiaire.getNom2() != null && !incomingStagiaire.getNom2().trim().isEmpty()) {
            Set<DocumentType> withCV2 = new HashSet<>(required);
            withCV2.add(DocumentType.CV2);
            required = withCV2;
        }

        // Validate all required documents are provided
        if (!providedTypes.containsAll(required)) {
            Set<DocumentType> missing = new HashSet<>(required);
            missing.removeAll(providedTypes);
            throw new Exception("Missing required documents: " + missing);
        }

        // Check for existing stagiaire and stage request
        Long CIN = incomingStagiaire.getCin();
        Stagiaire existingStagiaire = stagiaireRepository.findByCINWithDemandes(CIN);
        if (existingStagiaire != null && demandeRepository.existsByStagiaireAndStage(existingStagiaire, demande.getStage())) {
            throw new RuntimeException("A request for this stage type already exists");
        }

        // After all validations pass, proceed with saving
        if (existingStagiaire != null) {
            if(incomingStagiaire.getEmailPerso2() != null) {
                existingStagiaire.setAnnee(incomingStagiaire.getAnnee());
                existingStagiaire.setEmailPerso2(incomingStagiaire.getEmailPerso2());
                existingStagiaire.setNom2(incomingStagiaire.getNom2());
                existingStagiaire.setPrenom2(incomingStagiaire.getPrenom2());
                existingStagiaire.setCin2(incomingStagiaire.getCin2());
                existingStagiaire.setTel2(incomingStagiaire.getTel2());
                existingStagiaire.setSpecialite2(incomingStagiaire.getSpecialite2());
            }
            demande.setStagiaire(existingStagiaire);
            existingStagiaire.getDemandes().add(demande);
        } else {
            Stagiaire newStagiaire = new Stagiaire();
            // Copy main stagiaire info
            newStagiaire.setNom(incomingStagiaire.getNom());
            newStagiaire.setPrenom(incomingStagiaire.getPrenom());
            newStagiaire.setType(RoleType.STAGIAIRE);
            newStagiaire.setEmailPerso(incomingStagiaire.getEmailPerso());
            newStagiaire.setCin(incomingStagiaire.getCin());
            newStagiaire.setTel(incomingStagiaire.getTel());
            newStagiaire.setInstitut(incomingStagiaire.getInstitut());
            newStagiaire.setNiveau(incomingStagiaire.getNiveau());
            newStagiaire.setAnnee(incomingStagiaire.getAnnee());
            newStagiaire.setSpecialite(incomingStagiaire.getSpecialite());

            // Copy second stagiaire info if it exists
            if (incomingStagiaire.getNom2() != null && !incomingStagiaire.getNom2().trim().isEmpty()) {
                newStagiaire.setNom2(incomingStagiaire.getNom2());
                newStagiaire.setPrenom2(incomingStagiaire.getPrenom2());
                newStagiaire.setEmailPerso2(incomingStagiaire.getEmailPerso2());
                newStagiaire.setCin2(incomingStagiaire.getCin2());
                newStagiaire.setTel2(incomingStagiaire.getTel2());
                newStagiaire.setSpecialite2(incomingStagiaire.getSpecialite2());
            }
            
            Stagiaire savedStagiaire = stagiaireRepository.save(newStagiaire);
            demande.setStagiaire(savedStagiaire);
        }

        demande.setStatus(DemandeStatus.SOUMISE);
        Demande savedDemande = demandeRepository.save(demande);

        // Upload all documents
        Set<Document> savedDocuments = new HashSet<>();
        for (Map.Entry<DocumentType, MultipartFile> entry : documents.entrySet()) {
            Document doc = documentService.uploadDocument(savedDemande.getId(), entry.getValue(), entry.getKey());
            savedDocuments.add(doc);
        }

        savedDemande.getDocuments().addAll(savedDocuments);
        demandeRepository.save(savedDemande);
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

        // Schedule deactivation 48 hours after stageFin date
        stagiaireService.scheduleDeactivation(demande.getStagiaire().getId());
    }
    
    public void rejectDemande(int demandeId, String rejectionReason) {
        Demande demande = demandeRepository.findById(demandeId)
                .orElseThrow(() -> new RuntimeException("Demande not found"));

        demande.setStatus(DemandeStatus.REJETEE); 
        Demande savedDemande = demandeRepository.save(demande);
        
        // Schedule deletion
        taskScheduler.schedule(
            () -> deleteRejectedDemande(savedDemande.getId()),
            Instant.now().plus(1, ChronoUnit.HOURS)
        );        
        Stagiaire stagiaire = demande.getStagiaire();
        
        String reciver = stagiaire.getNom() + " " + stagiaire.getPrenom();
        if (stagiaire.getNom2() != null) {
        	reciver = reciver + " et "+ stagiaire.getNom2() + " " + stagiaire.getPrenom2();
        }
       
        String subject = "Statut de votre candidature de stage - Tunisair";
        String body = "Madame/Monsieur " + reciver + ",\n\n"
            + "Nous vous remercions pour l'intérêt que vous avez porté à Tunisair et pour le temps consacré à votre candidature.\n\n"
            + "Nous regrettons de vous informer que votre demande de stage n'a pas pu être retenue.\n\n"
            + "🔍 Motif de refus :\n" 
            + rejectionReason + "\n\n"
            + "Cordialement,\nService Automatique\nTunisair"
            + "----------------------------------------\n"
            + "*Ce message est généré automatiquement - Merci de ne pas y répondre directement*";
      
        emailService.sendEmail(stagiaire.getEmailPerso(), subject, body);
        if (stagiaire.getEmailPerso2() != null ) {
            emailService.sendEmail(stagiaire.getEmailPerso2(), subject, body);
        }
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
    
    public List<Demande> getDemandeList() {
        return demandeRepository.findAll();
    }

	public Demande getDemandeInfo(int id) {
        return demandeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Demande not found"));
	}
    
    @Transactional
    private void deleteRejectedDemande(int demandeId) {
        Demande demande = demandeRepository.findById(demandeId)
            .orElseThrow(() -> new RuntimeException("Demande not found"));
        
        Stagiaire stagiaire = demande.getStagiaire();
        
        
        // Delete demande
        demandeRepository.delete(demande);
        
        // Check if stagiaire has other demandes
        long remainingDemandes = demandeRepository.countByStagiaire(stagiaire);
        if (remainingDemandes == 0) {
            stagiaireRepository.delete(stagiaire);
        }
    }

}
