package com.ticketingSystem.api.service;

import com.ticketingSystem.api.dto.PolicyDto;
import com.ticketingSystem.api.dto.PolicyRuleDto;
import com.ticketingSystem.api.exception.ResourceNotFoundException;
import com.ticketingSystem.api.models.AccessPolicy;
import com.ticketingSystem.api.models.PolicyRule;
import com.ticketingSystem.api.models.Role;
import com.ticketingSystem.api.models.RolePolicyMap;
import com.ticketingSystem.api.models.RolePolicyMapId;
import com.ticketingSystem.api.repository.AccessPolicyRepository;
import com.ticketingSystem.api.repository.PolicyRuleRepository;
import com.ticketingSystem.api.repository.RolePolicyMapRepository;
import com.ticketingSystem.api.repository.RoleRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class PolicyService {
    private final AccessPolicyRepository accessPolicyRepository;
    private final PolicyRuleRepository policyRuleRepository;
    private final RolePolicyMapRepository rolePolicyMapRepository;
    private final RoleRepository roleRepository;

    public PolicyService(AccessPolicyRepository accessPolicyRepository,
                         PolicyRuleRepository policyRuleRepository,
                         RolePolicyMapRepository rolePolicyMapRepository,
                         RoleRepository roleRepository) {
        this.accessPolicyRepository = accessPolicyRepository;
        this.policyRuleRepository = policyRuleRepository;
        this.rolePolicyMapRepository = rolePolicyMapRepository;
        this.roleRepository = roleRepository;
    }

    @Transactional
    public PolicyDto createPolicy(PolicyDto dto) {
        AccessPolicy policy = new AccessPolicy();
        policy.setCode(requireText(dto.getCode(), "policy code"));
        policy.setResource(requireText(dto.getResource(), "resource"));
        policy.setEffect(defaultText(dto.getEffect(), "allow"));
        policy.setDescription(dto.getDescription());
        policy.setActive(dto.getIsActive() == null || dto.getIsActive());
        LocalDateTime now = LocalDateTime.now();
        policy.setCreatedOn(now);
        policy.setUpdatedOn(now);
        policy.setCreatedBy(defaultText(dto.getUpdatedBy(), "SYSTEM"));
        policy.setUpdatedBy(defaultText(dto.getUpdatedBy(), "SYSTEM"));
        AccessPolicy saved = accessPolicyRepository.save(policy);
        saveRules(saved, dto.getRules());
        return toDto(saved);
    }

    @Transactional
    public PolicyDto updatePolicy(Integer policyId, PolicyDto dto) {
        AccessPolicy policy = accessPolicyRepository.findById(policyId)
                .orElseThrow(() -> new ResourceNotFoundException("Policy", policyId));
        if (dto.getCode() != null && !dto.getCode().isBlank()) {
            policy.setCode(dto.getCode().trim());
        }
        if (dto.getResource() != null && !dto.getResource().isBlank()) {
            policy.setResource(dto.getResource().trim());
        }
        if (dto.getEffect() != null && !dto.getEffect().isBlank()) {
            policy.setEffect(dto.getEffect().trim());
        }
        if (dto.getDescription() != null) {
            policy.setDescription(dto.getDescription());
        }
        if (dto.getIsActive() != null) {
            policy.setActive(dto.getIsActive());
        }
        policy.setUpdatedOn(LocalDateTime.now());
        policy.setUpdatedBy(defaultText(dto.getUpdatedBy(), "SYSTEM"));
        AccessPolicy saved = accessPolicyRepository.save(policy);

        if (dto.getRules() != null) {
            policyRuleRepository.deleteByPolicyPolicyId(policyId);
            saveRules(saved, dto.getRules());
        }
        return toDto(saved);
    }

    public PolicyDto getPolicy(Integer policyId) {
        AccessPolicy policy = accessPolicyRepository.findById(policyId)
                .orElseThrow(() -> new ResourceNotFoundException("Policy", policyId));
        return toDto(policy);
    }

    public List<PolicyDto> getPolicies(String resource) {
        List<AccessPolicy> policies = (resource == null || resource.isBlank())
                ? accessPolicyRepository.findAll()
                : accessPolicyRepository.findByResourceIgnoreCaseAndIsActiveTrue(resource.trim());
        return policies.stream().map(this::toDto).toList();
    }

    public List<PolicyDto> getPoliciesByPolicyIdsAndResource(List<Integer> policyIds, String resource) {
        List<AccessPolicy> accessPolicies = accessPolicyRepository.findByResourceIgnoreCaseAndPolicyIdInAndIsActiveTrue(resource, policyIds);
        return accessPolicies.stream().map(this::toDto).toList();
    }

    @Transactional
    public void assignPoliciesToRole(Integer roleId,
                                     List<Integer> policyIds,
                                     List<String> policyCodes,
                                     String updatedBy) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role", roleId));

        Set<Integer> resolvedPolicyIds = new LinkedHashSet<>();
        if (policyIds != null) {
            resolvedPolicyIds.addAll(policyIds.stream().filter(Objects::nonNull).toList());
        }
        if (policyCodes != null) {
            for (String code : policyCodes) {
                if (code == null || code.isBlank()) {
                    continue;
                }
                AccessPolicy policy = accessPolicyRepository.findByCodeIgnoreCase(code.trim())
                        .orElseThrow(() -> new ResourceNotFoundException("Policy code", code.trim()));
                resolvedPolicyIds.add(policy.getPolicyId());
            }
        }

        if (resolvedPolicyIds.isEmpty()) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();
        String actor = defaultText(updatedBy, "SYSTEM");

        for (Integer policyId : resolvedPolicyIds) {
            AccessPolicy policy = accessPolicyRepository.findById(policyId)
                    .orElseThrow(() -> new ResourceNotFoundException("Policy", policyId));
            RolePolicyMapId id = new RolePolicyMapId(role.getRoleId(), policy.getPolicyId());
            RolePolicyMap mapping = rolePolicyMapRepository.findById(id).orElseGet(() -> {
                RolePolicyMap created = new RolePolicyMap();
                created.setId(id);
                created.setRole(role);
                created.setPolicy(policy);
                created.setCreatedOn(now);
                created.setCreatedBy(actor);
                return created;
            });
            mapping.setRole(role);
            mapping.setPolicy(policy);
            mapping.setActive(true);
            mapping.setUpdatedOn(now);
            mapping.setUpdatedBy(actor);
            rolePolicyMapRepository.save(mapping);
        }
    }

    public List<PolicyDto> getRoleEffectivePolicies(Integer roleId) {
        List<RolePolicyMap> mappings = rolePolicyMapRepository.findByRoleRoleIdAndIsActiveTrue(roleId);
        return mappings.stream()
                .map(RolePolicyMap::getPolicy)
                .filter(Objects::nonNull)
                .map(this::toDto)
                .toList();
    }

    private void saveRules(AccessPolicy saved, List<PolicyRuleDto> rules) {
        if (rules == null) {
            return;
        }
        for (PolicyRuleDto ruleDto : rules) {
            PolicyRule rule = new PolicyRule();
            rule.setPolicy(saved);
            rule.setConditionKey(requireText(ruleDto.getConditionKey(), "conditionKey"));
            rule.setOperator(requireText(ruleDto.getOperator(), "operator"));
            rule.setConditionValue(ruleDto.getConditionValue());
            rule.setPriority(ruleDto.getPriority() != null ? ruleDto.getPriority() : 100);
            rule.setActive(ruleDto.getIsActive() == null || ruleDto.getIsActive());
            policyRuleRepository.save(rule);
        }
    }

    private PolicyDto toDto(AccessPolicy policy) {
        PolicyDto dto = new PolicyDto();
        dto.setPolicyId(policy.getPolicyId());
        dto.setCode(policy.getCode());
        dto.setResource(policy.getResource());
        dto.setEffect(policy.getEffect());
        dto.setDescription(policy.getDescription());
        dto.setIsActive(policy.isActive());

        List<PolicyRuleDto> rules = policyRuleRepository
                .findByPolicyPolicyIdAndIsActiveTrueOrderByPriorityAscRuleIdAsc(policy.getPolicyId())
                .stream()
                .map(this::toDto)
                .toList();
        dto.setRules(rules);
        return dto;
    }

    private PolicyRuleDto toDto(PolicyRule rule) {
        PolicyRuleDto dto = new PolicyRuleDto();
        dto.setRuleId(rule.getRuleId());
        dto.setConditionKey(rule.getConditionKey());
        dto.setOperator(rule.getOperator());
        dto.setConditionValue(rule.getConditionValue());
        dto.setPriority(rule.getPriority());
        dto.setIsActive(rule.isActive());
        return dto;
    }

    private String requireText(String value, String field) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(field + " is required");
        }
        return value.trim();
    }

    private String defaultText(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        return value.trim();
    }
}
