package Circuit_De_Stage.Backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import Circuit_De_Stage.Backend.Entities.User;
import Circuit_De_Stage.Backend.Entities.Enum.RoleType;
import Circuit_De_Stage.Backend.Repositories.UserRepository;

@Component
public class StartupConfig implements CommandLineRunner {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public StartupConfig(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        String adminEmail = "admin@tunisair.com.tn";
        User existingUser = userRepository.findByEmail(adminEmail);
        
        if (existingUser == null) {
            User adminUser = new User();
            adminUser.setNom("admin");
            adminUser.setPrenom("admin");
            adminUser.setEmail(adminEmail);
            adminUser.setPasse(passwordEncoder.encode("admin")); // Encode password
            adminUser.setType(RoleType.SERVICE_ADMINISTRATIVE); // Set role
            userRepository.save(adminUser);
            System.out.println("Service Administrative User created successfully.");
        }
    }
}