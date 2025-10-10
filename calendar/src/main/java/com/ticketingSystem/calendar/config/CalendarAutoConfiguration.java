package com.ticketingSystem.calendar.config;

import com.ticketingSystem.calendar.util.TimeUtils;
import jakarta.annotation.PostConstruct;
import java.time.ZoneId;
import java.util.TimeZone;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.boot.autoconfigure.domain.EntityScan;

@Configuration
@ComponentScan(basePackages = "com.ticketingSystem.calendar")
@EntityScan(basePackages = "com.ticketingSystem.calendar.entity")
@EnableJpaRepositories(basePackages = "com.ticketingSystem.calendar.repository")
public class CalendarAutoConfiguration {

    @PostConstruct
    public void initialiseTimezone() {
        TimeZone.setDefault(TimeZone.getTimeZone(TimeUtils.ZONE_ID));
    }

    @Bean
    @ConditionalOnMissingBean
    public ZoneId calendarZoneId() {
        return TimeUtils.ZONE_ID;
    }
}
