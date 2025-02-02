package Circuit_De_Stage.Backend.Controllers;

import Circuit_De_Stage.Backend.Entities.Demande;
import Circuit_De_Stage.Backend.Entities.User;
import Circuit_De_Stage.Backend.Entities.Enum.DocumentType;
import Circuit_De_Stage.Backend.Repositories.UserRepository;
import Circuit_De_Stage.Backend.Services.DemandeService;
import Circuit_De_Stage.Backend.Services.DocumentService;

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

import com.fasterxml.jackson.databind.ObjectMapper;


@RestController
@RequestMapping("/api/demande")
@CrossOrigin
public class DemandeController {
	
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private final DemandeService demandeService;

    @Autowired
    private DocumentService documentService;

    public DemandeController(DemandeService demandeService) {
        this.demandeService = demandeService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Demande> submitDemande(
            @RequestPart("demande") String demandeJson, // Get the JSON as a String
            @RequestParam Map<String, MultipartFile> documents) throws Throwable {

        // Deserialize the JSON into a Demande object
        ObjectMapper objectMapper = new ObjectMapper();
        Demande demande = objectMapper.readValue(demandeJson, Demande.class);

        Map<DocumentType, MultipartFile> docs = new HashMap<>();
        for (Map.Entry<String, MultipartFile> entry : documents.entrySet()) {
            DocumentType type = DocumentType.valueOf(entry.getKey().toUpperCase());
            docs.put(type, entry.getValue());
        }

        // Pass the demande object and documents to the service
        demandeService.submit(demande, docs);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(demande);
    }


    @PutMapping("/{id}/validate")
    @PreAuthorize("hasRole('ENCADRANT')")
    public ResponseEntity<Void> validateDemande(@PathVariable("id") int id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User encadrant = userRepository.findByEmail(email);

        demandeService.validateDemande(id, encadrant.getId());        
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ENCADRANT')")
    public ResponseEntity<Void> rejectDemande(@PathVariable("id") int id, @RequestBody String reason) {
    	demandeService.rejectDemande(id, reason);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/document-types")
    public ResponseEntity<Set<DocumentType>> getDocumentTypes(@PathVariable("id") int id) {
        return ResponseEntity.ok(demandeService.getDocumentTypes(id));
    }
    
    @GetMapping("/ALL")
    @PreAuthorize("hasAnyRole('ENCADRANT', 'DCRH', 'SERVICE_ADMINISTRATIVE', 'CENTRE_DE_FORMATION')")
    public ResponseEntity<List<Demande>> getAllDemandes() {
        return ResponseEntity.ok(demandeService.getDemandeList());
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ENCADRANT', 'DCRH', 'SERVICE_ADMINISTRATIVE', 'CENTRE_DE_FORMATION')")
    public ResponseEntity<Demande> getDemandeInfo(@PathVariable("id") int id) {
        return ResponseEntity.ok(demandeService.getDemandeInfo(id));
    }
    
    
    //to be removed

    @PutMapping("/{documentId}/seen")
    @PreAuthorize("hasAnyRole('ENCADRANT', 'DCRH', 'SERVICE_ADMINISTRATIVE', 'CENTRE_DE_FORMATION')")
    public ResponseEntity<Void> markAsSeen(@PathVariable int documentId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByEmail(auth.getName());
        documentService.updateSeenStatus(documentId, user.getId(), true);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{documentId}/status")
    @PreAuthorize("hasAnyRole('ENCADRANT', 'DCRH', 'SERVICE_ADMINISTRATIVE', 'CENTRE_DE_FORMATION')")
    public ResponseEntity<Boolean> getSeenStatus(@PathVariable int documentId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByEmail(auth.getName());
        return ResponseEntity.ok(documentService.Status(documentId, user.getId()));
    }
}