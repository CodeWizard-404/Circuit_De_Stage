package Circuit_De_Stage.Backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import Circuit_De_Stage.Backend.Entities.User;
import Circuit_De_Stage.Backend.Entities.Enum.RoleType;
import Circuit_De_Stage.Backend.Repositories.UserRepository;

@Component // Marks this class as a Spring-managed component
public class StartupConfig implements CommandLineRunner {
    private final UserRepository userRepository; // Repository to interact with the user table in the database
    private final BCryptPasswordEncoder passwordEncoder; // Encoder to hash passwords securely

    // Constructor-based dependency injection
    public StartupConfig(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * This method is executed when the application starts.
     * It ensures that a default admin user exists in the database.
     */
    @Override
    public void run(String... args) throws Exception {
        String adminEmail = "admin@tunisair.com.tn"; // Default admin email address
        User existingUser = userRepository.findByEmail(adminEmail); // Check if the admin user already exists

        // If the admin user does not exist, create one
        if (existingUser == null) {
            User adminUser = new User(); // Create a new user object
            adminUser.setNom("admin"); // Set the last name
            adminUser.setPrenom("admin"); // Set the first name
            adminUser.setEmail(adminEmail); // Set the email
            adminUser.setPasse(passwordEncoder.encode("admin")); // Hash the password before saving
            adminUser.setType(RoleType.SERVICE_ADMINISTRATIVE); // Assign the SERVICE_ADMINISTRATIVE role
            userRepository.save(adminUser); // Save the user to the database
            System.out.println("Service Administrative User created successfully."); // Log success message
        }
    }
}