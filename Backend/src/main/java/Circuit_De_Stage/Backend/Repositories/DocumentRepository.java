package Circuit_De_Stage.Backend.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import Circuit_De_Stage.Backend.Entities.Demande;
import Circuit_De_Stage.Backend.Entities.Document;
import Circuit_De_Stage.Backend.Entities.Enum.DocumentType;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Integer> {
	
    Document findByDemandeAndType(Demande demande, DocumentType type);
    void deleteAllByDemande(Demande demande);



}

