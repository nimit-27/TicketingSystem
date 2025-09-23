package com.example.notification.service;

import com.example.notification.config.NotificationProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.task.TaskExecutor;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.Instant;
import java.util.Collection;
import java.util.Collections;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Collectors;

@Component
public class SseEmitterRegistry {

    private static final Logger log = LoggerFactory.getLogger(SseEmitterRegistry.class);

    private final Map<String, CopyOnWriteArrayList<SseEmitter>> emittersByRecipient = new ConcurrentHashMap<>();
    private final Map<SseEmitter, Set<String>> recipientsByEmitter = new ConcurrentHashMap<>();
    private final NotificationProperties properties;
    private final TaskExecutor taskExecutor;

    public SseEmitterRegistry(NotificationProperties properties,
                              TaskExecutor notificationTaskExecutor) {
        this.properties = properties;
        this.taskExecutor = notificationTaskExecutor;
    }

    public SseEmitter registerEmitter(Collection<String> recipientIds) {
        Set<String> sanitizedRecipients = sanitizeRecipients(recipientIds);
        if (sanitizedRecipients.isEmpty()) {
            throw new IllegalArgumentException("At least one recipient id is required for SSE subscription");
        }

        long timeout = properties.getSse().getDefaultTimeoutMillis();
        SseEmitter emitter = new SseEmitter(timeout);
        recipientsByEmitter.put(emitter, sanitizedRecipients);

        sanitizedRecipients.forEach(recipient -> {
            CopyOnWriteArrayList<SseEmitter> emitters = emittersByRecipient
                    .computeIfAbsent(recipient, key -> new CopyOnWriteArrayList<>());
            emitters.add(emitter);
            enforceMaxEmitters(recipient, emitters);
        });

        emitter.onCompletion(() -> unregisterEmitter(emitter));
        emitter.onTimeout(() -> unregisterEmitter(emitter));
        emitter.onError(ex -> unregisterEmitter(emitter));

        sendInitialHeartbeat(emitter);

        return emitter;
    }

    public void sendToRecipient(String recipient, Object payload) {
        CopyOnWriteArrayList<SseEmitter> emitters = emittersByRecipient.getOrDefault(recipient, new CopyOnWriteArrayList<>());
        if (emitters.isEmpty()) {
            return;
        }

        emitters.forEach(emitter -> taskExecutor.execute(() -> {
            try {
                emitter.send(SseEmitter.event()
                        .name("notification")
                        .data(payload)
                        .id(String.valueOf(Instant.now().toEpochMilli())));
            } catch (IOException ex) {
                log.debug("Failed to send SSE notification to recipient {}", recipient, ex);
                unregisterEmitter(emitter);
            }
        }));
    }

    private void unregisterEmitter(@Nullable SseEmitter emitter) {
        if (emitter == null) {
            return;
        }

        Set<String> recipients = recipientsByEmitter.remove(emitter);
        if (recipients == null) {
            return;
        }

        recipients.forEach(recipient -> {
            CopyOnWriteArrayList<SseEmitter> emitters = emittersByRecipient.get(recipient);
            if (emitters != null) {
                emitters.remove(emitter);
                if (emitters.isEmpty()) {
                    emittersByRecipient.remove(recipient);
                }
            }
        });
    }

    private void enforceMaxEmitters(String recipient, CopyOnWriteArrayList<SseEmitter> emitters) {
        int maxEmitters = Math.max(1, properties.getSse().getMaxEmittersPerRecipient());
        while (emitters.size() > maxEmitters) {
            SseEmitter removed = emitters.remove(0);
            unregisterEmitter(removed);
            if (removed != null) {
                try {
                    removed.complete();
                } catch (IllegalStateException ignored) {
                    // Already completed
                }
            }
            log.debug("Evicted excess SSE emitter for recipient {}", recipient);
        }
    }

    private void sendInitialHeartbeat(SseEmitter emitter) {
        taskExecutor.execute(() -> {
            try {
                emitter.send(SseEmitter.event()
                        .name("heartbeat")
                        .data(Collections.singletonMap("status", "connected")));
            } catch (IOException ex) {
                log.debug("Failed to send initial heartbeat", ex);
                unregisterEmitter(emitter);
            }
        });
    }

    @NonNull
    private Set<String> sanitizeRecipients(@Nullable Collection<String> recipientIds) {
        if (recipientIds == null) {
            return Collections.emptySet();
        }
        return recipientIds.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .collect(Collectors.toCollection(ConcurrentHashMap::newKeySet));
    }
}

