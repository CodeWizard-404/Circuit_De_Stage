package Circuit_De_Stage.Backend.Security;

import java.util.Collection;
import java.util.Collections;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import Circuit_De_Stage.Backend.Entities.Stagiaire;
import Circuit_De_Stage.Backend.Entities.Enum.RoleType;
import Circuit_De_Stage.Backend.Repositories.StagiaireRepository;
import Circuit_De_Stage.Backend.Repositories.UserRepository;

@Service // Marks this class as a Spring-managed service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository; // Repository to interact with the user table in the database
    private final StagiaireRepository stagiaireRepository; // Repository to interact with the stagiaire table in the database

    // Constructor-based dependency injection
    public CustomUserDetailsService(UserRepository userRepository, StagiaireRepository stagiaireRepository) {
        this.userRepository = userRepository;
        this.stagiaireRepository = stagiaireRepository;
    }

    /**
     * Loads a user by their email address.
     * This method is required by the UserDetailsService interface and is used by Spring Security during authentication.
     */
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // Check if the user exists in the "User" table
        Circuit_De_Stage.Backend.Entities.User user = userRepository.findByEmail(email);
        if (user != null) {
            return new org.springframework.security.core.userdetails.User(
                    user.getEmail(), // Username (email in this case)
                    user.getPasse(), // Password
                    mapRolesToAuthorities(user.getType()) // Map the user's role to authorities
            );
        }

        // Check if the user exists in the "Stagiaire" table
        Stagiaire stagiaire = stagiaireRepository.findByEmail(email);
        if (stagiaire != null) {
            return new org.springframework.security.core.userdetails.User(
                    stagiaire.getEmail(), // Username (email in this case)
                    stagiaire.getPasse(), // Password
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_STAGIAIRE")) // Assign the STAGIAIRE role
            );
        }

        // If no user is found, throw an exception
        throw new UsernameNotFoundException("No user found with email: " + email);
    }

    /**
     * Maps a RoleType to a collection of GrantedAuthority objects.
     * This is used to assign roles to users during authentication.
     */
    private Collection<? extends GrantedAuthority> mapRolesToAuthorities(RoleType roleType) {
        if (roleType == null) {
            return Collections.emptyList(); // Return an empty list if the role type is null
        }
        String roleName = "ROLE_" + roleType.name(); // Prefix the role name with "ROLE_"
        return Collections.singletonList(new SimpleGrantedAuthority(roleName)); // Wrap the role in a SimpleGrantedAuthority
    }
}