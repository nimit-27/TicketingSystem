package com.example.notification.repository;

import com.example.notification.models.NotificationRecipient;
import org.hibernate.query.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import javax.swing.*;
import java.awt.print.Pageable;
import java.util.List;

public interface NotificationRecipientRepository extends JpaRepository<NotificationRecipient, Long> {
    @Query("""
            SELECT nr FROM notificationRecipient nr
            JOIN FETCH nr.notification n
            JOIN FETCH n.type t
            WHERE nr.recipient.id = :userId
                AND (:unreadOnly = false OR nr.isRead = false)
                AND nr.softDeleted = false
                AND (:typeCodes IS NULL OR t.code IN :typeCodes)
            ORDER BY n.createdAt DESC
           """)
    Page<NotificationRecipient> findInbox(@Param("userId") Long userId,
                                          @Param("unreadOnly") boolean unreadOnly,
                                          @Param("typeCodes") List<String> typeCodes,
                                          Pageable pageable);

    long countByRecipient_IdAndIsReadFalseAndSoftDeletedFalse(Long userId);

}
