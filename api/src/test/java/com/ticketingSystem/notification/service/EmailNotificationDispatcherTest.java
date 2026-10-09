package com.ticketingSystem.notification.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketingSystem.notification.config.NotificationProperties;
import com.ticketingSystem.notification.enums.ChannelType;
import com.ticketingSystem.notification.repository.NotificationRecipientRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.task.TaskExecutor;
import org.springframework.dao.DataAccessResourceFailureException;

import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmailNotificationDispatcherTest {
    @Mock private NotificationRecipientRepository notificationRecipientRepository;
    @Mock private NotificationRecipientResolver recipientResolver;
    @Mock private EmailTemplateRenderer templateRenderer;
    @Mock private EmailMessageSender messageSender;
    @Mock private ObjectMapper objectMapper;
    @Mock private NotificationProperties properties;
    @Mock private NotificationRuntimeToggleService notificationRuntimeToggleService;
    @Mock private EmailNotificationDispatchTransactionService transactionService;
    @Mock private TaskExecutor emailNotificationExecutor;

    @InjectMocks private EmailNotificationDispatcher dispatcher;

    @Test
    void databaseFailureBacksOffSubsequentScheduledPolls() {
        when(notificationRuntimeToggleService.isChannelEnabled(ChannelType.EMAIL))
                .thenThrow(new DataAccessResourceFailureException("database unavailable"));

        dispatcher.dispatchPendingEmails();
        dispatcher.dispatchPendingEmails();

        verify(notificationRuntimeToggleService, times(1)).isChannelEnabled(ChannelType.EMAIL);
    }
}
