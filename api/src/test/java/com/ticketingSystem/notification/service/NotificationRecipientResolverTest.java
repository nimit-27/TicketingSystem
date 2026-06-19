package com.ticketingSystem.notification.service;

import com.ticketingSystem.api.models.GenericUser;
import com.ticketingSystem.api.models.RequesterUser;
import com.ticketingSystem.api.models.User;
import com.ticketingSystem.api.repository.RequesterUserRepository;
import com.ticketingSystem.api.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NotificationRecipientResolverTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RequesterUserRepository requesterUserRepository;

    private NotificationRecipientResolver resolver;

    @BeforeEach
    void setUp() {
        resolver = new NotificationRecipientResolver(userRepository, requesterUserRepository);
    }

    @Test
    void resolvesRecipientByUserId() {
        User user = new User();
        user.setUserId("user-1");

        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));

        List<GenericUser> recipients = resolver.resolveRecipients("user-1");

        assertThat(recipients).containsExactly(user);
    }

    @Test
    void resolvesRecipientByUsername() {
        User user = new User();
        user.setUserId("user-2");
        user.setUsername("jane");

        when(userRepository.findById("jane")).thenReturn(Optional.empty());
        when(userRepository.findByUsername("jane")).thenReturn(Optional.of(user));

        List<GenericUser> recipients = resolver.resolveRecipients("jane");

        assertThat(recipients).containsExactly(user);
    }

    @Test
    void resolvesRecipientByEmail() {
        User user = new User();
        user.setUserId("user-3");
        user.setEmailId("jane@example.com");

        when(userRepository.findById("jane@example.com")).thenReturn(Optional.empty());
        when(userRepository.findByUsername("jane@example.com")).thenReturn(Optional.empty());
        when(userRepository.findByEmailId("jane@example.com")).thenReturn(Optional.of(user));

        List<GenericUser> recipients = resolver.resolveRecipients("jane@example.com");

        assertThat(recipients).containsExactly(user);
    }

    @Test
    void resolvesRequesterRecipientWhenNotFoundAsUser() {
        RequesterUser requester = new RequesterUser();
        requester.setRequesterUserId("requester-1");

        when(userRepository.findById("requester-1")).thenReturn(Optional.empty());
        when(userRepository.findByUsername("requester-1")).thenReturn(Optional.empty());
        when(userRepository.findByEmailId("requester-1")).thenReturn(Optional.empty());
        when(requesterUserRepository.findById("requester-1")).thenReturn(Optional.of(requester));

        List<GenericUser> recipients = resolver.resolveRecipients("requester-1");

        assertThat(recipients).containsExactly(requester);
    }

    @Test
    void resolvesMultipleRecipients() {
        User first = new User();
        first.setUserId("user-1");
        User second = new User();
        second.setUserId("user-2");

        when(userRepository.findById("user-1")).thenReturn(Optional.of(first));
        when(userRepository.findById("user-2")).thenReturn(Optional.of(second));

        List<GenericUser> recipients = resolver.resolveRecipients("user-1, user-2");

        assertThat(recipients).containsExactly(first, second);
    }
}
