package com.ticketingSystem.notification.repository;

import com.ticketingSystem.notification.enums.ChannelType;
import com.ticketingSystem.notification.models.NotificationRecipient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface NotificationRecipientRepository extends JpaRepository<NotificationRecipient, Long> {
    @Query("""
            SELECT nr FROM NotificationRecipient nr
            JOIN FETCH nr.notification n
            JOIN FETCH n.type t
            WHERE nr.recipient.userId = :userId
                AND nr.channel = :channel
                AND (:unreadOnly = false OR nr.isRead = false)
                AND nr.softDeleted = false
                AND (:typeCodes IS NULL OR t.code IN :typeCodes)
            ORDER BY n.createdAt DESC
           """)
    Page<NotificationRecipient> findInbox(@Param("userId") String userId,
                                          @Param("channel") ChannelType channel,
                                          @Param("unreadOnly") boolean unreadOnly,
                                          @Param("typeCodes") List<String> typeCodes,
                                          Pageable pageable);

    long countByRecipient_UserIdAndIsReadFalseAndSoftDeletedFalseAndChannel(String userId, ChannelType channel);

    List<NotificationRecipient> findByRecipient_UserIdAndIsReadFalseAndSoftDeletedFalseAndChannel(String userId, ChannelType channel);

    @Query("""
            SELECT nr FROM NotificationRecipient nr
            JOIN FETCH nr.notification n
            JOIN FETCH n.type t
            JOIN FETCH nr.recipient r
            WHERE nr.id IN :ids
           """)
    List<NotificationRecipient> findByIdInWithNotification(@Param("ids") List<Long> ids);

    @Query(value = """
            SELECT id
            FROM notification_recipient
            WHERE channel = 'EMAIL'
              AND status IN ('PENDING', 'FAILED')
              AND retry_count < :maxRetries
              AND (next_retry_at IS NULL OR next_retry_at <= :now)
              AND (locked_at IS NULL OR locked_at < :staleBefore)
            ORDER BY id
            LIMIT :limit
            FOR UPDATE SKIP LOCKED
            """, nativeQuery = true)
    List<Long> findClaimableIds(@Param("now") LocalDateTime now,
                                @Param("staleBefore") LocalDateTime staleBefore,
                                @Param("maxRetries") int maxRetries,
                                @Param("limit") int limit);

    @Modifying
    @Query(value = """
            UPDATE notification_recipient
            SET status = 'PROCESSING',
                locked_by = :lockedBy,
                locked_at = :lockedAt
            WHERE id IN (:ids)
            """, nativeQuery = true)
    int markProcessing(@Param("ids") List<Long> ids,
                       @Param("lockedBy") String lockedBy,
                       @Param("lockedAt") LocalDateTime lockedAt);

    @Modifying
    @Query(value = """
            UPDATE notification_recipient
            SET status = 'FAILED',
                locked_by = NULL,
                locked_at = NULL,
                retry_count = retry_count + 1,
                next_retry_at = :retryAt,
                last_error = :errorMessage
            WHERE channel = 'EMAIL'
              AND status = 'PROCESSING'
              AND locked_at < :staleBefore
            """, nativeQuery = true)
    int markProcessingAsFailed(@Param("staleBefore") LocalDateTime staleBefore,
                               @Param("retryAt") LocalDateTime retryAt,
                               @Param("errorMessage") String errorMessage);

    @Modifying
    @Query(value = """
            UPDATE notification_recipient
            SET status = 'DEAD',
                next_retry_at = NULL
            WHERE channel = 'EMAIL'
              AND status = 'FAILED'
              AND retry_count >= :maxRetries
            """, nativeQuery = true)
    int markRetriesExhausted(@Param("maxRetries") int maxRetries);

}
