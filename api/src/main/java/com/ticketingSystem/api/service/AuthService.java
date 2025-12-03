package com.ticketingSystem.api.service;

import com.ticketingSystem.api.dto.AuthenticatedUser;
import com.ticketingSystem.api.repository.RequesterUserRepository;
import com.ticketingSystem.api.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.nio.charset.StandardCharsets;
import java.util.Objects;
import java.util.Optional;

@Service
public class AuthService {
    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private static final int BCRYPT_MAX_BYTES = 72;
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
        if (stored == null || provided == null) {
            return false;
        }
        if (isBcryptHash(stored)) {
            if (isBcryptHash(provided)) {
                return Objects.equals(stored, provided);
            }
            int providedLength = provided.getBytes(StandardCharsets.UTF_8).length;
            if (providedLength > BCRYPT_MAX_BYTES) {
                log.warn("Provided password exceeds bcrypt limit ({} bytes > {})", providedLength, BCRYPT_MAX_BYTES);
                return false;
            }
            try {
                return BCrypt.checkpw(provided, stored);
            } catch (IllegalArgumentException ex) {
                log.warn("BCrypt rejected password input: {}", ex.getMessage());
                return false;
            }
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
