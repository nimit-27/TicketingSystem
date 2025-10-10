package com.ticketingSystem.calendar.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "calendar_holiday", indexes = {
        @Index(name = "idx_calendar_holiday_date_region", columnList = "holiday_date, region")
}, uniqueConstraints = {
        @UniqueConstraint(name = "uq_calendar_holiday_date_region", columnNames = {"holiday_date", "region"})
})
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@ToString
public class Holiday {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "holiday_date", nullable = false)
    private LocalDate date;

    @Column(name = "name", nullable = false, length = 128)
    private String name;

    @Column(name = "region", nullable = false, length = 64)
    private String region;

    @Column(name = "is_optional", nullable = false)
    private boolean optional;
}
