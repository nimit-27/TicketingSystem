package com.ticketingSystem.notification.service;

import com.ticketingSystem.api.models.GenericUser;
import com.ticketingSystem.api.models.RequesterUser;
import com.ticketingSystem.api.models.User;
import com.ticketingSystem.api.repository.RequesterUserRepository;
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
    private final RequesterUserRepository requesterUserRepository;

    public List<GenericUser> resolveRecipients(String recipientIdentifier) {
        if (recipientIdentifier == null || recipientIdentifier.isBlank()) {
            return List.of();
        }

        String[] parts = recipientIdentifier.split(",");
        Set<GenericUser> recipients = new LinkedHashSet<>();
        for (String part : parts) {
            String identifier = part == null ? "" : part.trim();
            if (identifier.isEmpty()) {
                continue;
            }
            resolveRecipient(identifier).ifPresent(recipients::add);
        }

        return List.copyOf(recipients);
    }

    public Optional<GenericUser> resolveRecipient(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            return Optional.empty();
        }

        Optional<User> byId = userRepository.findById(identifier);
        if (byId.isPresent()) {
            return byId.map(GenericUser.class::cast);
        }

        Optional<User> byUsername = userRepository.findByUsername(identifier);
        if (byUsername.isPresent()) {
            return byUsername.map(GenericUser.class::cast);
        }

        Optional<User> byEmail = userRepository.findByEmailId(identifier);
        if (byEmail.isPresent()) {
            return byEmail.map(GenericUser.class::cast);
        }

        Optional<RequesterUser> requesterById = requesterUserRepository.findById(identifier);
        if (requesterById.isPresent()) {
            return requesterById.map(GenericUser.class::cast);
        }

        Optional<RequesterUser> requesterByUsername = requesterUserRepository.findByUsername(identifier);
        if (requesterByUsername.isPresent()) {
            return requesterByUsername.map(GenericUser.class::cast);
        }

        return requesterUserRepository.findByEmailId(identifier)
                .map(GenericUser.class::cast);
    }
}
