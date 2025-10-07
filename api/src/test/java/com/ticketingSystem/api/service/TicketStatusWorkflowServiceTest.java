package com.ticketingSystem.api.service;

import com.ticketingSystem.api.models.Role;
import com.ticketingSystem.api.models.Status;
import com.ticketingSystem.api.models.TicketStatusWorkflow;
import com.ticketingSystem.api.repository.RoleRepository;
import com.ticketingSystem.api.repository.StatusMasterRepository;
import com.ticketingSystem.api.repository.TicketStatusWorkflowRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TicketStatusWorkflowServiceTest {

    @Mock
    private TicketStatusWorkflowRepository workflowRepository;
    @Mock
    private StatusMasterRepository statusMasterRepository;
    @Mock
    private RoleRepository roleRepository;

    private TicketStatusWorkflowService service;

    @BeforeEach
    void setUp() {
        service = new TicketStatusWorkflowService(workflowRepository, statusMasterRepository, roleRepository);
    }

    @Test
    void shouldReturnCurrentAndNextStatuses() {
        TicketStatusWorkflow current = new TicketStatusWorkflow();
        current.setId(1);
        current.setCurrentStatus(1);

        TicketStatusWorkflow next = new TicketStatusWorkflow();
        next.setId(2);
        next.setCurrentStatus(1);

        when(workflowRepository.findById(1)).thenReturn(Optional.of(current));
        when(workflowRepository.findByCurrentStatus(1)).thenReturn(List.of(next));

        List<TicketStatusWorkflow> result = service.getNextStatusesByCurrentStatus("1");

        assertThat(result).containsExactly(current, next);
    }

    @Test
    void shouldGroupMappingsByRolePermissions() {
        Role role = new Role();
        role.setAllowedStatusActionIds("1| 2 |abc| ");
        when(roleRepository.findAllById(List.of(7))).thenReturn(List.of(role));

        TicketStatusWorkflow first = new TicketStatusWorkflow();
        first.setId(1);
        first.setCurrentStatus(200);
        TicketStatusWorkflow second = new TicketStatusWorkflow();
        second.setId(2);
        second.setCurrentStatus(200);

        when(workflowRepository.findAllById(Set.of(1, 2))).thenReturn(List.of(first, second));

        Map<String, List<TicketStatusWorkflow>> result = service.getMappingsByRoles(List.of(7));

        assertThat(result).containsOnlyKeys("200");
        assertThat(result.get("200")).containsExactlyInAnyOrder(first, second);
    }

    @Test
    void shouldReturnEmptyMappingsWhenRolesMissing() {
        Map<String, List<TicketStatusWorkflow>> result = service.getMappingsByRoles(null);

        assertThat(result).isEmpty();
        result = service.getMappingsByRoles(List.of());
        assertThat(result).isEmpty();
    }

    @Test
    void shouldReturnDistinctStatusIdsForRoles() {
        Role role = new Role();
        role.setAllowedStatusActionIds("1|2|2|invalid");
        when(roleRepository.findAllById(List.of(3))).thenReturn(List.of(role));

        TicketStatusWorkflow workflowWithStatus = new TicketStatusWorkflow();
        workflowWithStatus.setId(1);
        workflowWithStatus.setCurrentStatus(900);
        TicketStatusWorkflow workflowWithoutStatus = new TicketStatusWorkflow();
        workflowWithoutStatus.setId(2);
        workflowWithoutStatus.setCurrentStatus(null);

        when(workflowRepository.findAllById(Set.of(1, 2))).thenReturn(List.of(workflowWithStatus, workflowWithoutStatus));

        List<String> result = service.getAllowedStatusIdListByRoles(List.of(3));

        assertThat(result).containsExactly("900");
    }

    @Test
    void shouldResolveStatusDetailsFromRepository() {
        Status status = new Status();
        status.setStatusId("status-id");
        status.setStatusCode("CODE");
        status.setSlaFlag(true);

        when(statusMasterRepository.findByStatusCode("CODE")).thenReturn(status);
        when(statusMasterRepository.findById("status-id")).thenReturn(Optional.of(status));

        assertThat(service.getStatusIdByCode("CODE")).isEqualTo("status-id");
        assertThat(service.getSlaFlagByStatusId("status-id")).isTrue();
        assertThat(service.getStatusCodeById("status-id")).isEqualTo("CODE");
    }

    @Test
    void shouldHandleMissingStatusDataGracefully() {
        when(statusMasterRepository.findByStatusCode("UNKNOWN")).thenReturn(null);
        when(statusMasterRepository.findById("missing")).thenReturn(Optional.empty());

        assertThat(service.getStatusIdByCode("UNKNOWN")).isNull();
        assertThat(service.getSlaFlagByStatusId("missing")).isFalse();
        assertThat(service.getStatusCodeById("missing")).isNull();
    }
}
