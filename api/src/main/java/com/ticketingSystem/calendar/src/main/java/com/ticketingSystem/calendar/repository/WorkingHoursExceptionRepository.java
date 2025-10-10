package com.ticketingSystem.calendar.repository;

import com.ticketingSystem.calendar.entity.WorkingHoursException;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface WorkingHoursExceptionRepository extends JpaRepository<WorkingHoursException, Long> {

    @Query("select e from WorkingHoursException e where " +
           "(e.scope = 'DATE' and e.targetDate = :date) or " +
           "(e.scope = 'WEEKDAY' and e.weekday = :weekday) or " +
           "(e.scope = 'RANGE' and :date between e.startDate and e.endDate)")
    List<WorkingHoursException> findApplicable(@Param("date") LocalDate date, @Param("weekday") int weekday);

    @Query("select e from WorkingHoursException e where " +
           "(e.scope = 'DATE' and e.targetDate between :from and :to) or " +
           "(e.scope = 'RANGE' and (e.startDate between :from and :to or e.endDate between :from and :to))")
    List<WorkingHoursException> findDateScoped(@Param("from") LocalDate from, @Param("to") LocalDate to);
}
