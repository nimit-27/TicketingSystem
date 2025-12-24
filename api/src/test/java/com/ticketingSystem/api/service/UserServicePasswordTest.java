package com.ticketingSystem.api.service;

import com.ticketingSystem.api.dto.ChangePasswordRequest;
import com.ticketingSystem.api.exception.RateLimitExceededException;
import com.ticketingSystem.api.models.RequesterUser;
import com.ticketingSystem.api.models.Stakeholder;
import com.ticketingSystem.api.models.StakeholderGroup;
import com.ticketingSystem.api.models.User;
import com.ticketingSystem.api.repository.LevelRepository;
import com.ticketingSystem.api.repository.RequesterUserRepository;
import com.ticketingSystem.api.repository.RoleRepository;
import com.ticketingSystem.api.repository.StakeholderRepository;
import com.ticketingSystem.api.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServicePasswordTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private StakeholderRepository stakeholderRepository;
    @Mock
    private RoleRepository roleRepository;
    @Mock
    private LevelRepository levelRepository;
    @Mock
    private RequesterUserRepository requesterUserRepository;

    private UserService userService;

    @BeforeEach
    void setUp() {
        userService = new UserService(userRepository, stakeholderRepository, roleRepository, levelRepository, requesterUserRepository);
    }

    @Test
    void changePasswordSucceedsWithValidInput() {
        User user = new User();
        user.setUserId("user-1");
        user.setUsername("demo");
        user.setPassword(BCrypt.hashpw("OldPass@1", BCrypt.gensalt()));

        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setOldPassword("OldPass@1");
        request.setNewPassword("NewPass@1!");

        userService.changePassword("user-1", request);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        User saved = captor.getValue();
        assertThat(BCrypt.checkpw("NewPass@1!", saved.getPassword())).isTrue();
        assertThat(BCrypt.checkpw("OldPass@1", saved.getPassword())).isFalse();
    }

    @Test
    void changePasswordRoutesToRequesterRepositoryWhenStakeholderGroupIsThree() {
        StakeholderGroup stakeholderGroup = new StakeholderGroup();
        stakeholderGroup.setId(3);

        Stakeholder stakeholder = new Stakeholder();
        stakeholder.setId(200);
        stakeholder.setStakeholderGroup(stakeholderGroup);

        RequesterUser requesterUser = new RequesterUser();
        requesterUser.setRequesterUserId("req-1");
        requesterUser.setUsername("demo-req");
        requesterUser.setStakeholder("200");
        requesterUser.setPassword(BCrypt.hashpw("OldPass@1", BCrypt.gensalt()));

        when(userRepository.findById("req-1")).thenReturn(Optional.empty());
        when(requesterUserRepository.findById("req-1")).thenReturn(Optional.of(requesterUser));
        when(stakeholderRepository.findAllById(any())).thenReturn(List.of(stakeholder));
        when(requesterUserRepository.save(any(RequesterUser.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setOldPassword("OldPass@1");
        request.setNewPassword("NewPass@1!");

        userService.changePassword("req-1", request);

        ArgumentCaptor<RequesterUser> captor = ArgumentCaptor.forClass(RequesterUser.class);
        verify(requesterUserRepository).save(captor.capture());
        verify(userRepository, never()).save(any());
        RequesterUser saved = captor.getValue();
        assertThat(BCrypt.checkpw("NewPass@1!", saved.getPassword())).isTrue();
        assertThat(BCrypt.checkpw("OldPass@1", saved.getPassword())).isFalse();
    }

    @Test
    void changePasswordRejectsIncorrectOldPassword() {
        User user = new User();
        user.setUserId("user-1");
        user.setUsername("demo");
        user.setPassword(BCrypt.hashpw("OldPass@1", BCrypt.gensalt()));

        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));

        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setOldPassword("WrongOld");
        request.setNewPassword("NewPass@1!");

        assertThatThrownBy(() -> userService.changePassword("user-1", request))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("incorrect");

        verify(userRepository, never()).save(any());
    }

    @Test
    void changePasswordRejectsWeakPassword() {
        User user = new User();
        user.setUserId("user-1");
        user.setUsername("demo");
        user.setPassword(BCrypt.hashpw("OldPass@1", BCrypt.gensalt()));

        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));

        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setOldPassword("OldPass@1");
        request.setNewPassword("short");

        assertThatThrownBy(() -> userService.changePassword("user-1", request))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("at least 8");

        verify(userRepository, never()).save(any());
    }

    @Test
    void changePasswordRateLimitsAfterRepeatedFailures() {
        User user = new User();
        user.setUserId("user-1");
        user.setUsername("demo");
        user.setPassword(BCrypt.hashpw("OldPass@1", BCrypt.gensalt()));

        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));

        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setOldPassword("wrong");
        request.setNewPassword("Another1!");

        int attempts = UserService.MAX_PASSWORD_ATTEMPTS;
        for (int i = 1; i <= attempts; i++) {
            if (i < attempts) {
                assertThatThrownBy(() -> userService.changePassword("user-1", request))
                        .isInstanceOf(ResponseStatusException.class);
            } else {
                assertThatThrownBy(() -> userService.changePassword("user-1", request))
                        .isInstanceOf(RateLimitExceededException.class);
            }
        }
        verify(userRepository, never()).save(any());
    }
}
