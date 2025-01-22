package Circuit_De_Stage.Backend.Controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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

@RestController
@RequestMapping("/api/users")
public class UserController {

 @Autowired
 private UserManagementService userManagementService;

 @PostMapping
 @PreAuthorize("hasRole('SERVICE_ADMINISTRATIVE')")
 public ResponseEntity<User> createUser(@RequestBody User user) {
     userManagementService.createUser(user);
     return ResponseEntity.status(HttpStatus.CREATED).body(user);
 }

 @PutMapping("/{id}")
 @PreAuthorize("hasRole('SERVICE_ADMINISTRATIVE')")
 public ResponseEntity<User> updateUser(@PathVariable int id, @RequestBody User user) {
     user.setId(id);
     userManagementService.updateUser(user);
     return ResponseEntity.ok(user);
 }

 @DeleteMapping("/{id}")
 @PreAuthorize("hasRole('SERVICE_ADMINISTRATIVE')")
 public ResponseEntity<Void> deleteUser(@PathVariable int id) {
     userManagementService.deleteUser(id);
     return ResponseEntity.noContent().build();
 }

 @GetMapping
 @PreAuthorize("hasRole('SERVICE_ADMINISTRATIVE')")
 public ResponseEntity<List<User>> getAllUsers() {
     return ResponseEntity.ok(userManagementService.listAllUsers());
 }

 @GetMapping("/{id}")
 @PreAuthorize("hasRole('SERVICE_ADMINISTRATIVE')")
 public ResponseEntity<User> getUser(@PathVariable int id) {
     return ResponseEntity.ok(userManagementService.userInfo(id));
 }
}