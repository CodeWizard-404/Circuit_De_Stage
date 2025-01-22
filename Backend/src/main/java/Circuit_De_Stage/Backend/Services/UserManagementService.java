package Circuit_De_Stage.Backend.Services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import Circuit_De_Stage.Backend.Entities.User;
import Circuit_De_Stage.Backend.Repositories.UserRepository;

@Service
public class UserManagementService {

    @Autowired
    private UserRepository utilisateurRepository;
    
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;  


    public void createUser(User user) {
        user.setPasse(passwordEncoder.encode(user.getPasse()));
        utilisateurRepository.save(user);
    }


    public void updateUser(User user) {
        if (utilisateurRepository.existsById(user.getId())) {
            user.setPasse(passwordEncoder.encode(user.getPasse()));
            utilisateurRepository.save(user);
        } else {
            throw new RuntimeException("User with ID " + user.getId() + " not found.");
        }
    }


    public void deleteUser(int userId) {
        if (utilisateurRepository.existsById(userId)) {
            utilisateurRepository.deleteById(userId);
        } else {
            throw new RuntimeException("User with ID " + userId + " not found.");
        }
    }


    public List<User> listAllUsers() {
        return utilisateurRepository.findAll();
    }


    public User userInfo(int userId) {
        return utilisateurRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User with ID " + userId + " not found."));
    }
}
