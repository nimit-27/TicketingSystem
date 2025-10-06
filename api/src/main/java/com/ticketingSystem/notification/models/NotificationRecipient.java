package com.ticketingSystem.notification.models;

import com.ticketingSystem.api.models.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "notification_recipient",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_nr_notification_user",
                columnNames = {"notification_id", "recipient_user_id"}
        ),
        indexes = {
                @Index(name = "idx_nr_inbox", columnList = "recipient_user_id,is_read,created_at")
        }
)
@Getter @Setter
public class NotificationRecipient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Parent notification
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "notification_id", nullable = false)
    private Notification notification;

    // Target user (recipient)
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recipient_user_id", nullable = false)
    private User recipient;

    // Read state
    @Column(name = "is_read", nullable = false)
    private boolean isRead = false;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    // Soft delete (for inbox archive)
    @Column(name = "soft_deleted", nullable = false)
    private boolean softDeleted = false;

    // ---- Auditing (LocalDateTime) ----
    // Set once on INSERT
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Convenience helper for marking read/unread
    public void setRead(boolean read) {
        this.isRead = read;
        this.readAt = read ? LocalDateTime.now() : null;
    }
}
