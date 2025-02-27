package Circuit_De_Stage.Backend.Repositories;


import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import Circuit_De_Stage.Backend.Entities.Stagiaire;

@Repository // Marks this interface as a Spring-managed repository
public interface StagiaireRepository extends JpaRepository<Stagiaire, Integer> {

    /**
     * Finds a stagiaire by their email address.
     * Useful for authentication or retrieving user details by email.
     */
    Stagiaire findByEmail(String email);

    /**
     * Checks if a stagiaire with the given email exists.
     * Useful for validation to avoid duplicate email addresses.
     */
    boolean existsByEmail(String baseEmail);

    /**
     * Custom query to find a stagiaire by their CIN (national identity card number)
     * and eagerly fetch their associated demandes (requests).
     * Ensures that the demandes are loaded along with the stagiaire in a single query.
     */
    @Query("SELECT s FROM Stagiaire s LEFT JOIN FETCH s.demandes WHERE s.cin = :cin")
    Stagiaire findByCINWithDemandes(@Param("cin") long cin);

    /**
     * Custom query to retrieve all stagiaires along with their demandes and documents.
     * Uses eager fetching to load related entities (demandes and documents) in a single query.
     * Prevents lazy loading issues when accessing nested relationships.
     */
    @Query("SELECT s FROM Stagiaire s " +
            "LEFT JOIN FETCH s.demandes d " +
            "LEFT JOIN FETCH d.documents")
    List<Stagiaire> findAllWithDemandesAndDocuments();
}