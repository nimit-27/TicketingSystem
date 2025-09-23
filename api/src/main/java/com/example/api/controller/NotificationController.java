package com.example.api.controller;

import com.example.api.dto.ApiResponse;
import com.example.api.dto.UserNotificationDto;
import com.example.notification.service.NotificationQueryService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationQueryService notificationQueryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserNotificationDto>>> getNotifications(HttpSession session) {
        String userId = (String) session.getAttribute("userId");
        if (userId == null || userId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not logged in");
        }
        List<UserNotificationDto> notifications = notificationQueryService.getNotificationsForUser(userId);
        return ApiResponse.success(notifications);
    }
}
