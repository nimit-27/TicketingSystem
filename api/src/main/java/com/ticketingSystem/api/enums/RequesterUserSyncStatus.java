package com.ticketingSystem.api.enums;

public enum RequesterUserSyncStatus {
    RECEIVED,
    VALIDATION_FAILED,
    PENDING,
    PROCESSING,
    SUCCESS,
    RETRYABLE_FAILED,
    PERMANENT_FAILED,
    SKIPPED_NO_CHANGE
}
