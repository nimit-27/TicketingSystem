package com.example.api.controller;

import com.example.api.dto.ApiResponse;
import com.example.api.dto.NotificationPageResponse;
import com.example.notification.service.NotificationQueryService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/notifications")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationQueryService notificationQueryService;

    @GetMapping
    public ResponseEntity<ApiResponse<NotificationPageResponse>> getNotifications(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "7") int size,
            HttpSession session) {
        String userId = (String) session.getAttribute("userId");
        if (userId == null || userId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not logged in");
        }
        NotificationPageResponse notifications = notificationQueryService.getNotificationsForUser(userId, page, size);
        return ApiResponse.success(notifications);
    }

    @PostMapping("/mark-read")
    public ResponseEntity<ApiResponse<Map<String, Object>>> markAllRead(HttpSession session) {
        String userId = (String) session.getAttribute("userId");
        if (userId == null || userId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not logged in");
        }
        int updated = notificationQueryService.markAllNotificationsAsRead(userId);
        return ApiResponse.success(Map.of("updated", updated));
    }
}
