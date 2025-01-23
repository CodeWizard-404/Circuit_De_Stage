package Circuit_De_Stage.Backend.Services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import Circuit_De_Stage.Backend.Entities.Stagiaire;
import Circuit_De_Stage.Backend.Repositories.StagiaireRepository;

@Service
public class StagiaireService {

    @Autowired
    private StagiaireRepository stagiaireRepository;
  
    
    public Stagiaire getStagiaireInfo(int stagiaireId) {
        return stagiaireRepository.findById(stagiaireId)
            .orElseThrow(() -> new RuntimeException("Stagiaire not found"));
    }
    
    public List<Stagiaire> getStagiaireList() {
        return stagiaireRepository.findAll();
    }

    public void desactiverCompte(int stagiaireId) {
        Stagiaire stagiaire = stagiaireRepository.findById(stagiaireId)
            .orElseThrow(() -> new RuntimeException("Stagiaire not found"));

        stagiaire.setPasse(null); 
        stagiaireRepository.save(stagiaire);
    }
}