package Circuit_De_Stage.Backend.Repositories;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import Circuit_De_Stage.Backend.Entities.Stagiaire;

@Repository
public interface StagiaireRepository extends JpaRepository<Stagiaire, Integer> {
    Stagiaire findByEmail(String email);

	Stagiaire findByEmailPerso(String emailPerso);

	boolean existsByEmail(String baseEmail);
}

