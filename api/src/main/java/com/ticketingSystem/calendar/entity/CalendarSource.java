package com.ticketingSystem.calendar.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "calendar_source", indexes = {
        @Index(name = "idx_calendar_source_enabled", columnList = "enabled")
}, uniqueConstraints = {
        @UniqueConstraint(name = "uq_calendar_source_provider", columnNames = {"provider_code"})
})
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@ToString
public class CalendarSource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "provider_code", nullable = false, length = 64)
    private String providerCode;

    @Column(name = "base_url", nullable = false, length = 255)
    private String baseUrl;

    @Column(name = "api_key", length = 255)
    private String apiKey;

    @Column(name = "enabled", nullable = false)
    private boolean enabled;
}
