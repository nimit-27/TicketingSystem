package com.ticketingSystem.calendar.repository;

import com.ticketingSystem.calendar.entity.Holiday;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface HolidayRepository extends JpaRepository<Holiday, Long> {

    List<Holiday> findByDateBetween(LocalDate from, LocalDate to);

    List<Holiday> findByDateBetweenAndRegion(LocalDate from, LocalDate to, String region);

    boolean existsByDateBetweenAndRegion(LocalDate from, LocalDate to, String region);

    Optional<Holiday> findByDateAndRegion(LocalDate date, String region);

    @Query("select h from Holiday h where h.date between :from and :to and h.region in :regions")
    List<Holiday> findByDateRangeAndRegions(@Param("from") LocalDate from,
                                            @Param("to") LocalDate to,
                                            @Param("regions") List<String> regions);
}
