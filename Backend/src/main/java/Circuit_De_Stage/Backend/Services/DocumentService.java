package Circuit_De_Stage.Backend.Services;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import Circuit_De_Stage.Backend.Entities.*;
import Circuit_De_Stage.Backend.Entities.Enum.DocumentStatus;
import Circuit_De_Stage.Backend.Entities.Enum.DocumentType;
import Circuit_De_Stage.Backend.Repositories.*;
import io.jsonwebtoken.io.IOException;

import java.time.LocalDateTime;


@Service
public class DocumentService {

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private DemandeRepository demandeRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired   
    private EmailService emailService;

    @Autowired
    private InternDocumentUserStatusRepository internDocumentUserStatusRepository;

    
    

    public Document uploadDocument(int demandeId, MultipartFile file, DocumentType type) throws IOException, Throwable {
        Demande demande = demandeRepository.findById(demandeId)
                .orElseThrow(() -> new RuntimeException("Demande not found"));

        
        Stagiaire stagiaire = demande.getStagiaire();
        User encadrant = demande.getEncadrant();

        String uploaderName = "";
        if (stagiaire != null) {
            uploaderName = stagiaire.getNom() + "_" + stagiaire.getPrenom();
        } else if (encadrant != null) {
            uploaderName = encadrant.getNom() + "_" + encadrant.getPrenom();
        }

        byte[] fileData = file.getBytes();

        String documentName = type.toString() + "_" + uploaderName;

        Document existingDocument = documentRepository.findByDemandeAndType(demande, type);
        if (existingDocument != null) {
            documentRepository.delete(existingDocument);
        }

        Document document = new Document();
        document.setDemande(demande);
        document.setType(type);
        document.setName(documentName);
        document.setFichier(fileData);
        document.setStatus(DocumentStatus.SOUMIS);
        document.setCreatedAt(LocalDateTime.now());

        if (stagiaire != null) {
            document.setStagiaire(stagiaire);
        }

        document.setDemande(demande);
        return documentRepository.save(document);
    }

    public byte[] downloadDocument(int documentId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        return document.getFichier();
    }

    public void validateDocument(int documentId, int utilisateurId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));
        User utilisateur = userRepository.findById(utilisateurId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        document.setStatus(DocumentStatus.VALIDE);
        documentRepository.save(document);

        InternDocumentUserStatus status = new InternDocumentUserStatus();
        status.setDocument(document);
        status.setUtilisateur(utilisateur);
        status.setSeen(false);
        internDocumentUserStatusRepository.save(status);
    }

    public void rejectDocument(int documentId, int utilisateurId, String reason) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        Stagiaire stagiaire = document.getStagiaire();
        if (stagiaire == null) {
            throw new RuntimeException("Stagiaire not found");
        }

        document.setStatus(DocumentStatus.REJETE);
        documentRepository.save(document);

        User utilisateur = userRepository.findById(utilisateurId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        InternDocumentUserStatus status = new InternDocumentUserStatus();
        status.setDocument(document);
        status.setUtilisateur(utilisateur);
        status.setSeen(false);
        
        internDocumentUserStatusRepository.save(status);
        
        String subject = "Document non conforme - Mise à jour requise";
        String body = "Madame/Monsieur " + stagiaire.getNom() + " " + stagiaire.getPrenom() + ",\n\n"
            + "À la suite de notre vérification, nous devons vous informer que le document suivant nécessite une correction :\n"
            + "📄 Document concerné : " + document.getType() + "\n\n"
            + "🔍 Motif de rejet :\n" 
            + reason + "\n\n"
            + "ℹ️ Veuillez :\n"
            + "1. Corriger le document mentionné\n"
            + "2. Resoumettre avant 24h \n\n"
            + "Nous attirons votre attention sur :\n"
            + "- La nécessité de respecter les consignes techniques\n"
            + "- L'importance des délais de traitement\n\n"
            + "Cordialement,\n"
            + "Cordialement,\nService Automatique\nTunisair"
            + "----------------------------------------\n"
            + "*Ce message est généré automatiquement - Merci de ne pas y répondre directement*";

        emailService.sendEmail(stagiaire.getEmail(), subject, body);
    }

    public void updateSeenStatus(int documentId, int utilisateurId, boolean seen) {
        InternDocumentUserStatus status = internDocumentUserStatusRepository.findByDocumentIdAndUtilisateurId(documentId, utilisateurId)
                .orElseThrow(() -> new RuntimeException("Status for the document and user not found"));

        status.setSeen(seen);
        internDocumentUserStatusRepository.save(status);
    }

    public boolean Status(int documentId, int utilisateurId) {
        InternDocumentUserStatus status = internDocumentUserStatusRepository.findByDocumentIdAndUtilisateurId(documentId, utilisateurId)
                .orElseThrow(() -> new RuntimeException("Status for the document and user not found"));

        return status.isSeen();
    }
}
