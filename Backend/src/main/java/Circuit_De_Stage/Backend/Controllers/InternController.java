package Circuit_De_Stage.Backend.Controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
//import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

//import Circuit_De_Stage.Backend.Entities.Stagiaire;
import Circuit_De_Stage.Backend.Services.StagiaireService;

@RestController
@RequestMapping("/api/stagiaires")
@PreAuthorize("hasAnyRole('ENCADRANT', 'DCRH', 'SERVICE_ADMINISTRATIVE', 'CENTRE_DE_FORMATION')")
@CrossOrigin
public class InternController {

    private final StagiaireService stagiaireService;

    public InternController(StagiaireService stagiaireService) {
        this.stagiaireService = stagiaireService;
    }

    // @GetMapping("/{id}")
    // public ResponseEntity<Stagiaire> getStagiaireInfo(@PathVariable("id") int id) {
    //     return ResponseEntity.ok(stagiaireService.getStagiaireInfo(id));
    // }

    // @GetMapping
    // public ResponseEntity<List<Stagiaire>> getAllStagiaires() {
    //     return ResponseEntity.ok(stagiaireService.getStagiaireList());
    // }

    @DeleteMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('SERVICE_ADMINISTRATIVE')")
    public ResponseEntity<Void> deactivateAccount(@PathVariable("id") int id) {
        stagiaireService.desactiverCompte(id);
        return ResponseEntity.noContent().build();
    }
}