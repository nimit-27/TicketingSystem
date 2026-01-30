package com.ticketingSystem.notification.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "notification_master",
        uniqueConstraints = @UniqueConstraint(name = "uk_nm_code", columnNames = "code")
)
@Getter @Setter
public class NotificationMaster {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank
    private String code;

    @NotBlank
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "default_title_tpl")
    private String defaultTitleTpl;

    @Lob
    @Column(name = "default_message_tpl")
    private String defaultMessageTpl;

    @Column(name = "email_template")
    private String emailTemplate;

    @Column(name = "email_personalized", nullable = false)
    private Boolean emailPersonalized = Boolean.TRUE;

    @Column(name = "sms_template")
    private String smsTemplate;

    @Column(name = "inapp_template")
    private String inappTemplate;

    @Column(name = "default_channels", columnDefinition = "json")
    private String defaultChannels;

    @NotNull
    @Column(name = "is_active")
    private Boolean isActive = Boolean.TRUE;

    @Column(name = "created_at")
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
