package com.ticketingSystem.api.service;

import com.ticketingSystem.api.models.User;
import com.ticketingSystem.api.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.bcrypt.BCrypt;

import java.util.Objects;
import java.util.Optional;

@Service
public class AuthService {
    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Optional<User> authenticate(String username, String password) {
        return userRepository.findByUsername(username)
                .filter(emp -> {
                    String stored = emp.getPassword();
                    if (stored == null) {
                        return false;
                    }
                    if (isBcryptHash(stored)) {
                        if (isBcryptHash(password)) {
                            return Objects.equals(stored, password);
                        }
                        return BCrypt.checkpw(password, stored);
                    }
                    return Objects.equals(stored, password);
                });
    }

    private boolean isBcryptHash(String str) {
        return str.startsWith("$2a$") || str.startsWith("$2b$") || str.startsWith("$2y$");
    }
}
