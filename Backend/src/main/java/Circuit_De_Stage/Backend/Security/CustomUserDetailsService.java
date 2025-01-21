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

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final StagiaireRepository stagiaireRepository;

    public CustomUserDetailsService(UserRepository userRepository, StagiaireRepository stagiaireRepository) {
        this.userRepository = userRepository;
        this.stagiaireRepository = stagiaireRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Circuit_De_Stage.Backend.Entities.User user = userRepository.findByEmail(email);
        if (user != null) {
            return new org.springframework.security.core.userdetails.User(
                    user.getEmail(),
                    user.getPasse(),
                    mapRolesToAuthorities(user.getType()) 
            );
        }

        Stagiaire stagiaire = stagiaireRepository.findByEmail(email);
        if (stagiaire != null) {
            return new org.springframework.security.core.userdetails.User(
                    stagiaire.getEmail(),
                    stagiaire.getPasse(),
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_STAGIAIRE"))
            );
        }

        throw new UsernameNotFoundException("No user found with email: " + email);
    }
    
    private Collection<? extends GrantedAuthority> mapRolesToAuthorities(RoleType roleType) {
        if (roleType == null) {
            return Collections.emptyList();
        }

        String roleName = "ROLE_" + roleType.name();
        return Collections.singletonList(new SimpleGrantedAuthority(roleName));
    }



}
