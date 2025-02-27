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

@RestController // Marks this class as a REST controller
@RequestMapping("/api/document") // Base URL path for all endpoints in this controller
@PreAuthorize("hasAnyRole('STAGIAIRE', 'ENCADRANT', 'DCRH', 'SERVICE_ADMINISTRATIVE', 'CENTRE_DE_FORMATION')") // Restricts access to users with specific roles
@CrossOrigin // Enables CORS for all endpoints in this controller
public class DocumentController {

    @Autowired // Injects the UserRepository bean
    private UserRepository userRepository;

    @Autowired // Injects the DocumentService bean
    private final DocumentService documentService;

    // Constructor-based dependency injection
    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    /**
     * Uploads a document associated with a specific demande.
     * Accepts a file and document type via multipart form data.
     */
    @PostMapping(value = "/upload/{demandeId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Document> uploadDocument(
            @PathVariable("demandeId") int demandeId, // ID of the associated demande
            @RequestPart("file") MultipartFile file, // Uploaded file
            @RequestParam("type") DocumentType type) throws Throwable { // Type of the document
        
        return ResponseEntity.ok(documentService.uploadDocument(demandeId, file, type)); // Return the uploaded document
    }

    /**
     * Downloads a document by its ID.
     * Returns the document as a downloadable file.
     */
    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadDocument(@PathVariable("id") int id) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"document\"") // Set the Content-Disposition header
                .body(documentService.downloadDocument(id)); // Return the document's byte array
    }

    /**
     * Validates a document by its ID.
     * Only accessible to users with specific roles ('ENCADRANT', 'DCRH', etc.).
     */
    @PutMapping("/{id}/validate")
    @PreAuthorize("hasAnyRole('ENCADRANT', 'DCRH', 'SERVICE_ADMINISTRATIVE', 'CENTRE_DE_FORMATION')")
    public ResponseEntity<Void> validateDocument(@PathVariable("id") int documentId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication(); // Get the current user's authentication
        UserDetails userDetails = (UserDetails) authentication.getPrincipal(); // Extract user details
        String email = userDetails.getUsername(); // Extract the user's email
        User validator = userRepository.findByEmail(email); // Find the user by email

        documentService.validateDocument(documentId, validator.getId()); // Validate the document using the service
        return ResponseEntity.ok().build(); // Return a 200 OK response
    }

    /**
     * Rejects a document by its ID.
     * Only accessible to users with specific roles ('SERVICE_ADMINISTRATIVE', 'CENTRE_DE_FORMATION').
     */
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('SERVICE_ADMINISTRATIVE', 'CENTRE_DE_FORMATION')")
    public ResponseEntity<Void> rejectDocument(
            @PathVariable("id") int id, 
            @RequestBody String reason) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication(); // Get the current user's authentication
        UserDetails userDetails = (UserDetails) authentication.getPrincipal(); // Extract user details
        String email = userDetails.getUsername(); // Extract the user's email
        User rejector = userRepository.findByEmail(email); // Find the user by email

        documentService.rejectDocument(id, rejector.getId(), reason); // Reject the document using the service
        return ResponseEntity.ok().build(); // Return a 200 OK response
    }
}