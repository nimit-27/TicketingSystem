package com.ticketingSystem.api.service;

import com.ticketingSystem.api.models.IssueType;
import com.ticketingSystem.api.repository.IssueTypeRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class IssueTypeServiceTest {

    @Mock
    private IssueTypeRepository repository;

    @InjectMocks
    private IssueTypeService service;

    @Test
    void getAllActiveShouldQueryWithExpectedActiveFlag() {
        when(repository.findByIsActive("1")).thenReturn(List.of(new IssueType()));

        assertThat(service.getAllActive()).hasSize(1);
    }

    @Test
    void isSlaEnabledForIssueTypeShouldReturnFalseForBlankId() {
        assertThat(service.isSlaEnabledForIssueType(" ")).isFalse();
        assertThat(service.isSlaEnabledForIssueType(null)).isFalse();
    }

    @Test
    void isSlaEnabledForIssueTypeShouldReturnFalseWhenTypeMissingOrFlagNull() {
        IssueType noFlag = new IssueType();
        noFlag.setSlaFlag(null);
        when(repository.findById("x")).thenReturn(Optional.of(noFlag));
        when(repository.findById("missing")).thenReturn(Optional.empty());

        assertThat(service.isSlaEnabledForIssueType("x")).isFalse();
        assertThat(service.isSlaEnabledForIssueType("missing")).isFalse();
    }

    @Test
    void isSlaEnabledForIssueTypeShouldReturnTrueWhenSlaFlagIsTrue() {
        IssueType issueType = new IssueType();
        issueType.setSlaFlag(true);
        when(repository.findById("i1")).thenReturn(Optional.of(issueType));

        assertThat(service.isSlaEnabledForIssueType("i1")).isTrue();
    }
}
