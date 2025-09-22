package com.example.notification.service;

import com.example.notification.config.NotificationProperties;
import com.example.notification.enums.ChannelType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class NotificationServiceTest {

    private NotificationProperties properties;
    private Notifier notifier;
    private NotificationService notificationService;

    @BeforeEach
    void setUp() {
        properties = new NotificationProperties();
        properties.setEnabled(true);
        properties.setSupportEmail("support@example.com");

        notifier = mock(Notifier.class);
        when(notifier.getChannel()).thenReturn(ChannelType.EMAIL);
        when(notifier.getTemplateFolder()).thenReturn(null);

        notificationService = new NotificationService(List.of(notifier), properties);
    }

    @Test
    void shouldIncludeSupportEmailWhenSendingNotification() throws Exception {
        Map<String, Object> dataModel = new HashMap<>();
        dataModel.put("key", "value");

        notificationService.sendNotification(ChannelType.EMAIL, "template", dataModel, "recipient@example.com");

        ArgumentCaptor<Map<String, Object>> modelCaptor = ArgumentCaptor.forClass(Map.class);
        verify(notifier).send("template", modelCaptor.capture(), "recipient@example.com");

        Map<String, Object> capturedModel = modelCaptor.getValue();
        assertThat(capturedModel)
                .containsEntry("supportEmail", "support@example.com")
                .containsEntry("key", "value");
    }
}
