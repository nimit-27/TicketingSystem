package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.models.PolicyRule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PolicyRuleRepository extends JpaRepository<PolicyRule, Integer> {
    List<PolicyRule> findByPolicyPolicyIdAndIsActiveTrueOrderByPriorityAscRuleIdAsc(Integer policyId);
    void deleteByPolicyPolicyId(Integer policyId);
}
