package com.ticketingSystem.notification.service;

import com.ticketingSystem.api.models.User;
import com.ticketingSystem.api.models.RequesterUser;
import com.ticketingSystem.notification.config.NotificationProperties;
import com.ticketingSystem.notification.enums.ChannelType;
import com.ticketingSystem.notification.models.NotificationMaster;
import com.ticketingSystem.notification.repository.NotificationMasterRepository;
import com.ticketingSystem.notification.repository.RoleNotificationChannelMappingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class NotificationServiceTest {

    private NotificationProperties properties;
    private Notifier notifier;
    private NotificationService notificationService;
    private NotificationRuntimeToggleService notificationRuntimeToggleService;
    private NotificationMasterRepository notificationMasterRepository;
    private RoleNotificationChannelMappingRepository roleNotificationChannelMappingRepository;

    @BeforeEach
    void setUp() {
        properties = new NotificationProperties();
        properties.setEnabled(true);
        properties.setSupportEmail("support@ticketingSystem.com");

        notifier = mock(Notifier.class);
        when(notifier.getChannel()).thenReturn(ChannelType.EMAIL);

        NotificationMaster notificationMaster = new NotificationMaster();
        notificationMaster.setCode("TICKET_CREATED");
        notificationMaster.setEmailTemplate("email/TicketCreated");

        notificationMasterRepository = mock(NotificationMasterRepository.class);
        when(notificationMasterRepository.findByCodeAndIsActiveTrue("TICKET_CREATED"))
                .thenReturn(Optional.of(notificationMaster));

        notificationRuntimeToggleService = mock(NotificationRuntimeToggleService.class);
        when(notificationRuntimeToggleService.isNotificationEnabled()).thenReturn(true);

        roleNotificationChannelMappingRepository = mock(RoleNotificationChannelMappingRepository.class);

        notificationService = new NotificationService(List.of(notifier), properties, notificationRuntimeToggleService, notificationMasterRepository, roleNotificationChannelMappingRepository);
    }

    @Test
    void shouldIncludeSupportEmailWhenSendingNotification() throws Exception {
        Map<String, Object> dataModel = new HashMap<>();
        dataModel.put("key", "value");

        notificationService.sendNotification(ChannelType.EMAIL, "TICKET_CREATED", dataModel, "recipient@ticketingSystem.com");

        ArgumentCaptor<NotificationRequest> requestCaptor = ArgumentCaptor.forClass(NotificationRequest.class);
        verify(notifier).send(requestCaptor.capture());

        NotificationRequest capturedRequest = requestCaptor.getValue();
        assertThat(capturedRequest.getTemplateName()).isEqualTo("email/TicketCreated");

        Map<String, Object> capturedModel = capturedRequest.getDataModel();
        assertThat(capturedModel)
                .containsEntry("supportEmail", "support@ticketingSystem.com")
                .containsEntry("key", "value");
    }

    @Test
    void shouldSendRoleAwareNotificationWhenRoleChannelMappingExists() throws Exception {
        NotificationMaster notificationMaster = new NotificationMaster();
        notificationMaster.setId(1);
        notificationMaster.setCode("TICKET_CREATED");
        notificationMaster.setEmailTemplate("email/TicketCreated");
        when(notificationMasterRepository.findByCodeAndIsActiveTrue("TICKET_CREATED"))
                .thenReturn(Optional.of(notificationMaster));
        when(roleNotificationChannelMappingRepository.findActiveChannelsForRoles(anyCollection(), eq(1)))
                .thenReturn(List.of(ChannelType.EMAIL));

        User recipientUser = new User();
        recipientUser.setUserId("user-1");
        recipientUser.setUsername("user.one");
        recipientUser.setEmailId("recipient@ticketingSystem.com");
        recipientUser.setRoles("3");

        notificationService.sendNotificationForUser("TICKET_CREATED", Map.of("key", "value"), recipientUser);

        ArgumentCaptor<NotificationRequest> requestCaptor = ArgumentCaptor.forClass(NotificationRequest.class);
        verify(notifier).send(requestCaptor.capture());
        NotificationRequest capturedRequest = requestCaptor.getValue();
        assertThat(capturedRequest.getRecipient()).isEqualTo("user-1");
        assertThat(capturedRequest.getChannel()).isEqualTo(ChannelType.EMAIL);
        assertThat(capturedRequest.getTemplateName()).isEqualTo("email/TicketCreated");
    }

    @Test
    void shouldSendRoleAwareNotificationForRequesterUserWhenRoleChannelMappingExists() throws Exception {
        NotificationMaster notificationMaster = new NotificationMaster();
        notificationMaster.setId(1);
        notificationMaster.setCode("TICKET_CREATED");
        notificationMaster.setEmailTemplate("email/TicketCreated");
        when(notificationMasterRepository.findByCodeAndIsActiveTrue("TICKET_CREATED"))
                .thenReturn(Optional.of(notificationMaster));
        when(roleNotificationChannelMappingRepository.findActiveChannelsForRoles(anyCollection(), eq(1)))
                .thenReturn(List.of(ChannelType.EMAIL));

        RequesterUser requesterUser = new RequesterUser();
        requesterUser.setRequesterUserId("requester-1");
        requesterUser.setUsername("requester.one");
        requesterUser.setEmailId("requester@ticketingSystem.com");
        requesterUser.setRoles("3");

        notificationService.sendNotificationForUser("TICKET_CREATED", Map.of("key", "value"), requesterUser);

        ArgumentCaptor<NotificationRequest> requestCaptor = ArgumentCaptor.forClass(NotificationRequest.class);
        verify(notifier).send(requestCaptor.capture());
        NotificationRequest capturedRequest = requestCaptor.getValue();
        assertThat(capturedRequest.getRecipient()).isEqualTo("requester-1");
        assertThat(capturedRequest.getChannel()).isEqualTo(ChannelType.EMAIL);
    }

    @Test
    void shouldSkipRoleAwareNotificationWhenMappingIsAbsent() throws Exception {
        NotificationMaster notificationMaster = new NotificationMaster();
        notificationMaster.setId(1);
        notificationMaster.setCode("TICKET_CREATED");
        when(notificationMasterRepository.findByCodeAndIsActiveTrue("TICKET_CREATED"))
                .thenReturn(Optional.of(notificationMaster));
        when(roleNotificationChannelMappingRepository.findActiveChannelsForRoles(anyCollection(), eq(1)))
                .thenReturn(List.of());

        User recipientUser = new User();
        recipientUser.setUserId("user-1");
        recipientUser.setRoles("3");

        notificationService.sendNotificationForUser("TICKET_CREATED", Map.of("key", "value"), recipientUser);

        verify(notifier, never()).send(org.mockito.ArgumentMatchers.any(NotificationRequest.class));
    }

}
