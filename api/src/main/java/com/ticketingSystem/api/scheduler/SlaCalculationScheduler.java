package com.ticketingSystem.api.scheduler;

import com.ticketingSystem.api.service.SlaCalculationJobService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class SlaCalculationScheduler {
    private final SlaCalculationJobService slaCalculationJobService;

    public SlaCalculationScheduler(SlaCalculationJobService slaCalculationJobService) {
        this.slaCalculationJobService = slaCalculationJobService;
    }

    @Scheduled(cron = "${app.sla-calculation-job.cron:0 0 */4 * * *}", zone = "${app.sla-calculation-job.zone:Asia/Kolkata}")
    public void runScheduledSlaCalculation() {
        if (!slaCalculationJobService.isSchedulerEnabled()) {
            return;
        }
        slaCalculationJobService.triggerScheduled();
    }
}
