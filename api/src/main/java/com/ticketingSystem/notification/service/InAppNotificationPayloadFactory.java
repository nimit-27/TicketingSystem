package com.ticketingSystem.notification.service;

import com.ticketingSystem.notification.models.NotificationMaster;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

@Component
public class InAppNotificationPayloadFactory {

    public InAppNotificationPayload buildPayload(NotificationRequest request) {
        NotificationMaster master = request != null ? request.getNotificationMaster() : null;
        Map<String, Object> payloadData = request != null && request.getDataModel() != null
                ? new HashMap<>(request.getDataModel())
                : new HashMap<>();

        String remark = extractString(payloadData.get("remark"));
        String redirectUrl = resolveRedirectUrl(payloadData);
        if (redirectUrl != null) {
            payloadData.putIfAbsent("redirectUrl", redirectUrl);
        }

        return InAppNotificationPayload.builder()
                .code(master != null ? master.getCode() : null)
                .title(resolveTemplate(master != null ? master.getDefaultTitleTpl() : null,
                        master != null ? master.getName() : null,
                        payloadData))
                .message(resolveTemplate(master != null ? master.getDefaultMessageTpl() : null,
                        master != null ? master.getDescription() : null,
                        payloadData))
                .remark(remark)
                .data(payloadData)
                .redirectUrl(redirectUrl)
                .timestamp(Instant.now().toString())
                .build();
    }

    private String resolveTemplate(String template, String fallback, Map<String, Object> data) {
        if (template == null || template.isBlank()) {
            return fallback;
        }
        String resolved = template;
        for (Map.Entry<String, Object> entry : data.entrySet()) {
            String value = Objects.toString(entry.getValue(), "");
            resolved = resolved.replace("${" + entry.getKey() + "}", value);
            resolved = resolved.replace("{{" + entry.getKey() + "}}", value);
        }
        return resolved;
    }

    private String extractString(Object value) {
        if (value == null) {
            return null;
        }
        String text = Objects.toString(value, "").trim();
        return text.isEmpty() ? null : text;
    }

    private String resolveRedirectUrl(Map<String, Object> payloadData) {
        String explicitRedirect = extractString(payloadData.get("redirectUrl"));
        if (explicitRedirect != null) {
            return explicitRedirect;
        }

        Object ticketId = payloadData.get("ticketId");
        if (ticketId != null) {
            String ticket = Objects.toString(ticketId, "").trim();
            if (!ticket.isEmpty()) {
                return "/tickets/" + ticket;
            }
        }

        return null;
    }
}
