package com.ticketingSystem.api.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketingSystem.api.dto.requestersync.*;
import com.ticketingSystem.api.enums.RequesterUserSyncStatus;
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
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class RequesterUserSyncService {
    private static final List<RequesterUserSyncStatus> FAILURE_STATUSES = List.of(
            RequesterUserSyncStatus.VALIDATION_FAILED,
            RequesterUserSyncStatus.RETRYABLE_FAILED,
            RequesterUserSyncStatus.PERMANENT_FAILED
    );
    private static final List<RequesterUserSyncStatus> PROCESSABLE_STATUSES = List.of(
            RequesterUserSyncStatus.PENDING,
            RequesterUserSyncStatus.RETRYABLE_FAILED
    );

    private final RequesterUserSyncStagingRepository stagingRepository;
    private final RequesterUserExternalIdentityRepository externalIdentityRepository;
    private final RequesterUserRepository requesterUserRepository;
    private final ObjectMapper objectMapper;

    @Value("${app.requester-user-sync.max-retries:3}")
    private int maxRetries;

    @Transactional
    public RequesterUserSyncBatchResponse ingestBatch(RequesterUserSyncBatchRequest request) {
        int accepted = 0;
        int duplicate = 0;
        int rejected = 0;

        for (RequesterUserSyncRecordRequest record : request.getRecords()) {
            String idempotencyKey = buildIdempotencyKey(request.getSourceSystem(), request.getBatchId(), record.getSourceRecordId());
            if (stagingRepository.existsByIdempotencyKey(idempotencyKey)) {
                duplicate++;
                continue;
            }

            try {
                RequesterUserSyncStaging staging = new RequesterUserSyncStaging();
                staging.setBatchId(request.getBatchId());
                staging.setSourceSystem(request.getSourceSystem());
                staging.setSourceRecordId(record.getSourceRecordId());
                staging.setExternalUserId(record.getExternalUserId());
                staging.setSchemaVersion(request.getSchemaVersion());
                staging.setUsername(trim(record.getUsername()));
                staging.setEmailId(firstNonBlank(record.getEmailId(), record.getEmail()));
                staging.setMobileNo(firstNonBlank(record.getMobileNo(), record.getMobile()));
                staging.setOfficeCode(trim(record.getOfficeCode()));
                staging.setPayloadJson(objectMapper.writeValueAsString(record));
                staging.setPayloadHash(sha256(staging.getPayloadJson()));
                staging.setIdempotencyKey(idempotencyKey);
                staging.setMaxRetries(maxRetries);
                staging.setStatus(RequesterUserSyncStatus.PENDING);
                stagingRepository.save(staging);
                accepted++;
            } catch (JsonProcessingException | IllegalArgumentException ex) {
                rejected++;
                log.warn("Rejected requester user sync record sourceSystem={} batchId={} sourceRecordId={}: {}",
                        request.getSourceSystem(), request.getBatchId(), record.getSourceRecordId(), ex.getMessage());
            }
        }

        return new RequesterUserSyncBatchResponse(
                request.getSourceSystem(),
                request.getBatchId(),
                accepted,
                duplicate,
                rejected,
                "/ext/requester-users/batches/" + request.getBatchId()
        );
    }

    @Transactional
    public int processNextBatch(int batchSize) {
        List<RequesterUserSyncStaging> rows = stagingRepository.findProcessableRows(PROCESSABLE_STATUSES, PageRequest.of(0, batchSize));
        rows.forEach(row -> row.setStatus(RequesterUserSyncStatus.PROCESSING));
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
        List<RequesterUserSyncFailureDto> failures = stagingRepository
                .findBySourceSystemAndBatchIdAndStatusIn(sourceSystem, batchId, FAILURE_STATUSES)
                .stream()
                .map(row -> new RequesterUserSyncFailureDto(
                        row.getSourceRecordId(),
                        row.getExternalUserId(),
                        row.getRequesterUserId(),
                        row.getStatus().name(),
                        row.getErrorCode(),
                        row.getErrorMessage()))
                .toList();
        return new RequesterUserSyncFailureResponse(sourceSystem, batchId, failures);
    }

    private void processRow(RequesterUserSyncStaging row) {
        row.setProcessingStartedAt(LocalDateTime.now());
        try {
            RequesterUserSyncRecordRequest payload = objectMapper.readValue(row.getPayloadJson(), RequesterUserSyncRecordRequest.class);
            validate(payload);

            Optional<RequesterUserExternalIdentity> existingIdentity = externalIdentityRepository
                    .findBySourceSystemAndExternalUserId(row.getSourceSystem(), row.getExternalUserId());
            RequesterUser requesterUser = existingIdentity
                    .map(RequesterUserExternalIdentity::getRequesterUser)
                    .orElseGet(() -> requesterUserRepository.findByUsername(payload.getUsername()).orElseGet(RequesterUser::new));

            Optional<RequesterUser> usernameOwner = requesterUserRepository.findByUsername(payload.getUsername());
            if (usernameOwner.isPresent()
                    && requesterUser.getRequesterUserId() != null
                    && !Objects.equals(usernameOwner.get().getRequesterUserId(), requesterUser.getRequesterUserId())) {
                markPermanentFailure(row, "USERNAME_CONFLICT", "Username is already mapped to another requester user");
                return;
            }

            applyPayload(requesterUser, payload);
            RequesterUser saved = requesterUserRepository.save(requesterUser);
            existingIdentity.orElseGet(() -> createExternalIdentity(row.getSourceSystem(), row.getExternalUserId(), saved));

            row.setRequesterUserId(saved.getRequesterUserId());
            row.setStatus(RequesterUserSyncStatus.SUCCESS);
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
                row.setStatus(RequesterUserSyncStatus.RETRYABLE_FAILED);
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
        user.setUsername(trim(payload.getUsername()));
        user.setName(firstNonBlank(payload.getName(), payload.getFullName(), buildName(payload)));
        user.setFirstName(trim(payload.getFirstName()));
        user.setMiddleName(trim(payload.getMiddleName()));
        user.setLastName(trim(payload.getLastName()));
        user.setEmailId(firstNonBlank(payload.getEmailId(), payload.getEmail()));
        user.setMobileNo(firstNonBlank(payload.getMobileNo(), payload.getMobile()));
        user.setOffice(trim(payload.getOffice()));
        user.setRoles(trim(payload.getRoles()));
        user.setStakeholder(trim(payload.getStakeholder()));
        user.setDateOfJoining(payload.getDateOfJoining());
        user.setDateOfRetirement(payload.getDateOfRetirement());
        user.setOfficeType(trim(payload.getOfficeType()));
        user.setOfficeCode(trim(payload.getOfficeCode()));
        user.setZoneCode(trim(payload.getZoneCode()));
        user.setRegionCode(trim(payload.getRegionCode()));
        user.setDistrictCode(trim(payload.getDistrictCode()));
    }

    private void validate(RequesterUserSyncRecordRequest payload) {
        if (isBlank(payload.getExternalUserId())) {
            throw new IllegalArgumentException("externalUserId is required");
        }
        if (isBlank(payload.getSourceRecordId())) {
            throw new IllegalArgumentException("sourceRecordId is required");
        }
        if (isBlank(payload.getUsername())) {
            throw new IllegalArgumentException("username is required");
        }
    }

    private void markPermanentFailure(RequesterUserSyncStaging row, String code, String message) {
        row.setStatus(RequesterUserSyncStatus.PERMANENT_FAILED);
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
        return String.join(" ", List.of(trim(payload.getFirstName()), trim(payload.getMiddleName()), trim(payload.getLastName()))).trim();
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (!isBlank(value)) {
                return value.trim();
            }
        }
        return null;
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
