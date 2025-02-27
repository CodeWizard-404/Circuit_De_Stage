package Circuit_De_Stage.Backend.Controllers;

import Circuit_De_Stage.Backend.Entities.Demande;
import Circuit_De_Stage.Backend.Entities.User;
import Circuit_De_Stage.Backend.Entities.Enum.DocumentType;
import Circuit_De_Stage.Backend.Repositories.UserRepository;
import Circuit_De_Stage.Backend.Services.DemandeService;

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

@RestController // Marks this class as a REST controller
@RequestMapping("/api/demande") // Base URL path for all endpoints in this controller
@CrossOrigin // Enables CORS for all endpoints in this controller
public class DemandeController {

    @Autowired // Injects the UserRepository bean
    private UserRepository userRepository;

    @Autowired // Injects the DemandeService bean
    private final DemandeService demandeService;

    // Constructor-based dependency injection
    public DemandeController(DemandeService demandeService) {
        this.demandeService = demandeService;
    }

    /**
     * Submits a new demande along with associated documents.
     * Accepts JSON data for the demande and multipart files for documents.
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Demande> submitDemande(
            @RequestPart("demande") String demandeJson, // JSON representation of the demande
            @RequestParam Map<String, MultipartFile> documents) throws Throwable {
        // Deserialize the JSON into a Demande object
        ObjectMapper objectMapper = new ObjectMapper();
        Demande demande = objectMapper.readValue(demandeJson, Demande.class);

        // Map document types to their corresponding files
        Map<DocumentType, MultipartFile> docs = new HashMap<>();
        for (Map.Entry<String, MultipartFile> entry : documents.entrySet()) {
            DocumentType type = DocumentType.valueOf(entry.getKey().toUpperCase());
            docs.put(type, entry.getValue());
        }

        // Pass the demande object and documents to the service for processing
        demandeService.submit(demande, docs);

        return ResponseEntity.status(HttpStatus.CREATED).body(demande); // Return the created demande
    }

    /**
     * Validates a demande by its ID.
     * Only accessible to users with the 'ENCADRANT' role.
     */
    @PutMapping("/{id}/validate")
    @PreAuthorize("hasRole('ENCADRANT')") // Ensures only users with the 'ENCADRANT' role can access this endpoint
    public ResponseEntity<Void> validateDemande(@PathVariable("id") int id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication(); // Get the current user's authentication
        String email = authentication.getName(); // Extract the user's email
        User encadrant = userRepository.findByEmail(email); // Find the user by email
        demandeService.validateDemande(id, encadrant.getId()); // Validate the demande using the service
        return ResponseEntity.ok().build(); // Return a 200 OK response
    }

    /**
     * Rejects a demande by its ID.
     * Only accessible to users with the 'ENCADRANT' role.
     */
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ENCADRANT')") // Ensures only users with the 'ENCADRANT' role can access this endpoint
    public ResponseEntity<Void> rejectDemande(@PathVariable("id") int id, @RequestBody String reason) {
        demandeService.rejectDemande(id, reason); // Reject the demande using the service
        return ResponseEntity.ok().build(); // Return a 200 OK response
    }

    /**
     * Retrieves the document types associated with a specific demande.
     */
    @GetMapping("/{id}/document-types")
    public ResponseEntity<Set<DocumentType>> getDocumentTypes(@PathVariable("id") int id) {
        return ResponseEntity.ok(demandeService.getDocumentTypes(id)); // Return the set of document types
    }

    /**
     * Retrieves all demandes.
     * Only accessible to users with specific roles ('ENCADRANT', 'DCRH', etc.).
     */
    @GetMapping("/ALL")
    @PreAuthorize("hasAnyRole('ENCADRANT', 'DCRH', 'SERVICE_ADMINISTRATIVE', 'CENTRE_DE_FORMATION')")
    public ResponseEntity<List<Demande>> getAllDemandes() {
        return ResponseEntity.ok(demandeService.getDemandeList()); // Return the list of all demandes
    }

    /**
     * Retrieves detailed information about a specific demande.
     * Only accessible to users with specific roles ('ENCADRANT', 'DCRH', etc.).
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ENCADRANT', 'DCRH', 'SERVICE_ADMINISTRATIVE', 'CENTRE_DE_FORMATION')")
    public ResponseEntity<Demande> getDemandeInfo(@PathVariable("id") int id) {
        return ResponseEntity.ok(demandeService.getDemandeInfo(id)); // Return the details of the specified demande
    }
}