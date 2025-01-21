package Circuit_De_Stage.Backend.Repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import Circuit_De_Stage.Backend.Entities.Demande;

@Repository
public interface DemandeRepository extends JpaRepository<Demande, Integer> {

}
