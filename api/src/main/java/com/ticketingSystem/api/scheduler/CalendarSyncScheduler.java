package com.ticketingSystem.api.scheduler;

import com.ticketingSystem.api.config.CalendarUiProperties;
import com.ticketingSystem.api.service.CalendarSyncService;
import com.ticketingSystem.calendar.util.TimeUtils;
import java.time.Year;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class CalendarSyncScheduler {

    private static final Logger log = LoggerFactory.getLogger(CalendarSyncScheduler.class);

    private final CalendarSyncService calendarSyncService;
    private final CalendarUiProperties properties;

    public CalendarSyncScheduler(CalendarSyncService calendarSyncService,
                                 CalendarUiProperties properties) {
        this.calendarSyncService = calendarSyncService;
        this.properties = properties;
    }

    @Scheduled(cron = "0 0 0 * * *", zone = "Asia/Kolkata")
    public void syncDaily() {
        if (!properties.isSchedulerEnabled()) {
            return;
        }

        Year current = Year.now(TimeUtils.ZONE_ID);
        int horizon = Math.max(0, properties.getSchedulerHorizonYears());
        for (int offset = 0; offset <= horizon; offset++) {
            Year targetYear = current.plusYears(offset);
            log.debug("Running scheduled holiday sync for year {}", targetYear);
            calendarSyncService.syncYear(targetYear);
        }
    }
}
