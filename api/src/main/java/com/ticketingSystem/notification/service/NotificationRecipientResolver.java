package com.ticketingSystem.notification.service;

import com.ticketingSystem.api.models.GenericUser;
import com.ticketingSystem.api.repository.RequesterUserRepository;
import com.ticketingSystem.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class NotificationRecipientResolver {
    private final UserRepository userRepository;
    private final RequesterUserRepository requesterUserRepository;

    public Optional<GenericUser> resolveRecipient(String recipient) {
        if (recipient == null || recipient.isBlank()) {
            return Optional.empty();
        }

        String identifier = recipient.trim();
        return userRepository.findById(identifier)
                .map(GenericUser.class::cast)
                .or(() -> requesterUserRepository.findById(identifier).map(GenericUser.class::cast))
                .or(() -> userRepository.findByUsername(identifier).map(GenericUser.class::cast))
                .or(() -> requesterUserRepository.findByUsername(identifier).map(GenericUser.class::cast));
    }
}
