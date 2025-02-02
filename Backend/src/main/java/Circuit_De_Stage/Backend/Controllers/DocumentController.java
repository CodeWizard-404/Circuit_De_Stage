package Circuit_De_Stage.Backend.Controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import Circuit_De_Stage.Backend.Entities.Document;
import Circuit_De_Stage.Backend.Entities.User;
import Circuit_De_Stage.Backend.Entities.Enum.DocumentType;
import Circuit_De_Stage.Backend.Repositories.UserRepository;
import Circuit_De_Stage.Backend.Services.DocumentService;

@RestController
@RequestMapping("/api/document")
@PreAuthorize("hasAnyRole('STAGIAIRE', 'ENCADRANT', 'DCRH', 'SERVICE_ADMINISTRATIVE', 'CENTRE_DE_FORMATION')")
@CrossOrigin
public class DocumentController {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @PostMapping(value = "/upload/{demandeId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Document> uploadDocument(
            @PathVariable("demandeId") int demandeId,
            @RequestPart("file") MultipartFile file,
            @RequestParam("type") DocumentType type) throws Throwable { // Explicit param name
        
        return ResponseEntity.ok(documentService.uploadDocument(demandeId, file, type));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadDocument(@PathVariable("id") int id) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"document\"")
                .body(documentService.downloadDocument(id));
    }

    @PutMapping("/{id}/validate")
    @PreAuthorize("hasAnyRole('ENCADRANT', 'DCRH', 'SERVICE_ADMINISTRATIVE', 'CENTRE_DE_FORMATION')")
    public ResponseEntity<Void> validateDocument(
    	    @PathVariable("id") int documentId) {
    	    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    	    UserDetails userDetails = (UserDetails) authentication.getPrincipal();
    	    String email = userDetails.getUsername();
    	    User validator = userRepository.findByEmail(email);
    	    
    	    documentService.validateDocument(documentId, validator.getId());
    	    return ResponseEntity.ok().build();
    	}

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('SERVICE_ADMINISTRATIVE', 'CENTRE_DE_FORMATION')")
    public ResponseEntity<Void> rejectDocument(@PathVariable("id") int id, 
                                             @RequestBody String reason) {
	    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
	    UserDetails userDetails = (UserDetails) authentication.getPrincipal();
	    String email = userDetails.getUsername();
	    User rejector = userRepository.findByEmail(email);
	    
        documentService.rejectDocument(id, rejector.getId(), reason);
        return ResponseEntity.ok().build();
    }
    
    
}