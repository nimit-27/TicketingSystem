package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.models.RequesterUserSyncStaging;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface RequesterUserSyncStagingRepository extends JpaRepository<RequesterUserSyncStaging, Long> {
    boolean existsByIdempotencyKey(String idempotencyKey);

    Optional<RequesterUserSyncStaging> findByIdempotencyKey(String idempotencyKey);

    long countBySourceSystemAndBatchIdAndStatus(String sourceSystem, String batchId, String status);

    List<RequesterUserSyncStaging> findBySourceSystemAndBatchIdAndStatusIn(String sourceSystem,
                                                                            String batchId,
                                                                            Collection<String> statuses);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM RequesterUserSyncStaging s WHERE s.status IN :statuses AND s.retryCount < s.maxRetries ORDER BY s.updatedAt ASC")
    List<RequesterUserSyncStaging> findProcessableRows(@Param("statuses") Collection<String> statuses,
                                                       Pageable pageable);
}
