package Circuit_De_Stage.Backend.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import Circuit_De_Stage.Backend.Entities.Demande;

@Repository
public interface DemandeRepository extends JpaRepository<Demande, Integer> {
    @Query("SELECT d FROM Demande d LEFT JOIN FETCH d.documents WHERE d.id = :id")
    Demande findByIdWithDocuments(@Param("id") int id);
}
