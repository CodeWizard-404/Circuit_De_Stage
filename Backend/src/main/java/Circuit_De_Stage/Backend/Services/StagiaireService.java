package Circuit_De_Stage.Backend.Services;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.stereotype.Service;

import Circuit_De_Stage.Backend.Entities.Stagiaire;

import Circuit_De_Stage.Backend.Repositories.StagiaireRepository;

@Service
public class StagiaireService {

    @Autowired
    private StagiaireRepository stagiaireRepository;

    @Autowired
    private TaskScheduler taskScheduler;

    public void scheduleDeactivation(int stagiaireId) {
        Instant deactivationTime = Instant.now().plus(48, ChronoUnit.HOURS);
        taskScheduler.schedule(() -> desactiverCompte(stagiaireId), deactivationTime);
    }

    public void desactiverCompte(int stagiaireId) {
        Stagiaire stagiaire = stagiaireRepository.findById(stagiaireId)
            .orElseThrow(() -> new RuntimeException("Stagiaire not found"));

        // Deactivate the account (no status change here)
        stagiaire.setPasse(null);
        stagiaireRepository.save(stagiaire);
    }
}