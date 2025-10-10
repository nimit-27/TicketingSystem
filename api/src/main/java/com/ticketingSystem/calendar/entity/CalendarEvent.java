package com.ticketingSystem.calendar.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "calendar_event", indexes = {
        @Index(name = "idx_calendar_event_start", columnList = "start_at"),
        @Index(name = "idx_calendar_event_end", columnList = "end_at"),
        @Index(name = "idx_calendar_event_all_day", columnList = "is_all_day")
})
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@ToString
public class CalendarEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "start_at", nullable = false)
    private LocalDateTime start;

    @Column(name = "end_at", nullable = false)
    private LocalDateTime end;

    @Column(name = "is_all_day", nullable = false)
    private boolean allDay;

    @Column(name = "background_color", length = 16)
    private String backgroundColor;

    @Column(name = "text_color", length = 16)
    private String textColor;

    @Lob
    @Column(name = "meta")
    private String meta;
}
