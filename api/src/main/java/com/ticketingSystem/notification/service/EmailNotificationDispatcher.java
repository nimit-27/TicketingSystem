package com.ticketingSystem.notification.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketingSystem.api.models.User;
import com.ticketingSystem.notification.config.NotificationProperties;
import com.ticketingSystem.notification.enums.NotificationDeliveryStatus;
import com.ticketingSystem.notification.models.Notification;
import com.ticketingSystem.notification.models.NotificationMaster;
import com.ticketingSystem.notification.models.NotificationRecipient;
import com.ticketingSystem.notification.repository.NotificationRecipientRepository;
import freemarker.template.TemplateException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.task.TaskExecutor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.Executor;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmailNotificationDispatcher {
    private static final Logger log = LoggerFactory.getLogger(EmailNotificationDispatcher.class);

    private final NotificationRecipientRepository notificationRecipientRepository;
    private final EmailTemplateRenderer templateRenderer;
    private final EmailMessageSender messageSender;
    private final ObjectMapper objectMapper;
    private final NotificationProperties properties;
    @Qualifier("emailNotificationExecutor")
    private final TaskExecutor emailNotificationExecutor;

    @Scheduled(
            fixedDelayString = "${notification.email-dispatcher.fixedDelayMs:5000}",
            initialDelayString = "${notification.email-dispatcher.initialDelayMs:5000}"
    )
    public void dispatchPendingEmails() {
        if (!properties.isEnabled()) {
            return;
        }
        NotificationProperties.EmailDispatcher emailSettings = properties.getEmailDispatcher();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime staleBefore = now.minusMinutes(emailSettings.getProcessingTimeoutMinutes());

        recoverStuckProcessing(staleBefore, now);
        expireRetries(emailSettings.getMaxRetries());

        List<Long> claimedIds = claimBatch(emailSettings.getBatchSize(), now, staleBefore);
        if (claimedIds.isEmpty()) {
            return;
        }

        List<NotificationRecipient> recipients = notificationRecipientRepository.findByIdInWithNotification(claimedIds);
        if (recipients.isEmpty()) {
            return;
        }

        Map<Long, List<NotificationRecipient>> grouped = recipients.stream()
                .collect(Collectors.groupingBy(recipient -> recipient.getNotification().getId()));

        SimpleRateLimiter rateLimiter = new SimpleRateLimiter(emailSettings.getRateLimitPerSecond());
        QueueProcessingResult processingResult = new QueueProcessingResult();

        grouped.forEach((notificationId, group) -> dispatchGroup(notificationId, group, rateLimiter, processingResult));

        updateStatuses(processingResult, now);
    }

    private void dispatchGroup(Long notificationId,
                               List<NotificationRecipient> recipients,
                               SimpleRateLimiter rateLimiter,
                               QueueProcessingResult processingResult) {
        if (recipients == null || recipients.isEmpty()) {
            return;
        }
        Notification notification = recipients.get(0).getNotification();
        NotificationMaster master = notification.getType();
        String templateName = master != null ? master.getEmailTemplate() : null;
        if (templateName == null || templateName.isBlank()) {
            markGroupFailed(recipients, "Missing email template for notification " + notificationId, true, processingResult);
            return;
        }

        Map<String, Object> baseModel = buildBaseModel(notification);
        boolean personalized = master != null && Boolean.TRUE.equals(master.getEmailPersonalized());
        EmailContent cached = null;

        if (!personalized) {
            try {
                cached = templateRenderer.render(templateName, baseModel);
            } catch (IOException | TemplateException ex) {
                markGroupFailed(recipients, "Template rendering failed: " + ex.getMessage(), true, processingResult);
                return;
            }
        }

        List<CompletableFuture<Void>> futures = new ArrayList<>();
        for (NotificationRecipient recipient : recipients) {
            EmailContent emailContent = cached;
            Map<String, Object> model = baseModel;
            if (personalized) {
                model = new HashMap<>(baseModel);
                enrichRecipientModel(model, recipient);
                try {
                    emailContent = templateRenderer.render(templateName, model);
                } catch (IOException | TemplateException ex) {
                    markRecipientFailed(recipient, "Template rendering failed: " + ex.getMessage(), true, processingResult);
                    continue;
                }
            }

            EmailContent contentToSend = emailContent != null ? emailContent : new EmailContent(null, "");
            futures.add(CompletableFuture.runAsync(() -> {
                rateLimiter.acquire();
                sendEmail(recipient, notification, contentToSend, processingResult);
            }, unwrapExecutor(emailNotificationExecutor)));
        }

        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
    }

    private void sendEmail(NotificationRecipient recipient,
                           Notification notification,
                           EmailContent content,
                           QueueProcessingResult processingResult) {
        String to = resolveRecipientEmail(recipient.getRecipient());
        if (to == null || to.isBlank()) {
            markRecipientFailed(recipient, "Missing recipient email", true, processingResult);
            return;
        }
        String subject = content.subject();
        if (subject == null || subject.isBlank()) {
            subject = notification != null ? notification.getTitle() : "Notification";
        }
        String body = content.body();
        try {
            messageSender.send(new EmailMessageSender.EmailMessage(
                    to,
                    subject,
                    body,
                    splitEmails(recipient.getEmailCc()),
                    splitEmails(recipient.getEmailBcc())
            ));
            markRecipientSent(recipient, processingResult);
            log.info("email.dispatch.sent recipientId={} notificationId={} to={}",
                    recipient.getId(), notification.getId(), to);
        } catch (Exception ex) {
            boolean permanent = isPermanentFailure(ex);
            markRecipientFailed(recipient, ex.getMessage(), permanent, processingResult);
            log.warn("email.dispatch.failed recipientId={} notificationId={} to={} permanent={}",
                    recipient.getId(), notification.getId(), to, permanent, ex);
        }
    }

    private Map<String, Object> buildBaseModel(Notification notification) {
        Map<String, Object> model = parseData(notification != null ? notification.getData() : null);
        if (properties.getSupportEmail() != null && !model.containsKey("supportEmail")) {
            model.put("supportEmail", properties.getSupportEmail());
        }
        if (notification != null && notification.getTicketId() != null && !model.containsKey("ticketId")) {
            model.put("ticketId", notification.getTicketId());
        }
        return model;
    }

    private void enrichRecipientModel(Map<String, Object> model, NotificationRecipient recipient) {
        User user = recipient.getRecipient();
        if (user == null) {
            return;
        }
        String name = Optional.ofNullable(user.getName())
                .filter(value -> !value.isBlank())
                .orElseGet(() -> Optional.ofNullable(user.getUsername()).orElse(user.getUserId()));
        if (!model.containsKey("userName")) {
            model.put("userName", name);
        }
        if (!model.containsKey("recipientName")) {
            model.put("recipientName", name);
        }
    }

    private String resolveRecipientEmail(User user) {
        if (user == null) {
            return null;
        }
        if (user.getEmailId() != null && !user.getEmailId().isBlank()) {
            return user.getEmailId();
        }
        return null;
    }

    private List<String> splitEmails(String emails) {
        if (emails == null || emails.isBlank()) {
            return List.of();
        }
        return List.of(emails.split(",")).stream()
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .distinct()
                .toList();
    }

    private boolean isPermanentFailure(Exception ex) {
        String message = ex.getMessage() == null ? "" : ex.getMessage().toLowerCase();
        return message.contains("authentication") || message.contains("invalid") || message.contains("bad address");
    }

    private void markRecipientSent(NotificationRecipient recipient, QueueProcessingResult processingResult) {
        recipient.setStatus(NotificationDeliveryStatus.SENT);
        recipient.setSentAt(LocalDateTime.now());
        recipient.setLockedAt(null);
        recipient.setLockedBy(null);
        recipient.setLastError(null);
        processingResult.sent.add(recipient);
    }

    private void markRecipientFailed(NotificationRecipient recipient,
                                     String error,
                                     boolean permanent,
                                     QueueProcessingResult processingResult) {
        if (permanent) {
            recipient.setStatus(NotificationDeliveryStatus.DEAD);
            recipient.setNextRetryAt(null);
        } else {
            recipient.setStatus(NotificationDeliveryStatus.FAILED);
        }
        recipient.setRetryCount(recipient.getRetryCount() + 1);
        recipient.setLastError(truncate(error, 2000));
        recipient.setLockedAt(null);
        recipient.setLockedBy(null);
        processingResult.failed.add(recipient);
    }

    private void markGroupFailed(List<NotificationRecipient> recipients,
                                 String error,
                                 boolean permanent,
                                 QueueProcessingResult processingResult) {
        recipients.forEach(recipient -> markRecipientFailed(recipient, error, permanent, processingResult));
    }

    private void updateStatuses(QueueProcessingResult processingResult, LocalDateTime now) {
        if (processingResult.sent.isEmpty() && processingResult.failed.isEmpty()) {
            return;
        }
        NotificationProperties.EmailDispatcher settings = properties.getEmailDispatcher();

        for (NotificationRecipient recipient : processingResult.failed) {
            if (recipient.getStatus() == NotificationDeliveryStatus.DEAD) {
                continue;
            }
            if (recipient.getRetryCount() >= settings.getMaxRetries()) {
                recipient.setStatus(NotificationDeliveryStatus.DEAD);
                recipient.setNextRetryAt(null);
            } else {
                Duration backoff = computeBackoff(settings.getRetryBaseSeconds(),
                        settings.getRetryMaxSeconds(), recipient.getRetryCount());
                recipient.setNextRetryAt(now.plusSeconds(backoff.toSeconds()));
            }
        }

        List<NotificationRecipient> updated = new ArrayList<>();
        updated.addAll(processingResult.sent);
        updated.addAll(processingResult.failed);
        notificationRecipientRepository.saveAll(updated);
    }

    private Duration computeBackoff(long baseSeconds, long maxSeconds, int retryCount) {
        long delay = (long) (baseSeconds * Math.pow(2, Math.max(0, retryCount - 1)));
        delay = Math.min(delay, maxSeconds);
        return Duration.ofSeconds(delay);
    }

    @Transactional
    protected List<Long> claimBatch(int limit, LocalDateTime now, LocalDateTime staleBefore) {
        if (limit <= 0) {
            return Collections.emptyList();
        }
        List<Long> ids = notificationRecipientRepository.findClaimableIds(
                now,
                staleBefore,
                properties.getEmailDispatcher().getMaxRetries(),
                limit
        );
        if (ids.isEmpty()) {
            return ids;
        }
        notificationRecipientRepository.markProcessing(ids, resolveInstanceId(), now);
        return ids;
    }

    @Transactional
    private void recoverStuckProcessing(LocalDateTime staleBefore, LocalDateTime now) {
        int updated = notificationRecipientRepository.markProcessingAsFailed(
                staleBefore,
                now.plusSeconds(properties.getEmailDispatcher().getRetryBaseSeconds()),
                "Processing timeout"
        );
        if (updated > 0) {
            log.warn("email.dispatch.recovered count={} staleBefore={}", updated, staleBefore);
        }
    }

    @Transactional
    private void expireRetries(int maxRetries) {
        int updated = notificationRecipientRepository.markRetriesExhausted(maxRetries);
        if (updated > 0) {
            log.warn("email.dispatch.expired count={} maxRetries={}", updated, maxRetries);
        }
    }

    private Map<String, Object> parseData(String data) {
        if (data == null || data.isBlank()) {
            return new HashMap<>();
        }
        try {
            return objectMapper.readValue(data, new TypeReference<>() {});
        } catch (Exception ex) {
            log.warn("Failed to parse email notification data: {}", data, ex);
            return new HashMap<>();
        }
    }

    private String truncate(String value, int maxLength) {
        if (value == null) {
            return null;
        }
        if (value.length() <= maxLength) {
            return value;
        }
        return value.substring(0, maxLength);
    }

    private Executor unwrapExecutor(TaskExecutor executor) {
        return executor;
    }

    private String resolveInstanceId() {
        String configured = properties.getEmailDispatcher().getInstanceId();
        if (configured != null && !configured.isBlank()) {
            return configured;
        }
        String hostname = System.getenv("HOSTNAME");
        return hostname != null && !hostname.isBlank() ? hostname : "email-dispatcher";
    }

    private static final class QueueProcessingResult {
        private final Collection<NotificationRecipient> sent = new ConcurrentLinkedQueue<>();
        private final Collection<NotificationRecipient> failed = new ConcurrentLinkedQueue<>();
    }
}
