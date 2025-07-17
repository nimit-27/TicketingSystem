package com.example.api.exception;

import com.example.api.dto.ApiError;
import com.example.api.dto.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(TicketNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleTicketNotFound(TicketNotFoundException ex, HttpServletRequest request) {
        ApiError apiError = new ApiError(ex.getMessage(), HttpStatus.NOT_FOUND.value(), request.getRequestURI());
        ApiResponse<Void> response = new ApiResponse<>(false, null, apiError, LocalDateTime.now());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleException(Exception ex, HttpServletRequest request) {
        ApiError apiError = new ApiError(ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR.value(), request.getRequestURI());
        ApiResponse<Void> response = new ApiResponse<>(false, null, apiError, LocalDateTime.now());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
