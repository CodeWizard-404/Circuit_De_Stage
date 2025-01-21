package Circuit_De_Stage.Backend.Repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import Circuit_De_Stage.Backend.Entities.Document;
import Circuit_De_Stage.Backend.Entities.InternDocumentUserStatus;

@Repository
public interface InternDocumentUserStatusRepository extends CrudRepository<InternDocumentUserStatus, Integer> {

    Optional<InternDocumentUserStatus> findByDocumentIdAndUtilisateurId(Long documentId, int utilisateurId);

}
