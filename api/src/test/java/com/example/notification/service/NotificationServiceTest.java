package com.example.notification.service;

import com.example.notification.config.NotificationProperties;
import com.example.notification.enums.ChannelType;
import com.example.notification.models.NotificationMaster;
import com.example.notification.repository.NotificationMasterRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class NotificationServiceTest {

    private NotificationProperties properties;
    private Notifier notifier;
    private NotificationService notificationService;
    private NotificationMasterRepository notificationMasterRepository;

    @BeforeEach
    void setUp() {
        properties = new NotificationProperties();
        properties.setEnabled(true);
        properties.setSupportEmail("support@example.com");

        notifier = mock(Notifier.class);
        when(notifier.getChannel()).thenReturn(ChannelType.EMAIL);

        NotificationMaster notificationMaster = new NotificationMaster();
        notificationMaster.setCode("TICKET_CREATED");
        notificationMaster.setEmailTemplate("email/TicketCreated");

        notificationMasterRepository = mock(NotificationMasterRepository.class);
        when(notificationMasterRepository.findByCodeAndIsActiveTrue("TICKET_CREATED"))
                .thenReturn(Optional.of(notificationMaster));

        notificationService = new NotificationService(List.of(notifier), properties, notificationMasterRepository);
    }

    @Test
    void shouldIncludeSupportEmailWhenSendingNotification() throws Exception {
        Map<String, Object> dataModel = new HashMap<>();
        dataModel.put("key", "value");

        notificationService.sendNotification(ChannelType.EMAIL, "TICKET_CREATED", dataModel, "recipient@example.com");

        ArgumentCaptor<Map<String, Object>> modelCaptor = ArgumentCaptor.forClass(Map.class);
        verify(notifier).send("email/TicketCreated", modelCaptor.capture(), "recipient@example.com");

        Map<String, Object> capturedModel = modelCaptor.getValue();
        assertThat(capturedModel)
                .containsEntry("supportEmail", "support@example.com")
                .containsEntry("key", "value");
    }
}
