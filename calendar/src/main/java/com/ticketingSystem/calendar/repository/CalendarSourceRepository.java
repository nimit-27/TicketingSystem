package com.ticketingSystem.calendar.repository;

import com.ticketingSystem.calendar.entity.CalendarSource;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CalendarSourceRepository extends JpaRepository<CalendarSource, Long> {

    Optional<CalendarSource> findByProviderCodeAndEnabledTrue(String providerCode);
}
