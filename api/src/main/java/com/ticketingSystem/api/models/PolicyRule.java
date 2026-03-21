package com.ticketingSystem.api.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "policy_rule")
@Getter
@Setter
public class PolicyRule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rule_id")
    private Integer ruleId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "policy_id", nullable = false)
    private AccessPolicy policy;

    @Column(name = "condition_key", nullable = false, length = 100)
    private String conditionKey;

    @Column(name = "operator", nullable = false, length = 50)
    private String operator;

    @Column(name = "condition_value", columnDefinition = "text")
    private String conditionValue;

    @Column(name = "priority")
    private Integer priority;

    @Column(name = "is_active")
    private boolean isActive = true;
}
