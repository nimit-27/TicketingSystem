package com.ticketingSystem.notification.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketingSystem.api.models.User;
import com.ticketingSystem.notification.enums.ChannelType;
import com.ticketingSystem.notification.models.Notification;
import com.ticketingSystem.notification.models.NotificationMaster;
import com.ticketingSystem.notification.models.NotificationRecipient;
import com.ticketingSystem.notification.repository.NotificationRecipientRepository;
import com.ticketingSystem.notification.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NotificationPersistenceServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private NotificationRecipientRepository notificationRecipientRepository;

    @Mock
    private NotificationRecipientResolver recipientResolver;

    private NotificationPersistenceService persistenceService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        persistenceService = new NotificationPersistenceService(
                notificationRepository,
                notificationRecipientRepository,
                recipientResolver,
                new InAppNotificationPayloadFactory(),
                objectMapper
        );

        when(notificationRepository.save(any(Notification.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void persistsAssignmentNotificationRecipients() throws Exception {
        NotificationMaster master = buildMaster(
                "TICKET_ASSIGNED",
                "Ticket assigned to ${assigneeName}",
                "Ticket ${ticketId} assigned by ${assignedBy}"
        );

        Map<String, Object> data = new HashMap<>();
        data.put("ticketId", "T-100");
        data.put("assigneeName", "Alex");
        data.put("assignedBy", "System");

        User recipient = new User();
        recipient.setUserId("user-1");
        when(recipientResolver.resolveRecipients("user-1")).thenReturn(List.of(recipient));

        NotificationRequest request = new NotificationRequest(
                ChannelType.IN_APP,
                master,
                "user-1",
                null,
                data
        );

        persistenceService.persistInAppNotification(request);

        Notification notification = captureNotification();
        assertThat(notification.getTitle()).isEqualTo("Ticket assigned to Alex");
        assertThat(notification.getMessage()).isEqualTo("Ticket T-100 assigned by System");
        assertThat(notification.getTicketId()).isEqualTo("T-100");

        Map<String, Object> persistedData = objectMapper.readValue(notification.getData(), Map.class);
        assertThat(persistedData)
                .containsEntry("ticketId", "T-100")
                .containsEntry("assigneeName", "Alex")
                .containsEntry("assignedBy", "System")
                .containsEntry("redirectUrl", "/tickets/T-100");

        List<NotificationRecipient> recipients = captureRecipients();
        assertThat(recipients).hasSize(1);
        assertThat(recipients.get(0).getRecipient()).isEqualTo(recipient);
        assertThat(recipients.get(0).getNotification()).isEqualTo(notification);
    }

    @Test
    void persistsStatusUpdateNotificationRecipients() throws Exception {
        NotificationMaster master = buildMaster(
                "TICKET_STATUS_UPDATE",
                "Status updated for ${ticketNumber}",
                "Status changed to ${newStatus}"
        );

        Map<String, Object> data = new HashMap<>();
        data.put("ticketId", "T-200");
        data.put("ticketNumber", "T-200");
        data.put("newStatus", "Closed");

        User recipient = new User();
        recipient.setUserId("user-2");
        when(recipientResolver.resolveRecipients("user-2")).thenReturn(List.of(recipient));

        NotificationRequest request = new NotificationRequest(
                ChannelType.IN_APP,
                master,
                "user-2",
                null,
                data
        );

        persistenceService.persistInAppNotification(request);

        Notification notification = captureNotification();
        assertThat(notification.getTitle()).isEqualTo("Status updated for T-200");
        assertThat(notification.getMessage()).isEqualTo("Status changed to Closed");
        assertThat(notification.getTicketId()).isEqualTo("T-200");

        Map<String, Object> persistedData = objectMapper.readValue(notification.getData(), Map.class);
        assertThat(persistedData)
                .containsEntry("ticketNumber", "T-200")
                .containsEntry("newStatus", "Closed")
                .containsEntry("redirectUrl", "/tickets/T-200");

        assertThat(captureRecipients()).hasSize(1);
    }

    @Test
    void persistsUpdateNotificationRecipients() throws Exception {
        NotificationMaster master = buildMaster(
                "TICKET_UPDATED",
                "Ticket updated",
                "Update: ${updateMessage}"
        );

        Map<String, Object> data = new HashMap<>();
        data.put("ticketId", "T-300");
        data.put("updateMessage", "Assignment updated");

        User recipient = new User();
        recipient.setUserId("user-3");
        when(recipientResolver.resolveRecipients("user-3")).thenReturn(List.of(recipient));

        NotificationRequest request = new NotificationRequest(
                ChannelType.IN_APP,
                master,
                "user-3",
                null,
                data
        );

        persistenceService.persistInAppNotification(request);

        Notification notification = captureNotification();
        assertThat(notification.getTitle()).isEqualTo("Ticket updated");
        assertThat(notification.getMessage()).isEqualTo("Update: Assignment updated");
        assertThat(notification.getTicketId()).isEqualTo("T-300");

        Map<String, Object> persistedData = objectMapper.readValue(notification.getData(), Map.class);
        assertThat(persistedData)
                .containsEntry("updateMessage", "Assignment updated")
                .containsEntry("redirectUrl", "/tickets/T-300");

        assertThat(captureRecipients()).hasSize(1);
    }

    private NotificationMaster buildMaster(String code, String titleTemplate, String messageTemplate) {
        NotificationMaster master = new NotificationMaster();
        master.setCode(code);
        master.setName(code);
        master.setDescription(code + " description");
        master.setDefaultTitleTpl(titleTemplate);
        master.setDefaultMessageTpl(messageTemplate);
        return master;
    }

    private Notification captureNotification() {
        ArgumentCaptor<Notification> notificationCaptor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(notificationCaptor.capture());
        return notificationCaptor.getValue();
    }

    private List<NotificationRecipient> captureRecipients() {
        ArgumentCaptor<List<NotificationRecipient>> recipientCaptor = ArgumentCaptor.forClass(List.class);
        verify(notificationRecipientRepository).saveAll(recipientCaptor.capture());
        return recipientCaptor.getValue();
    }
}
