package Circuit_De_Stage.Backend.Controllers;


import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/stagiaires")
@PreAuthorize("hasAnyRole('ENCADRANT', 'DCRH', 'SERVICE_ADMINISTRATIVE', 'CENTRE_DE_FORMATION')")
@CrossOrigin
public class InternController {

    //private final StagiaireService stagiaireService;

    //public InternController(StagiaireService stagiaireService) {
    //    this.stagiaireService = stagiaireService;
    //}

    // @GetMapping("/{id}")
    // public ResponseEntity<Stagiaire> getStagiaireInfo(@PathVariable("id") int id) {
    //     return ResponseEntity.ok(stagiaireService.getStagiaireInfo(id));
    // }

    // @GetMapping
    // public ResponseEntity<List<Stagiaire>> getAllStagiaires() {
    //     return ResponseEntity.ok(stagiaireService.getStagiaireList());
    // }

    //@DeleteMapping("/{id}/deactivate")
    //@PreAuthorize("hasRole('SERVICE_ADMINISTRATIVE')")
    //public ResponseEntity<Void> deactivateAccount(@PathVariable("id") int id) {
    //    stagiaireService.desactiverCompte(id);
    //    return ResponseEntity.noContent().build();
    //}
}