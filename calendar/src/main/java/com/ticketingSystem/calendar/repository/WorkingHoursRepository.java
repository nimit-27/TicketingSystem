package com.ticketingSystem.calendar.repository;

import com.ticketingSystem.calendar.entity.WorkingHours;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkingHoursRepository extends JpaRepository<WorkingHours, Long> {

    Optional<WorkingHours> findFirstByActiveTrueOrderByIdDesc();
}
