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
    private UserDocumentSeenRepository userDocumentSeenRepository;

    
    

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

        Document existingDocument = documentRepository.findByDemandeAndType(demande, type);
        if (existingDocument != null) {
        	userDocumentSeenRepository.deleteAll(existingDocument.getDocumentStatuses());
            documentRepository.delete(existingDocument);
        }

        Document document = new Document();
        document.setDemande(demande);
        document.setType(type);
        document.setName(type + "_" + uploaderName);
        document.setFichier(file.getBytes());
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

        UserDocumentSeen status = new UserDocumentSeen();
        status.setDocument(document);
        status.setUtilisateur(utilisateur);
        status.setRole(utilisateur.getType());// Next role to act
        status.setSeen(false);
        userDocumentSeenRepository.save(status);
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

        // Delete UserDocumentSeen records associated with the document
        userDocumentSeenRepository.deleteAll(document.getDocumentStatuses());

        // Delete the document after rejecting it
        documentRepository.delete(document);

        User utilisateur = userRepository.findById(utilisateurId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        UserDocumentSeen status = new UserDocumentSeen();
        status.setDocument(document);
        status.setUtilisateur(utilisateur);
        status.setRole(utilisateur.getType());
        status.setSeen(false);
        
        userDocumentSeenRepository.save(status);
        
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
    	UserDocumentSeen status = userDocumentSeenRepository.findByDocumentIdAndUtilisateurId(documentId, utilisateurId)
                .orElseThrow(() -> new RuntimeException("Status for the document and user not found"));

        status.setSeen(seen);
        userDocumentSeenRepository.save(status);
    }

    public boolean Status(int documentId, int utilisateurId) {
    	UserDocumentSeen status = userDocumentSeenRepository.findByDocumentIdAndUtilisateurId(documentId, utilisateurId)
                .orElseThrow(() -> new RuntimeException("Status for the document and user not found"));

        return status.isSeen();
    }
}
