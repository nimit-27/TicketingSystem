package com.ticketingSystem.api.config;

import com.ticketingSystem.calendar.external.provider.NagerDateProvider;
import com.ticketingSystem.calendar.util.TimeUtils;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "calendar.ui")
public class CalendarUiProperties {

    private String providerCode = NagerDateProvider.CODE;
    private String region = TimeUtils.DEFAULT_REGION;
    private boolean ensureOnDemand = true;
    private boolean schedulerEnabled = true;
    private int schedulerHorizonYears = 1;

    public String getProviderCode() {
        return providerCode;
    }

    public void setProviderCode(String providerCode) {
        this.providerCode = providerCode;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public boolean isEnsureOnDemand() {
        return ensureOnDemand;
    }

    public void setEnsureOnDemand(boolean ensureOnDemand) {
        this.ensureOnDemand = ensureOnDemand;
    }

    public boolean isSchedulerEnabled() {
        return schedulerEnabled;
    }

    public void setSchedulerEnabled(boolean schedulerEnabled) {
        this.schedulerEnabled = schedulerEnabled;
    }

    public int getSchedulerHorizonYears() {
        return schedulerHorizonYears;
    }

    public void setSchedulerHorizonYears(int schedulerHorizonYears) {
        this.schedulerHorizonYears = schedulerHorizonYears;
    }
}
