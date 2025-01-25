package Circuit_De_Stage.Backend.Repositories;


import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import Circuit_De_Stage.Backend.Entities.Stagiaire;

@Repository
public interface StagiaireRepository extends JpaRepository<Stagiaire, Integer> {
    Stagiaire findByEmail(String email);
	boolean existsByEmail(String baseEmail);
	
	@Query("SELECT s FROM Stagiaire s LEFT JOIN FETCH s.demandes WHERE s.cin = :cin")
	Stagiaire findByCINWithDemandes(@Param("cin") long cin);
	
	    
    @Query("SELECT s FROM Stagiaire s " +
            "LEFT JOIN FETCH s.demandes d " +
            "LEFT JOIN FETCH d.documents")
     List<Stagiaire> findAllWithDemandesAndDocuments();


}

