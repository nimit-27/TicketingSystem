package com.ticketingSystem.notification.service;

import com.ticketingSystem.api.models.User;
import com.ticketingSystem.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class NotificationRecipientResolver {

    private final UserRepository userRepository;

    public List<User> resolveRecipients(String recipientIdentifier) {
        if (recipientIdentifier == null || recipientIdentifier.isBlank()) {
            return List.of();
        }

        String[] parts = recipientIdentifier.split(",");
        Set<User> recipients = new LinkedHashSet<>();
        for (String part : parts) {
            String identifier = part == null ? "" : part.trim();
            if (identifier.isEmpty()) {
                continue;
            }
            resolveRecipient(identifier).ifPresent(recipients::add);
        }

        return List.copyOf(recipients);
    }

    public Optional<User> resolveRecipient(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            return Optional.empty();
        }

        Optional<User> byId = userRepository.findById(identifier);
        if (byId.isPresent()) {
            return byId;
        }

        Optional<User> byUsername = userRepository.findByUsername(identifier);
        if (byUsername.isPresent()) {
            return byUsername;
        }

        return userRepository.findByEmailId(identifier);
    }
}
