package Circuit_De_Stage.Backend.Services;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.stereotype.Service;

import Circuit_De_Stage.Backend.Entities.Stagiaire;

import Circuit_De_Stage.Backend.Repositories.StagiaireRepository;

@Service // Marks this class as a Spring-managed service
public class StagiaireService {

    @Autowired // Injects dependencies
    private StagiaireRepository stagiaireRepository;

    @Autowired
    private TaskScheduler taskScheduler;

    /**
     * Schedules the deactivation of a stagiaire's account after 48 hours.
     */
    public void scheduleDeactivation(int stagiaireId) {
        // Calculate the deactivation time (48 hours from now)
        Instant deactivationTime = Instant.now().plus(48, ChronoUnit.HOURS);

        // Schedule the deactivation task
        taskScheduler.schedule(() -> desactiverCompte(stagiaireId), deactivationTime);
    }

    /**
     * Deactivates a stagiaire's account by setting their password to null.
     */
    public void desactiverCompte(int stagiaireId) {
        // Retrieve the stagiaire from the database
        Stagiaire stagiaire = stagiaireRepository.findById(stagiaireId)
            .orElseThrow(() -> new RuntimeException("Stagiaire not found"));

        // Deactivate the account by removing the password
        stagiaire.setPasse(null); // Set password to null to deactivate the account
        stagiaireRepository.save(stagiaire); // Save the updated stagiaire in the database
    }
}