package com.ticketingSystem.api.service;

import com.ticketingSystem.api.dto.LevelDto;
import com.ticketingSystem.api.dto.UserDto;
import com.ticketingSystem.api.models.Level;
import com.ticketingSystem.api.models.Stakeholder;
import com.ticketingSystem.api.models.User;
import com.ticketingSystem.api.models.UserLevel;
import com.ticketingSystem.api.repository.LevelRepository;
import com.ticketingSystem.api.repository.StakeholderRepository;
import com.ticketingSystem.api.repository.UserLevelRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LevelServiceTest {

    @Mock
    private LevelRepository levelRepository;
    @Mock
    private UserLevelRepository userLevelRepository;
    @Mock
    private StakeholderRepository stakeholderRepository;

    @InjectMocks
    private LevelService service;

    @Test
    void getAllLevelsShouldMapEntityFields() {
        Level level = new Level();
        level.setLevelId("L1");
        level.setLevelName("District");
        when(levelRepository.findAll()).thenReturn(List.of(level));

        List<LevelDto> result = service.getAllLevels();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getLevelId()).isEqualTo("L1");
        assertThat(result.get(0).getLevelName()).isEqualTo("District");
    }

    @Test
    void getUsersByLevelShouldReturnEmptyWhenNoAssignments() {
        when(userLevelRepository.findByLevelIdsContaining("L1")).thenReturn(List.of());

        assertThat(service.getUsersByLevel("L1")).isEmpty();
    }

    @Test
    void getUsersByLevelShouldResolveStakeholderDescriptionAndHandleInvalidStakeholderId() {
        User user = new User();
        user.setUserId("u1");
        user.setUsername("user");
        user.setStakeholder("12");

        Stakeholder stakeholder = new Stakeholder();
        stakeholder.setId(12);
        stakeholder.setDescription("Support Team");
        when(stakeholderRepository.findById(12)).thenReturn(Optional.of(stakeholder));

        UserLevel ul = new UserLevel();
        ul.setUser(user);

        User second = new User();
        second.setUserId("u2");
        second.setStakeholder("NOT_NUMERIC");
        UserLevel ul2 = new UserLevel();
        ul2.setUser(second);

        when(userLevelRepository.findByLevelIdsContaining("L1")).thenReturn(List.of(ul, ul2));

        Optional<Set<UserDto>> result = service.getUsersByLevel("L1");

        assertThat(result).isPresent();
        assertThat(result.get()).hasSize(2);
        assertThat(result.get()).anyMatch(dto -> "Support Team".equals(dto.getStakeholder()));
        assertThat(result.get()).anyMatch(dto -> "NOT_NUMERIC".equals(dto.getStakeholder()));
    }

    @Test
    void getLevelListByUserIdShouldHandleNullAndDelimitedValues() {
        when(userLevelRepository.findByUserId("missing")).thenReturn(null);

        assertThat(service.getLevelListByUserId("missing")).isEmpty();

        UserLevel userLevel = new UserLevel();
        userLevel.setLevelIds("L1|L2|L3");
        when(userLevelRepository.findByUserId("u1")).thenReturn(userLevel);

        assertThat(service.getLevelListByUserId("u1")).containsExactly("L1", "L2", "L3");
    }
}
