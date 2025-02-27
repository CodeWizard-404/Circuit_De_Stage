package Circuit_De_Stage.Backend.Repositories;

import java.util.Optional;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import Circuit_De_Stage.Backend.Entities.User;
import Circuit_De_Stage.Backend.Entities.UserDocumentSeen;

@Repository // Marks this interface as a Spring-managed repository
public interface UserDocumentSeenRepository extends CrudRepository<UserDocumentSeen, Integer> {

    /**
     * Finds a record indicating that a specific user has viewed a specific document.
     * Useful for checking if a user has already seen a document.
     */
    Optional<UserDocumentSeen> findByDocumentIdAndUtilisateurId(int documentId, int utilisateurId);

    /**
     * Deletes all records associated with a specific user.
     * Useful for cleaning up data when a user is deleted or updated.
     */
    void deleteByUtilisateur(User user);
}