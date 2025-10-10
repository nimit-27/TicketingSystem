package com.ticketingSystem.calendar.entity;

import com.ticketingSystem.calendar.entity.enums.WorkingHoursExceptionScope;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.LocalTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "calendar_working_hours_exception", indexes = {
        @Index(name = "idx_calendar_working_hours_exception_scope", columnList = "scope"),
        @Index(name = "idx_calendar_working_hours_exception_date", columnList = "target_date"),
        @Index(name = "idx_calendar_working_hours_exception_weekday", columnList = "weekday"),
        @Index(name = "idx_calendar_working_hours_exception_range", columnList = "start_date, end_date")
})
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@ToString
public class WorkingHoursException {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "scope", nullable = false, length = 16)
    private WorkingHoursExceptionScope scope;

    @Column(name = "target_date")
    private LocalDate targetDate;

    @Column(name = "weekday")
    private Integer weekday;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(name = "is_closed", nullable = false)
    private boolean closed;

    @Column(name = "priority", nullable = false)
    private int priority;

    @Column(name = "note", length = 255)
    private String note;
}
