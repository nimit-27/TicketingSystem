package com.ticketingSystem.api.service;

import com.ticketingSystem.api.dto.AuthenticatedUser;
import com.ticketingSystem.api.repository.RequesterUserRepository;
import com.ticketingSystem.api.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.bcrypt.BCrypt;

import java.util.Objects;
import java.util.Optional;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final RequesterUserRepository requesterUserRepository;

    public AuthService(UserRepository userRepository, RequesterUserRepository requesterUserRepository) {
        this.userRepository = userRepository;
        this.requesterUserRepository = requesterUserRepository;
    }

    public Optional<AuthenticatedUser> authenticate(String username, String password) {
        return authenticate(username, password, null);
    }

    public Optional<AuthenticatedUser> authenticate(String username, String password, String portal) {
        return findUser(portal, username)
                .filter(user -> passwordsMatch(user.getPassword(), password));
    }

    private boolean isBcryptHash(String str) {
        return str.startsWith("$2a$") || str.startsWith("$2b$") || str.startsWith("$2y$");
    }

    private boolean passwordsMatch(String stored, String provided) {
        if (stored == null) {
            return false;
        }
        if (isBcryptHash(stored)) {
            if (isBcryptHash(provided)) {
                return Objects.equals(stored, provided);
            }
            return BCrypt.checkpw(provided, stored);
        }
        return Objects.equals(stored, provided);
    }

    private Optional<AuthenticatedUser> findUser(String portal, String username) {
        if (isRequesterPortal(portal)) {
            return requesterUserRepository.findByUsername(username)
                    .map(AuthenticatedUser::fromRequesterUser);
        }
        return userRepository.findByUsername(username)
                .map(AuthenticatedUser::fromUser);
    }

    private boolean isRequesterPortal(String portal) {
        if (portal == null) {
            return false;
        }
        String normalized = portal.trim();
        return normalized.equalsIgnoreCase("requestor") || normalized.equalsIgnoreCase("requester");
    }
}
