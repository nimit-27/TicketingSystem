package com.ticketingSystem.calendar.service.support;

import com.ticketingSystem.calendar.entity.WorkingHoursException;
import com.ticketingSystem.calendar.entity.enums.WorkingHoursExceptionScope;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class ExceptionPolicyService {

    private static final Comparator<WorkingHoursException> PRIORITY_COMPARATOR = Comparator
            .comparingInt(WorkingHoursException::getPriority).reversed()
            .thenComparing((WorkingHoursException a, WorkingHoursException b) ->
                    Integer.compare(scopeWeight(b), scopeWeight(a)));

    public Optional<WorkingHoursException> resolve(LocalDate date, List<WorkingHoursException> exceptions) {
        return exceptions.stream()
                .filter(ex -> matches(date, ex))
                .sorted(PRIORITY_COMPARATOR)
                .findFirst();
    }

    private boolean matches(LocalDate date, WorkingHoursException exception) {
        return switch (exception.getScope()) {
            case DATE -> date.equals(exception.getTargetDate());
            case WEEKDAY -> date.getDayOfWeek().getValue() == exception.getWeekday();
            case RANGE -> (exception.getStartDate() == null || !date.isBefore(exception.getStartDate()))
                    && (exception.getEndDate() == null || !date.isAfter(exception.getEndDate()));
        };
    }

    private static int scopeWeight(WorkingHoursException exception) {
        WorkingHoursExceptionScope scope = exception.getScope();
        return switch (scope) {
            case DATE -> 3;
            case RANGE -> 2;
            case WEEKDAY -> 1;
        };
    }
}
