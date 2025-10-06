package com.ticketingSystem.api.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private T data;
    private ApiError apiError;
    private LocalDateTime timestamp;

    public static <T> ResponseEntity<ApiResponse<T>> success(T data) {
        ApiResponse<T> response = new ApiResponse<>(true, data, null, LocalDateTime.now());
        return ResponseEntity.ok(response);
    }
}
