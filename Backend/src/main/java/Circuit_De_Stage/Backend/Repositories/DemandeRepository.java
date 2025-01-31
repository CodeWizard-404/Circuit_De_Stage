package Circuit_De_Stage.Backend.Repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import Circuit_De_Stage.Backend.Entities.Demande;
import Circuit_De_Stage.Backend.Entities.Stagiaire;
import Circuit_De_Stage.Backend.Entities.User;
import Circuit_De_Stage.Backend.Entities.Enum.StageType;

@Repository
public interface DemandeRepository extends JpaRepository<Demande, Integer> {
	boolean existsByStagiaireAndStage(Stagiaire stagiaire, StageType stage);

	List<Demande> findByEncadrant(User user);

	long countByStagiaire(Stagiaire stagiaire);
	
}