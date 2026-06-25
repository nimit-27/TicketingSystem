package com.ticketingSystem.api.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketingSystem.api.dto.requestersync.*;
import com.ticketingSystem.api.models.RequesterUser;
import com.ticketingSystem.api.models.RequesterUserExternalIdentity;
import com.ticketingSystem.api.models.RequesterUserSyncStaging;
import com.ticketingSystem.api.repository.RequesterUserExternalIdentityRepository;
import com.ticketingSystem.api.repository.RequesterUserRepository;
import com.ticketingSystem.api.repository.RequesterUserSyncStagingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.HexFormat;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class RequesterUserSyncService {
    private static final String STATUS_PENDING = "PENDING";
    private static final String STATUS_PROCESSING = "PROCESSING";
    private static final String STATUS_SUCCESS = "SUCCESS";
    private static final String STATUS_RETRYABLE_FAILED = "RETRYABLE_FAILED";
    private static final String STATUS_PERMANENT_FAILED = "PERMANENT_FAILED";
    private static final DateTimeFormatter EXTERNAL_DATE_FORMAT = DateTimeFormatter.ofPattern("ddMMyyyy");

    private static final List<String> FAILURE_STATUSES = List.of(
            "VALIDATION_FAILED",
            STATUS_RETRYABLE_FAILED,
            STATUS_PERMANENT_FAILED
    );
    private static final List<String> PROCESSABLE_STATUSES = List.of(
            STATUS_PENDING,
            STATUS_RETRYABLE_FAILED
    );

    private final RequesterUserSyncStagingRepository stagingRepository;
    private final RequesterUserExternalIdentityRepository externalIdentityRepository;
    private final RequesterUserRepository requesterUserRepository;
    private final ObjectMapper objectMapper;

    @Value("${app.requester-user-sync.max-retries:3}")
    private int maxRetries;

    @Value("${app.requester-user-sync.default-source-system:EXTERNAL}")
    private String defaultSourceSystem;

    @Transactional
    public RequesterUserSyncBatchResponse ingestBatch(RequesterUserSyncBatchRequest request) {
        int accepted = 0;
        int duplicate = 0;
        int rejected = 0;

        String sourceSystem = resolveSourceSystem(request);
        String batchId = String.valueOf(request.getRequestId());

        for (RequesterUserSyncRecordRequest record : request.getUsers()) {
            try {
                validate(record);
                String empId = trim(record.getEmpId());
                String idempotencyKey = buildIdempotencyKey(sourceSystem, batchId, empId);
                if (stagingRepository.existsByIdempotencyKey(idempotencyKey)) {
                    duplicate++;
                    continue;
                }

                RequesterUserSyncStaging staging = new RequesterUserSyncStaging();
                staging.setRequestId(request.getRequestId());
                staging.setBatchId(batchId);
                staging.setSourceSystem(sourceSystem);
                staging.setSourceRecordId(empId);
                staging.setExternalUserId(empId);
                staging.setEmpId(empId);
                staging.setUsername(empId);
                staging.setFirstName(trim(record.getFirstName()));
                staging.setMiddleName(trim(record.getMiddleName()));
                staging.setLastName(trim(record.getLastName()));
                staging.setEmailId(trim(record.getEmailId()));
                staging.setMobileNo(trim(record.getMobileNumber()));
                staging.setDesignation(trim(record.getDesignation()));
                staging.setReportingManagerCode(trim(record.getReportingManagerCode()));
                staging.setReportingManagerName(trim(record.getReportingManagerName()));
                staging.setOfficeType(trim(record.getOfficeType()));
                staging.setOfficeCode(trim(record.getOfficeCode()));
                staging.setPayloadJson(objectMapper.writeValueAsString(record));
                staging.setPayloadHash(sha256(staging.getPayloadJson()));
                staging.setIdempotencyKey(idempotencyKey);
                staging.setMaxRetries(maxRetries);
                staging.setStatus(STATUS_PENDING);
                stagingRepository.save(staging);
                accepted++;
            } catch (JsonProcessingException | IllegalArgumentException ex) {
                rejected++;
                log.warn("Rejected requester user sync record sourceSystem={} batchId={} empId={}: {}",
                        sourceSystem, batchId, record.getEmpId(), ex.getMessage());
            }
        }

        return new RequesterUserSyncBatchResponse(
                request.getRequestId(),
                sourceSystem,
                batchId,
                accepted,
                duplicate,
                rejected,
                "/ext/requester-users/batches/" + batchId
        );
    }

    @Transactional
    public int processNextBatch(int batchSize) {
        List<RequesterUserSyncStaging> rows = stagingRepository.findProcessableRows(PROCESSABLE_STATUSES, PageRequest.of(0, batchSize));
        rows.forEach(row -> row.setStatus(STATUS_PROCESSING));
        stagingRepository.flush();

        int processed = 0;
        for (RequesterUserSyncStaging row : rows) {
            processRow(row);
            processed++;
        }
        return processed;
    }

    @Transactional(readOnly = true)
    public RequesterUserSyncFailureResponse getFailures(String sourceSystem, String batchId) {
        String resolvedSourceSystem = isBlank(sourceSystem) ? defaultSourceSystem : sourceSystem.trim();
        List<RequesterUserSyncFailureDto> failures = stagingRepository
                .findBySourceSystemAndBatchIdAndStatusIn(resolvedSourceSystem, batchId, FAILURE_STATUSES)
                .stream()
                .map(row -> new RequesterUserSyncFailureDto(
                        row.getRequestId(),
                        row.getEmpId(),
                        row.getRequesterUserId(),
                        row.getStatus(),
                        row.getErrorCode(),
                        row.getErrorMessage()))
                .toList();
        Long requestId = failures.isEmpty() ? null : failures.get(0).getRequestId();
        return new RequesterUserSyncFailureResponse(resolvedSourceSystem, batchId, requestId, failures);
    }

    private void processRow(RequesterUserSyncStaging row) {
        row.setProcessingStartedAt(LocalDateTime.now());
        try {
            RequesterUserSyncRecordRequest payload = objectMapper.readValue(row.getPayloadJson(), RequesterUserSyncRecordRequest.class);
            validate(payload);

            Optional<RequesterUserExternalIdentity> existingIdentity = externalIdentityRepository
                    .findBySourceSystemAndExternalUserId(row.getSourceSystem(), row.getEmpId());
            RequesterUser requesterUser = existingIdentity
                    .map(RequesterUserExternalIdentity::getRequesterUser)
                    .orElseGet(() -> requesterUserRepository.findByUsername(payload.getEmpId()).orElseGet(RequesterUser::new));

            Optional<RequesterUser> usernameOwner = requesterUserRepository.findByUsername(payload.getEmpId());
            if (usernameOwner.isPresent()
                    && requesterUser.getRequesterUserId() != null
                    && !Objects.equals(usernameOwner.get().getRequesterUserId(), requesterUser.getRequesterUserId())) {
                markPermanentFailure(row, "USERNAME_CONFLICT", "Username is already mapped to another requester user");
                return;
            }

            applyPayload(requesterUser, payload);
            RequesterUser saved = requesterUserRepository.save(requesterUser);
            existingIdentity.orElseGet(() -> createExternalIdentity(row.getSourceSystem(), row.getEmpId(), saved));

            row.setRequesterUserId(saved.getRequesterUserId());
            row.setStatus(STATUS_SUCCESS);
            row.setErrorCode(null);
            row.setErrorMessage(null);
            row.setProcessedAt(LocalDateTime.now());
        } catch (IllegalArgumentException ex) {
            markPermanentFailure(row, "VALIDATION_FAILED", ex.getMessage());
        } catch (Exception ex) {
            row.setRetryCount(row.getRetryCount() + 1);
            if (row.getRetryCount() >= row.getMaxRetries()) {
                markPermanentFailure(row, "MAX_RETRIES_EXHAUSTED", ex.getMessage());
            } else {
                row.setStatus(STATUS_RETRYABLE_FAILED);
                row.setErrorCode("PROCESSING_FAILED");
                row.setErrorMessage(truncate(ex.getMessage(), 1000));
                row.setProcessedAt(LocalDateTime.now());
            }
        }
    }

    private RequesterUserExternalIdentity createExternalIdentity(String sourceSystem, String externalUserId, RequesterUser requesterUser) {
        RequesterUserExternalIdentity identity = new RequesterUserExternalIdentity();
        identity.setSourceSystem(sourceSystem);
        identity.setExternalUserId(externalUserId);
        identity.setRequesterUser(requesterUser);
        return externalIdentityRepository.save(identity);
    }

    private void applyPayload(RequesterUser user, RequesterUserSyncRecordRequest payload) {
        user.setUsername(trim(payload.getEmpId()));
        user.setName(buildName(payload));
        user.setFirstName(trim(payload.getFirstName()));
        user.setMiddleName(trim(payload.getMiddleName()));
        user.setLastName(trim(payload.getLastName()));
        user.setEmailId(trim(payload.getEmailId()));
        user.setMobileNo(trim(payload.getMobileNumber()));
        user.setOffice(trim(payload.getOfficeCode()));
        user.setDateOfJoining(parseExternalDate(payload.getDateOfJoining(), "dateOfJoining"));
        user.setDateOfRetirement(parseExternalDate(payload.getDateOfRetirement(), "dateOfRetirement"));
        user.setOfficeType(trim(payload.getOfficeType()));
        user.setOfficeCode(trim(payload.getOfficeCode()));
    }

    private void validate(RequesterUserSyncRecordRequest payload) {
        if (isBlank(payload.getEmpId())) {
            throw new IllegalArgumentException("empId is required");
        }
        parseExternalDate(payload.getDateOfJoining(), "dateOfJoining");
        parseExternalDate(payload.getDateOfRetirement(), "dateOfRetirement");
    }

    private void markPermanentFailure(RequesterUserSyncStaging row, String code, String message) {
        row.setStatus(STATUS_PERMANENT_FAILED);
        row.setErrorCode(code);
        row.setErrorMessage(truncate(message, 1000));
        row.setProcessedAt(LocalDateTime.now());
    }

    private String buildIdempotencyKey(String sourceSystem, String batchId, String sourceRecordId) {
        return sourceSystem + ":" + batchId + ":" + sourceRecordId;
    }

    private String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 digest is unavailable", ex);
        }
    }

    private String buildName(RequesterUserSyncRecordRequest payload) {
        String name = String.join(" ", List.of(trim(payload.getFirstName()), trim(payload.getMiddleName()), trim(payload.getLastName()))).trim();
        return name.isBlank() ? trim(payload.getEmpId()) : name;
    }

    private LocalDateTime parseExternalDate(String value, String fieldName) {
        if (isBlank(value)) {
            return null;
        }
        try {
            LocalDate date = LocalDate.parse(value.trim(), EXTERNAL_DATE_FORMAT);
            return date.atStartOfDay();
        } catch (DateTimeParseException ex) {
            throw new IllegalArgumentException(fieldName + " must use ddMMyyyy format");
        }
    }

    private String resolveSourceSystem(RequesterUserSyncBatchRequest request) {
        return isBlank(request.getSourceSystem()) ? defaultSourceSystem : request.getSourceSystem().trim();
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private String trim(String value) {
        return value == null ? null : value.trim();
    }

    private String truncate(String value, int maxLength) {
        if (value == null || value.length() <= maxLength) {
            return value;
        }
        return value.substring(0, maxLength);
    }
}
