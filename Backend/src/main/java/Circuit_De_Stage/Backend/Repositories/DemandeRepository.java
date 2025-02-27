package Circuit_De_Stage.Backend.Repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import Circuit_De_Stage.Backend.Entities.Demande;
import Circuit_De_Stage.Backend.Entities.Stagiaire;
import Circuit_De_Stage.Backend.Entities.User;
import Circuit_De_Stage.Backend.Entities.Enum.DocumentType;
import Circuit_De_Stage.Backend.Entities.Enum.StageType;

@Repository // Marks this interface as a Spring-managed repository
public interface DemandeRepository extends JpaRepository<Demande, Integer> {

    /**
     * Checks if a demande exists for a specific stagiaire and stage type.
     */
    boolean existsByStagiaireAndStage(Stagiaire stagiaire, StageType stage);

    /**
     * Retrieves all demandes associated with a specific encadrant (supervisor).
     */
    List<Demande> findByEncadrant(User user);

    /**
     * Counts the number of demandes associated with a specific stagiaire.
     */
    long countByStagiaire(Stagiaire stagiaire);

    /**
     * Custom query to find demandes for a specific stagiaire and document type.
     * Uses JPQL to join the 'Demande' entity with its associated documents.
     */
    @Query("SELECT d FROM Demande d JOIN d.documents doc WHERE d.stagiaire.id = :stagiaireId AND doc.type = :docType")
    List<Demande> findDemandesByStagiaireAndDocumentType(
        @Param("stagiaireId") int stagiaireId, // Parameter for the stagiaire's ID
        @Param("docType") DocumentType docType // Parameter for the document type
    );
}