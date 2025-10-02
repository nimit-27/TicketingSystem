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
    @ExceptionHandler(FeedbackNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleFeedbackNotFound(FeedbackNotFoundException ex, HttpServletRequest request) {
        return buildErrorResponse(HttpStatus.NOT_FOUND, ex.getMessage(), request);
    }

    @ExceptionHandler(RootCauseAnalysisNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleRootCauseNotFound(RootCauseAnalysisNotFoundException ex,
                                                                     HttpServletRequest request) {
        return buildErrorResponse(HttpStatus.NOT_FOUND, ex.getMessage(), request);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleResourceNotFound(ResourceNotFoundException ex, HttpServletRequest request) {
        return buildErrorResponse(HttpStatus.NOT_FOUND, ex.getMessage(), request);
    }

    @ExceptionHandler(ForbiddenOperationException.class)
    public ResponseEntity<ApiResponse<Void>> handleForbidden(ForbiddenOperationException ex, HttpServletRequest request) {
        return buildErrorResponse(HttpStatus.FORBIDDEN, ex.getMessage(), request);
    }

    @ExceptionHandler(InvalidRequestException.class)
    public ResponseEntity<ApiResponse<Void>> handleInvalidRequest(InvalidRequestException ex, HttpServletRequest request) {
        return buildErrorResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
    }

    @ExceptionHandler(FeedbackSubmissionException.class)
    public ResponseEntity<ApiResponse<Void>> handleFeedbackSubmission(FeedbackSubmissionException ex,
                                                                      HttpServletRequest request) {
        return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage(), request);
    }

    @ExceptionHandler(RootCauseAnalysisProcessingException.class)
    public ResponseEntity<ApiResponse<Void>> handleRootCauseProcessing(RootCauseAnalysisProcessingException ex,
                                                                       HttpServletRequest request) {
        return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage(), request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleException(Exception ex, HttpServletRequest request) {
        return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage(), request);
    }

    private ResponseEntity<ApiResponse<Void>> buildErrorResponse(HttpStatus status, String message, HttpServletRequest request) {
        ApiError apiError = new ApiError(message, status.value(), request.getRequestURI());
        ApiResponse<Void> response = new ApiResponse<>(false, null, apiError, LocalDateTime.now());
        return ResponseEntity.status(status).body(response);
    }
}
