package com.ticketingSystem.calendar.controller;

import com.ticketingSystem.calendar.dto.UpsertHolidaysRequest;
import com.ticketingSystem.calendar.dto.UpsertWorkingHoursExceptionRequest;
import com.ticketingSystem.calendar.dto.UpsertWorkingHoursRequest;
import com.ticketingSystem.calendar.facade.ExternalCalendarFacade;
import com.ticketingSystem.calendar.service.HolidayAdminService;
import com.ticketingSystem.calendar.service.WorkingHoursAdminService;
import com.ticketingSystem.calendar.service.WorkingHoursExceptionAdminService;
import jakarta.validation.Valid;
import java.time.Year;
import java.util.Map;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/calendar/admin")
@Validated
public class CalendarAdminController {

    private final HolidayAdminService holidayAdminService;
    private final WorkingHoursAdminService workingHoursAdminService;
    private final WorkingHoursExceptionAdminService workingHoursExceptionAdminService;
    private final ExternalCalendarFacade externalCalendarFacade;

    public CalendarAdminController(HolidayAdminService holidayAdminService,
                                   WorkingHoursAdminService workingHoursAdminService,
                                   WorkingHoursExceptionAdminService workingHoursExceptionAdminService,
                                   ExternalCalendarFacade externalCalendarFacade) {
        this.holidayAdminService = holidayAdminService;
        this.workingHoursAdminService = workingHoursAdminService;
        this.workingHoursExceptionAdminService = workingHoursExceptionAdminService;
        this.externalCalendarFacade = externalCalendarFacade;
    }

    @PostMapping("/holidays:upsert")
    public Map<String, Object> upsertHolidays(@Valid @RequestBody UpsertHolidaysRequest request) {
        int count = holidayAdminService.upsertHolidays(request);
        return Map.of("updated", count);
    }

    @PostMapping("/working-hours:upsert")
    public Map<String, Object> upsertWorkingHours(@Valid @RequestBody UpsertWorkingHoursRequest request) {
        return Map.of("id", workingHoursAdminService.upsert(request).getId());
    }

    @PostMapping("/exceptions:upsert")
    public Map<String, Object> upsertException(@Valid @RequestBody UpsertWorkingHoursExceptionRequest request) {
        return Map.of("id", workingHoursExceptionAdminService.upsert(request).getId());
    }

    @DeleteMapping("/exceptions/{id}")
    public void deleteException(@PathVariable Long id) {
        workingHoursExceptionAdminService.delete(id);
    }

    @PostMapping("/providers/{providerCode}:sync")
    public Map<String, Object> sync(@PathVariable String providerCode,
                                    @RequestParam("year") int year,
                                    @RequestParam(value = "region", required = false) String region) {
        int count = externalCalendarFacade.sync(providerCode, Year.of(year), region);
        return Map.of("synced", count);
    }
}
