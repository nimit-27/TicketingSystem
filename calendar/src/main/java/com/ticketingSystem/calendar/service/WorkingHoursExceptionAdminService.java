package com.ticketingSystem.calendar.service;

import com.ticketingSystem.calendar.dto.UpsertWorkingHoursExceptionRequest;
import com.ticketingSystem.calendar.entity.WorkingHoursException;
import com.ticketingSystem.calendar.repository.WorkingHoursExceptionRepository;
import com.ticketingSystem.calendar.util.TimeUtils;
import java.time.LocalTime;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WorkingHoursExceptionAdminService {

    private final WorkingHoursExceptionRepository repository;

    public WorkingHoursExceptionAdminService(WorkingHoursExceptionRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public WorkingHoursException upsert(UpsertWorkingHoursExceptionRequest request) {
        WorkingHoursException entity = request.id() != null
                ? repository.findById(request.id()).orElse(new WorkingHoursException())
                : new WorkingHoursException();
        LocalTime start = request.startTime() != null ? TimeUtils.parseLocalTime(request.startTime()) : null;
        LocalTime end = request.endTime() != null ? TimeUtils.parseLocalTime(request.endTime()) : null;
        if (start != null && end != null && !start.isBefore(end)) {
            throw new IllegalArgumentException("Start time must be before end time");
        }
        if (request.weekday() != null && (request.weekday() < 1 || request.weekday() > 7)) {
            throw new IllegalArgumentException("Weekday must be between 1 (Mon) and 7 (Sun)");
        }
        entity = WorkingHoursException.builder()
                .id(entity.getId())
                .scope(request.scope())
                .targetDate(request.targetDate())
                .weekday(request.weekday())
                .startDate(request.startDate())
                .endDate(request.endDate())
                .startTime(start)
                .endTime(end)
                .closed(Boolean.TRUE.equals(request.closed()))
                .priority(request.priority())
                .note(request.note())
                .build();
        return repository.save(entity);
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
    }
}
