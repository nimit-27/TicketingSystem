package com.example.notification.service;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Collection;

@Service
public class NotificationStreamService {

    private final SseEmitterRegistry emitterRegistry;

    public NotificationStreamService(SseEmitterRegistry emitterRegistry) {
        this.emitterRegistry = emitterRegistry;
    }

    public SseEmitter createStream(Collection<String> recipientIds) {
        return emitterRegistry.registerEmitter(recipientIds);
    }
}

