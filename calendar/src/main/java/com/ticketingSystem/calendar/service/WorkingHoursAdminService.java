package com.ticketingSystem.calendar.service;

import com.ticketingSystem.calendar.dto.UpsertWorkingHoursRequest;
import com.ticketingSystem.calendar.entity.WorkingHours;
import com.ticketingSystem.calendar.repository.WorkingHoursRepository;
import com.ticketingSystem.calendar.util.TimeUtils;
import java.time.LocalTime;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WorkingHoursAdminService {

    private final WorkingHoursRepository workingHoursRepository;

    public WorkingHoursAdminService(WorkingHoursRepository workingHoursRepository) {
        this.workingHoursRepository = workingHoursRepository;
    }

    @Transactional
    public WorkingHours upsert(UpsertWorkingHoursRequest request) {
        LocalTime start = TimeUtils.parseLocalTime(request.startTime());
        LocalTime end = TimeUtils.parseLocalTime(request.endTime());
        if (!start.isBefore(end)) {
            throw new IllegalArgumentException("Start time must be before end time");
        }
        WorkingHours existing = workingHoursRepository.findFirstByActiveTrueOrderByIdDesc().orElse(null);
        String timezone = request.timezone() != null ? request.timezone() : TimeUtils.ZONE_ID.getId();
        if (existing != null) {
            existing = WorkingHours.builder()
                    .id(existing.getId())
                    .startTime(start)
                    .endTime(end)
                    .timezone(timezone)
                    .active(true)
                    .build();
        } else {
            existing = WorkingHours.builder()
                    .startTime(start)
                    .endTime(end)
                    .timezone(timezone)
                    .active(true)
                    .build();
        }
        return workingHoursRepository.save(existing);
    }
}
