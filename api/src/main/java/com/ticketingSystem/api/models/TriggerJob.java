package com.ticketingSystem.api.models;

import com.ticketingSystem.api.enums.TriggerPeriod;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "trigger_job")
@Data
public class TriggerJob {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "trigger_job_id")
    private Long triggerJobId;

    @Column(name = "trigger_job_code", nullable = false, unique = true, length = 80)
    private String triggerJobCode;

    @Column(name = "trigger_job_name", nullable = false, length = 120)
    private String triggerJobName;

    @Column(name = "batch_size", nullable = false)
    private Integer batchSize;

    @Enumerated(EnumType.STRING)
    @Column(name = "trigger_period", nullable = false, length = 20)
    private TriggerPeriod triggerPeriod;

    @Column(name = "cron_expression", length = 120)
    private String cronExpression;

    @Column(name = "running", nullable = false)
    private Boolean running;
}
