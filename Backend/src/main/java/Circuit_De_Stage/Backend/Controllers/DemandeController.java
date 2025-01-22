package Circuit_De_Stage.Backend.Controllers;

import Circuit_De_Stage.Backend.Entities.Demande;
import Circuit_De_Stage.Backend.Services.ForumService;
import Circuit_De_Stage.Backend.Repositories.DemandeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;


@RestController
@RequestMapping("/api/demandes")
public class DemandeController {

 @Autowired
 private ForumService forumService;

 @Autowired
 private DemandeRepository demandeRepository;

 @PostMapping
 public ResponseEntity<Demande> submitDemande(@RequestBody Demande demande) {
     forumService.submit(demande);
     return ResponseEntity.status(HttpStatus.CREATED).body(demande);
 }

 @GetMapping("/{id}")
 public ResponseEntity<Demande> getDemande(@PathVariable int id) {
     Demande demande = demandeRepository.findById(id)
             .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
     return ResponseEntity.ok(demande);
 }

 @PutMapping("/{id}/validate")
 @PreAuthorize("hasRole('ENCADRANT')")
 public ResponseEntity<Void> validateDemande(@PathVariable int id) {
     forumService.validateDemande(id);
     return ResponseEntity.ok().build();
 }

 @PutMapping("/{id}/reject")
 @PreAuthorize("hasRole('ENCADRANT')")
 public ResponseEntity<Void> rejectDemande(@PathVariable int id, @RequestBody String reason) {
     forumService.rejectDemande(id, reason);
     return ResponseEntity.ok().build();
 }
}