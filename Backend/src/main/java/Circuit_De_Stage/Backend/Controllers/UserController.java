package Circuit_De_Stage.Backend.Controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import Circuit_De_Stage.Backend.Entities.User;
import Circuit_De_Stage.Backend.Services.UserManagementService;

@RestController // Marks this class as a REST controller
@RequestMapping("/api/users") // Base URL path for all endpoints in this controller
@PreAuthorize("hasRole('SERVICE_ADMINISTRATIVE')") // Restricts access to users with the 'SERVICE_ADMINISTRATIVE' role
@CrossOrigin // Enables CORS for all endpoints in this controller
public class UserController {

    private final UserManagementService userManagementService; // Service for managing users

    // Constructor-based dependency injection
    public UserController(UserManagementService userManagementService) {
        this.userManagementService = userManagementService;
    }

    /**
     * Creates a new user.
     * Accepts a JSON payload containing user details.
     */
    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        userManagementService.createUser(user); // Create the user using the service
        return ResponseEntity.status(HttpStatus.CREATED).body(user); // Return the created user with a 201 CREATED status
    }

    /**
     * Updates an existing user by their ID.
     * Accepts a JSON payload containing updated user details.
     */
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(
            @PathVariable("id") int id, // Path variable for the user's ID
            @RequestBody User user) { // JSON payload containing updated user details
        user.setId(id); // Set the ID of the user to ensure it matches the path variable
        userManagementService.updateUser(user); // Update the user using the service
        return ResponseEntity.ok(user); // Return the updated user with a 200 OK status
    }

    /**
     * Deletes a user by their ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable("id") int id) {
        userManagementService.deleteUser(id); // Delete the user using the service
        return ResponseEntity.noContent().build(); // Return a 204 NO CONTENT status
    }

    /**
     * Retrieves a list of all users.
     */
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userManagementService.listAllUsers()); // Return the list of users with a 200 OK status
    }

    /**
     * Retrieves a user by their ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable("id") int id) {
        return ResponseEntity.ok(userManagementService.userInfo(id)); // Return the user details with a 200 OK status
    }
}