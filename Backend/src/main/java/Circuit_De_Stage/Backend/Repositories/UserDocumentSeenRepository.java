package Circuit_De_Stage.Backend.Repositories;

import java.util.Optional;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import Circuit_De_Stage.Backend.Entities.User;
import Circuit_De_Stage.Backend.Entities.UserDocumentSeen;

@Repository
public interface UserDocumentSeenRepository extends CrudRepository<UserDocumentSeen, Integer> {

    Optional<UserDocumentSeen> findByDocumentIdAndUtilisateurId(int documentId, int utilisateurId);

	void deleteByUtilisateur(User user);

}
