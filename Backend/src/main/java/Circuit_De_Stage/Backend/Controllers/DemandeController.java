package Circuit_De_Stage.Backend.Controllers;

import Circuit_De_Stage.Backend.Entities.Demande;
import Circuit_De_Stage.Backend.Entities.User;
import Circuit_De_Stage.Backend.Entities.Enum.DocumentType;
import Circuit_De_Stage.Backend.Repositories.UserRepository;
import Circuit_De_Stage.Backend.Services.DocumentService;
import Circuit_De_Stage.Backend.Services.ForumService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


@RestController
@RequestMapping("/api/demande")
public class DemandeController {
	
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private final ForumService forumService;

    @Autowired
    private DocumentService documentService;

    public DemandeController(ForumService forumService) {
        this.forumService = forumService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Demande> submitDemande(
            @RequestPart("demande") Demande demande,
            @RequestParam Map<String, MultipartFile> documents) throws Throwable { 

        Map<DocumentType, MultipartFile> docs = new HashMap<>();
        for (Map.Entry<String, MultipartFile> entry : documents.entrySet()) {
            DocumentType type = DocumentType.valueOf(entry.getKey().toUpperCase());
            docs.put(type, entry.getValue());
        }

        forumService.submit(demande, docs);
        return ResponseEntity.status(HttpStatus.CREATED).body(demande);
    }

    @PutMapping("/{id}/validate")
    @PreAuthorize("hasRole('ENCADRANT')")
    public ResponseEntity<Void> validateDemande(@PathVariable("id") int id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User encadrant = userRepository.findByEmail(email);

        forumService.validateDemande(id, encadrant.getId());        
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ENCADRANT')")
    public ResponseEntity<Void> rejectDemande(@PathVariable("id") int id, @RequestBody String reason) {
        forumService.rejectDemande(id, reason);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/document-types")
    public ResponseEntity<Set<DocumentType>> getDocumentTypes(@PathVariable("id") int id) {
        return ResponseEntity.ok(forumService.getDocumentTypes(id));
    }
    
    @GetMapping
    public ResponseEntity<List<Demande>> getAllStagiaires() {
        return ResponseEntity.ok(forumService.getDemandeList());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Demande> getStagiaireInfo(@PathVariable("id") int id) {
        return ResponseEntity.ok(forumService.getStagiaireInfo(id));
    }

    @PutMapping("/{documentId}/seen")
    public ResponseEntity<Void> markAsSeen(@PathVariable int documentId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByEmail(auth.getName());
        documentService.updateSeenStatus(documentId, user.getId(), true);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{documentId}/status")
    public ResponseEntity<Boolean> getSeenStatus(@PathVariable int documentId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByEmail(auth.getName());
        return ResponseEntity.ok(documentService.Status(documentId, user.getId()));
    }
}