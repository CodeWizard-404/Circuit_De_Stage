package Circuit_De_Stage.Backend.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import Circuit_De_Stage.Backend.Entities.User;

@Repository // Marks this interface as a Spring-managed repository
public interface UserRepository extends JpaRepository<User, Integer> {

    /**
     * Finds a user by their email address.
     * Useful for authentication or retrieving user details by email.
     */
    User findByEmail(String email);

    /**
     * Checks if a user with the given email exists.
     * Useful for validation to avoid duplicate email addresses.
     */
    boolean existsByEmail(String baseEmail);
}