package com.ticketingSystem.api.service;

import com.ticketingSystem.api.dto.AuthenticatedUser;
import com.ticketingSystem.api.models.RequesterUser;
import com.ticketingSystem.api.models.User;
import com.ticketingSystem.api.repository.RequesterUserRepository;
import com.ticketingSystem.api.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCrypt;

import java.nio.charset.StandardCharsets;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private RequesterUserRepository requesterUserRepository;

    @InjectMocks
    private AuthService service;

    @Test
    void authenticateShouldUseUserRepositoryForInternalPortalAndValidateBcrypt() {
        User user = new User();
        user.setUsername("admin");
        user.setPassword(BCrypt.hashpw("secret", BCrypt.gensalt()));
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(user));

        Optional<AuthenticatedUser> result = service.authenticate("admin", "secret", "internal");

        assertThat(result).isPresent();
        verify(userRepository).findByUsername("admin");
        verifyNoInteractions(requesterUserRepository);
    }

    @Test
    void authenticateShouldRejectOverlongBcryptPasswordInput() {
        User user = new User();
        user.setPassword(BCrypt.hashpw("short", BCrypt.gensalt()));
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(user));

        String overlong = "é".repeat(40); // UTF-8 bytes > 72 and should fail safely.
        assertThat(overlong.getBytes(StandardCharsets.UTF_8).length).isGreaterThan(72);

        Optional<AuthenticatedUser> result = service.authenticate("admin", overlong, null);

        assertThat(result).isEmpty();
    }

    @Test
    void authenticateShouldSupportRequesterPortalAliases() {
        RequesterUser requester = new RequesterUser();
        requester.setUsername("req-user");
        requester.setPassword("plain-pass");
        when(requesterUserRepository.findByUsername("req-user")).thenReturn(Optional.of(requester));

        Optional<AuthenticatedUser> result = service.authenticate("req-user", "plain-pass", " requestor ");

        assertThat(result).isPresent();
        verify(requesterUserRepository).findByUsername("req-user");
        verifyNoInteractions(userRepository);
    }

    @Test
    void authenticateShouldAllowHashToHashComparisonForMigratedData() {
        String hash = BCrypt.hashpw("secret", BCrypt.gensalt());
        User user = new User();
        user.setPassword(hash);
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(user));

        Optional<AuthenticatedUser> result = service.authenticate("admin", hash, null);

        assertThat(result).isPresent();
    }

    @Test
    void findUserByUsernameShouldReturnEmptyWhenMissing() {
        when(userRepository.findByUsername("ghost")).thenReturn(Optional.empty());

        assertThat(service.findUserByUsername("ghost", null)).isEmpty();
    }
}
