package Circuit_De_Stage.Backend.Services;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

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

    @Autowired
    private TaskScheduler taskScheduler;

    
    @Transactional
    public void submit(Demande demande ,Map<DocumentType, MultipartFile> documents) throws IOException, Throwable  {
        Stagiaire incomingStagiaire = demande.getStagiaire();
        String email2 = incomingStagiaire.getEmailPerso2();
        Long CIN = incomingStagiaire.getCin();

        // Check for existing stagiaire with same personal email
        Stagiaire existingStagiaire = stagiaireRepository.findByCINWithDemandes(CIN);
        
        if (existingStagiaire != null) {
            // Check if existing demande has same stage type
        	if (demandeRepository.existsByStagiaireAndStage(existingStagiaire, demande.getStage())) {
        	    throw new RuntimeException("A request for this stage type already exists");
        	}
            
            // Use existing stagiaire for new demande
        	if(email2 != null) {
            existingStagiaire.setAnnee(incomingStagiaire.getAnnee());
            existingStagiaire.setEmailPerso2(incomingStagiaire.getEmailPerso2());
            existingStagiaire.setNom2(incomingStagiaire.getNom2());
            existingStagiaire.setPrenom2(incomingStagiaire.getPrenom2());
            existingStagiaire.setCin2(incomingStagiaire.getCin2());
            existingStagiaire.setTel2(incomingStagiaire.getTel2());
            existingStagiaire.setSpecialite2(incomingStagiaire.getSpecialite2());
            stagiaireRepository.save(existingStagiaire);
            }
        	
            demande.setStagiaire(existingStagiaire);
            existingStagiaire.getDemandes().add(demande); 


        }else{
            // Create new stagiaire without credentials
            Stagiaire newStagiaire = new Stagiaire();
            newStagiaire.setNom(incomingStagiaire.getNom());
            newStagiaire.setPrenom(incomingStagiaire.getPrenom());
            newStagiaire.setNom2(incomingStagiaire.getNom2());
            newStagiaire.setPrenom2(incomingStagiaire.getPrenom2());      
            
            newStagiaire.setType(RoleType.STAGIAIRE);      
            
            newStagiaire.setEmailPerso(incomingStagiaire.getEmailPerso());            
            newStagiaire.setEmailPerso2(incomingStagiaire.getEmailPerso2());

            newStagiaire.setCin(incomingStagiaire.getCin());            
            newStagiaire.setCin2(incomingStagiaire.getCin2());
            newStagiaire.setTel(incomingStagiaire.getTel());
            newStagiaire.setTel2(incomingStagiaire.getTel2());            
            newStagiaire.setInstitut(incomingStagiaire.getInstitut());
            newStagiaire.setSpecialite2(incomingStagiaire.getSpecialite2());
            
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

	public Demande getStagiaireInfo(int id) {
        return demandeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Demande not found"));
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
