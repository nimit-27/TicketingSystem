package com.ticketingSystem.calendar.service;

import com.ticketingSystem.calendar.dto.UpsertHolidaysRequest;
import com.ticketingSystem.calendar.entity.Holiday;
import com.ticketingSystem.calendar.repository.HolidayRepository;
import com.ticketingSystem.calendar.util.TimeUtils;
import java.time.LocalDate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class HolidayAdminService {

    private final HolidayRepository holidayRepository;

    public HolidayAdminService(HolidayRepository holidayRepository) {
        this.holidayRepository = holidayRepository;
    }

    @Transactional
    public int upsertHolidays(UpsertHolidaysRequest request) {
        String region = request.region() != null ? request.region() : TimeUtils.DEFAULT_REGION;
        Boolean optionalFlag = request.optional();
        int count = 0;
        for (LocalDate date : request.dates()) {
            Holiday holiday = holidayRepository.findByDateAndRegion(date, region)
                    .map(existing -> update(existing, request.name(), optionalFlag))
                    .orElseGet(() -> newHoliday(date, region, request.name(), optionalFlag));
            holidayRepository.save(holiday);
            count++;
        }
        return count;
    }

    @Transactional
    public void upsertHoliday(Holiday holiday) {
        Holiday existing = holidayRepository.findByDateAndRegion(holiday.getDate(), holiday.getRegion())
                .orElse(null);
        Holiday toPersist = existing == null ? holiday : Holiday.builder()
                .id(existing.getId())
                .date(existing.getDate())
                .name(holiday.getName())
                .region(holiday.getRegion())
                .optional(holiday.isOptional())
                .build();
        holidayRepository.save(toPersist);
    }

    private Holiday update(Holiday holiday, String name, Boolean optional) {
        return Holiday.builder()
                .id(holiday.getId())
                .date(holiday.getDate())
                .name(name != null ? name : holiday.getName())
                .region(holiday.getRegion())
                .optional(optional != null ? optional : holiday.isOptional())
                .build();
    }

    private Holiday newHoliday(LocalDate date, String region, String name, Boolean optional) {
        return Holiday.builder()
                .date(date)
                .name(name != null ? name : "Holiday")
                .region(region)
                .optional(optional != null ? optional : false)
                .build();
    }
}
