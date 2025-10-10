package com.ticketingSystem.calendar.repository;

import com.ticketingSystem.calendar.entity.CalendarEvent;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CalendarEventRepository extends JpaRepository<CalendarEvent, Long> {

    @Query("select e from CalendarEvent e where e.start <= :to and e.end >= :from")
    List<CalendarEvent> findOverlapping(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);
}
