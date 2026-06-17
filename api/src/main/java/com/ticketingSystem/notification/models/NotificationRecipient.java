package com.ticketingSystem.notification.models;

import com.ticketingSystem.api.models.GenericUser;
import com.ticketingSystem.api.models.RequesterUser;
import com.ticketingSystem.api.models.User;
import com.ticketingSystem.notification.enums.ChannelType;
import com.ticketingSystem.notification.enums.NotificationDeliveryStatus;
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
                @Index(name = "idx_nr_inbox", columnList = "recipient_user_id,is_read,created_at"),
                @Index(name = "idx_nr_requester_inbox", columnList = "requester_recipient_user_id,is_read,created_at")
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
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_user_id")
    private User recipient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_recipient_user_id")
    private RequesterUser requesterRecipient;

    public GenericUser getGenericRecipient() {
        return recipient != null ? recipient : requesterRecipient;
    }

    public void setGenericRecipient(GenericUser recipient) {
        if (recipient instanceof User user) {
            this.recipient = user;
            this.requesterRecipient = null;
        } else if (recipient instanceof RequesterUser requesterUser) {
            this.recipient = null;
            this.requesterRecipient = requesterUser;
        } else if (recipient == null) {
            this.recipient = null;
            this.requesterRecipient = null;
        } else {
            throw new IllegalArgumentException("Unsupported notification recipient type: " + recipient.getClass().getName());
        }
    }

    // Read state
    @Column(name = "is_read", nullable = false)
    private boolean isRead = false;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    // Soft delete (for inbox archive)
    @Column(name = "soft_deleted", nullable = false)
    private boolean softDeleted = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "channel", nullable = false, length = 20)
    private ChannelType channel = ChannelType.IN_APP;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private NotificationDeliveryStatus status;

    @Column(name = "retry_count", nullable = false)
    private int retryCount = 0;

    @Column(name = "next_retry_at")
    private LocalDateTime nextRetryAt;

    @Column(name = "last_error", length = 2000)
    private String lastError;

    @Column(name = "locked_by", length = 100)
    private String lockedBy;

    @Column(name = "locked_at")
    private LocalDateTime lockedAt;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "email_cc")
    private String emailCc;

    @Column(name = "email_bcc")
    private String emailBcc;

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
