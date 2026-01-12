package com.ticketingSystem.notification.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketingSystem.api.dto.NotificationPageResponse;
import com.ticketingSystem.api.dto.UserNotificationDto;
import com.ticketingSystem.notification.models.Notification;
import com.ticketingSystem.notification.models.NotificationMaster;
import com.ticketingSystem.notification.models.NotificationRecipient;
import com.ticketingSystem.notification.repository.NotificationRecipientRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NotificationQueryServiceTest {

    @Mock
    private NotificationRecipientRepository notificationRecipientRepository;

    private NotificationQueryService notificationQueryService;

    @BeforeEach
    void setUp() {
        notificationQueryService = new NotificationQueryService(notificationRecipientRepository, new ObjectMapper());
    }

    @Test
    void returnsPersistedNotificationsForUser() {
        NotificationMaster master = new NotificationMaster();
        master.setCode("TICKET_ASSIGNED");

        Notification notification = new Notification();
        notification.setId(10L);
        notification.setType(master);
        notification.setTitle("Ticket assigned");
        notification.setMessage("Ticket T-1 assigned");
        notification.setData("{\"ticketId\":\"T-1\"}");
        notification.setTicketId("T-1");
        notification.setCreatedAt(LocalDateTime.of(2024, 1, 1, 10, 0));

        NotificationRecipient recipient = new NotificationRecipient();
        recipient.setId(99L);
        recipient.setNotification(notification);

        when(notificationRecipientRepository.findInbox(eq("user-1"), eq(true), isNull(), any()))
                .thenReturn(new PageImpl<>(List.of(recipient), PageRequest.of(0, 7), 1));

        NotificationPageResponse response = notificationQueryService.getNotificationsForUser("user-1", 0, 7);

        assertThat(response.items()).hasSize(1);
        UserNotificationDto dto = response.items().get(0);
        assertThat(dto.code()).isEqualTo("TICKET_ASSIGNED");
        assertThat(dto.title()).isEqualTo("Ticket assigned");
        assertThat(dto.message()).isEqualTo("Ticket T-1 assigned");
        assertThat(dto.ticketId()).isEqualTo("T-1");
        assertThat(dto.redirectUrl()).isEqualTo("/tickets/T-1");
        assertThat(dto.data()).isEqualTo(Map.of("ticketId", "T-1"));
    }
}
