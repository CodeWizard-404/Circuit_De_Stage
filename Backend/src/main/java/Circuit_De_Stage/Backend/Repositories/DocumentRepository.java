package Circuit_De_Stage.Backend.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import Circuit_De_Stage.Backend.Entities.Demande;
import Circuit_De_Stage.Backend.Entities.Document;
import Circuit_De_Stage.Backend.Entities.Enum.DocumentType;

@Repository // Marks this interface as a Spring-managed repository
public interface DocumentRepository extends JpaRepository<Document, Integer> {

    /**
     * Finds a document by its associated demande and type.
     * Useful for retrieving specific documents related to a demande.
     */
    Document findByDemandeAndType(Demande demande, DocumentType type);

    /**
     * Deletes all documents associated with a specific demande.
     * Useful for cleaning up documents when a demande is deleted or updated.
     */
    void deleteAllByDemande(Demande demande);
}