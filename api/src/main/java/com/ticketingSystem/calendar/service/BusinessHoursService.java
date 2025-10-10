package com.ticketingSystem.calendar.service;

import com.ticketingSystem.calendar.dto.BusinessHoursDto;
import com.ticketingSystem.calendar.entity.WorkingHours;
import com.ticketingSystem.calendar.entity.WorkingHoursException;
import com.ticketingSystem.calendar.repository.WorkingHoursExceptionRepository;
import com.ticketingSystem.calendar.repository.WorkingHoursRepository;
import com.ticketingSystem.calendar.service.model.WorkingWindow;
import com.ticketingSystem.calendar.service.support.ExceptionPolicyService;
import com.ticketingSystem.calendar.util.TimeUtils;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class BusinessHoursService {

    private final WorkingHoursRepository workingHoursRepository;
    private final WorkingHoursExceptionRepository exceptionRepository;
    private final ExceptionPolicyService exceptionPolicyService;

    public BusinessHoursService(WorkingHoursRepository workingHoursRepository,
                                WorkingHoursExceptionRepository exceptionRepository,
                                ExceptionPolicyService exceptionPolicyService) {
        this.workingHoursRepository = workingHoursRepository;
        this.exceptionRepository = exceptionRepository;
        this.exceptionPolicyService = exceptionPolicyService;
    }

    public WorkingWindow resolveWindow(LocalDate date) {
        WorkingHours defaultHours = workingHoursRepository.findFirstByActiveTrueOrderByIdDesc()
                .orElseThrow(() -> new IllegalStateException("No default working hours configured"));
        List<WorkingHoursException> applicable = exceptionRepository.findApplicable(date, date.getDayOfWeek().getValue());
        Optional<WorkingHoursException> override = exceptionPolicyService.resolve(date, applicable);
        if (override.isPresent()) {
            WorkingHoursException exception = override.get();
            if (exception.isClosed()) {
                return WorkingWindow.closedDay();
            }
            LocalTime start = Optional.ofNullable(exception.getStartTime()).orElse(defaultHours.getStartTime());
            LocalTime end = Optional.ofNullable(exception.getEndTime()).orElse(defaultHours.getEndTime());
            return new WorkingWindow(start, end, false);
        }
        return new WorkingWindow(defaultHours.getStartTime(), defaultHours.getEndTime(), false);
    }

    public List<BusinessHoursDto> resolveBusinessHoursForRange(LocalDate from, LocalDate to) {
        List<BusinessHoursDto> result = new ArrayList<>();
        WorkingHours defaultHours = workingHoursRepository.findFirstByActiveTrueOrderByIdDesc()
                .orElseThrow(() -> new IllegalStateException("No default working hours configured"));
        int[] isoDays = new int[]{1, 2, 3, 4, 5, 6, 7};
        result.add(new BusinessHoursDto(
                TimeUtils.toMinutes(defaultHours.getStartTime()),
                TimeUtils.toMinutes(defaultHours.getEndTime()),
                toIntegerArray(isoDays)
        ));

        LocalDate cursor = from;
        while (!cursor.isAfter(to)) {
            List<WorkingHoursException> applicable = exceptionRepository.findApplicable(cursor, cursor.getDayOfWeek().getValue());
            LocalDate finalCursor = cursor;
            exceptionPolicyService.resolve(cursor, applicable).ifPresent(exception -> {
                if (exception.isClosed()) {
                    result.add(new BusinessHoursDto(null, null, new Integer[]{finalCursor.getDayOfWeek().getValue()}));
                } else {
                    WorkingWindow window = resolveWindow(finalCursor);
                    result.add(new BusinessHoursDto(
                            TimeUtils.toMinutes(window.startTime()),
                            TimeUtils.toMinutes(window.endTime()),
                            new Integer[]{finalCursor.getDayOfWeek().getValue()}
                    ));
                }
            });
            cursor = cursor.plusDays(1);
        }
        return result;
    }

    private Integer[] toIntegerArray(int[] isoDays) {
        Integer[] days = new Integer[isoDays.length];
        for (int i = 0; i < isoDays.length; i++) {
            days[i] = isoDays[i];
        }
        return days;
    }
}
