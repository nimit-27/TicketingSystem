package com.example.api.controller;

import com.example.api.config.JwtProperties;
import com.example.api.dto.ApiResponse;
import com.example.api.dto.LoginPayload;
import com.example.api.dto.NotificationPageResponse;
import com.example.notification.service.NotificationQueryService;
import com.example.notification.service.NotificationStreamService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/notifications")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationQueryService notificationQueryService;
    private final NotificationStreamService notificationStreamService;
    private final JwtProperties jwtProperties;

    @GetMapping
    @PreAuthorize("@jwtProperties.isBypassEnabled() or isAuthenticated()")
    public ResponseEntity<ApiResponse<NotificationPageResponse>> getNotifications(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "7") int size,
            @AuthenticationPrincipal LoginPayload authenticatedUser,
            HttpSession session) {
        String userId = resolveUserId(authenticatedUser, session);
        if (userId == null || userId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not logged in");
        }
        NotificationPageResponse notifications = notificationQueryService.getNotificationsForUser(userId, page, size);
        return ApiResponse.success(notifications);
    }

    @PostMapping("/mark-read")
    @PreAuthorize("@jwtProperties.isBypassEnabled() or isAuthenticated()")
    public ResponseEntity<ApiResponse<Map<String, Object>>> markAllRead(
            @AuthenticationPrincipal LoginPayload authenticatedUser,
            HttpSession session) {
        String userId = resolveUserId(authenticatedUser, session);
        if (userId == null || userId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not logged in");
        }
        int updated = notificationQueryService.markAllNotificationsAsRead(userId);
        return ApiResponse.success(Map.of("updated", updated));
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @PreAuthorize("@jwtProperties.isBypassEnabled() or isAuthenticated()")
    public SseEmitter streamNotifications(
            @RequestParam(name = "recipientId", required = false) Set<String> recipientIds,
            @AuthenticationPrincipal LoginPayload authenticatedUser,
            HttpSession session
    ) {
        Set<String> resolvedRecipients = recipientIds == null ? Set.of() : recipientIds;
        if (resolvedRecipients.isEmpty()) {
            String userId = resolveUserId(authenticatedUser, session);
            if (userId == null || userId.isBlank()) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not logged in");
            }
            resolvedRecipients = Set.of(userId);
        }
        return notificationStreamService.createStream(resolvedRecipients);
    }

    private String resolveUserId(LoginPayload authenticatedUser, HttpSession session) {
        if (!jwtProperties.isBypassEnabled() && authenticatedUser != null) {
            return authenticatedUser.getUserId();
        }
        Object userId = session.getAttribute("userId");
        return userId instanceof String ? (String) userId : null;
    }
}
