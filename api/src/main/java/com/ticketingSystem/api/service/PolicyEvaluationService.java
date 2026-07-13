package com.ticketingSystem.api.service;

import com.ticketingSystem.api.dto.LoginPayload;
import com.ticketingSystem.api.dto.PolicyDto;
import com.ticketingSystem.api.models.AccessPolicy;
import com.ticketingSystem.api.models.PolicyRule;
import com.ticketingSystem.api.models.Role;
import com.ticketingSystem.api.models.RolePolicyMap;
import com.ticketingSystem.api.repository.PolicyRuleRepository;
import com.ticketingSystem.api.repository.RolePolicyMapRepository;
import com.ticketingSystem.api.repository.RoleRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class PolicyEvaluationService {
    private static final String RESOURCE_TICKET = "ticket";

    private final RolePolicyMapRepository rolePolicyMapRepository;
    private final PolicyRuleRepository policyRuleRepository;
    private final RoleRepository roleRepository;
    private final PolicyService policyService;

    public PolicyEvaluationService(RolePolicyMapRepository rolePolicyMapRepository,
                                   PolicyRuleRepository policyRuleRepository,
                                   RoleRepository roleRepository, PolicyService policyService) {
        this.rolePolicyMapRepository = rolePolicyMapRepository;
        this.policyRuleRepository = policyRuleRepository;
        this.roleRepository = roleRepository;
        this.policyService = policyService;
    }

    public PolicyDecision evaluateTicketView(List<String> roleIdentifiers,
                                             LoginPayload user,
                                             TicketAccessContext ticketContext) {
        Set<Integer> roleIds = resolveRoleIds(roleIdentifiers);
        if (roleIds.isEmpty()) {
            return PolicyDecision.ABSTAIN;
        }

        List<RolePolicyMap> mappings = rolePolicyMapRepository.findByRoleRoleIdInAndIsActiveTrue(roleIds);
        if (mappings.isEmpty()) {
            return PolicyDecision.ABSTAIN;
        }

        boolean hasAllow = false;
        for (RolePolicyMap mapping : mappings) {
            AccessPolicy policy = mapping.getPolicy();
            if (policy == null || !policy.isActive() || policy.getResource() == null
                    || !RESOURCE_TICKET.equalsIgnoreCase(policy.getResource())) {
                continue;
            }

            List<PolicyRule> rules = policyRuleRepository
                    .findByPolicyPolicyIdAndIsActiveTrueOrderByPriorityAscRuleIdAsc(policy.getPolicyId());
            boolean matches = rules.isEmpty() || rules.stream().allMatch(rule -> evaluateRule(rule, user, ticketContext));
            if (!matches) {
                continue;
            }

            if ("deny".equalsIgnoreCase(policy.getEffect())) {
                return PolicyDecision.DENY;
            }
            hasAllow = true;
        }
        return hasAllow ? PolicyDecision.ALLOW : PolicyDecision.ABSTAIN;
    }

    public boolean hasResourceAccess(Authentication authentication, String resource) {
        if (authentication == null || !authentication.isAuthenticated() || resource == null || resource.isBlank()) {
            return false;
        }

        Set<Integer> roleIds = resolveRoleIds(resolveRoleIdentifiers(authentication));
        if (roleIds.isEmpty()) {
            return false;
        }

        List<RolePolicyMap> mappings = rolePolicyMapRepository.findByRoleRoleIdInAndIsActiveTrue(roleIds);
        if (mappings.isEmpty()) {
            return false;
        }

        boolean hasAllow = false;
        for (RolePolicyMap mapping : mappings) {
            AccessPolicy policy = mapping.getPolicy();
            if (policy == null || !policy.isActive() || policy.getResource() == null
                    || !resource.equalsIgnoreCase(policy.getResource())) {
                continue;
            }

            if ("deny".equalsIgnoreCase(policy.getEffect())) {
                return false;
            }
            if ("allow".equalsIgnoreCase(policy.getEffect())) {
                hasAllow = true;
            }
        }
        return hasAllow;
    }

    public List<PolicyRule> resolveScopedParams(LoginPayload authenticatedUser, Map<String, String> allParams) {
        List<String> roles = authenticatedUser.getRoles();
        List<Integer> rolesInteger = roles.stream().map(Integer::valueOf).toList();
        List<RolePolicyMap> rolePolicyMapList = rolePolicyMapRepository.findByRoleRoleIdInAndIsActiveTrue(rolesInteger);
        List<Integer> policyIds = rolePolicyMapList.stream().map(item -> item.getId().getPolicyId()).toList();
        List<PolicyDto> accessPolicies = policyService.getPoliciesByPolicyIdsAndResource(policyIds, "downloads");
        List<Integer> filteredPolicyIds = accessPolicies.stream().map(PolicyDto::getPolicyId).toList();
        return policyRuleRepository.findByPolicyPolicyIdInAndIsActiveTrueOrderByPriorityAscRuleIdAsc(filteredPolicyIds);
    }

    private List<String> resolveRoleIdentifiers(Authentication authentication) {
        Object principal = authentication.getPrincipal();
        if (principal instanceof LoginPayload loginPayload && loginPayload.getRoles() != null) {
            return loginPayload.getRoles();
        }

        return authentication.getAuthorities().stream()
                .map(authority -> authority.getAuthority())
                .filter(Objects::nonNull)
                .map(authority -> authority.startsWith("ROLE_") ? authority.substring("ROLE_".length()) : authority)
                .collect(Collectors.toList());
    }

    private boolean evaluateRule(PolicyRule rule, LoginPayload user, TicketAccessContext ticketContext) {
        if (rule == null) {
            return false;
        }
        String operator = safe(rule.getOperator()).toUpperCase(Locale.ROOT);
        String leftValue = resolveLeftValue(safe(rule.getConditionKey()), user, ticketContext);
        String conditionValue = safe(rule.getConditionValue());

        return switch (operator) {
            case "ALWAYS_TRUE" -> true;
            case "EQ" -> leftValue.equalsIgnoreCase(resolveRightValue(conditionValue, user, ticketContext));
            case "IN" -> splitValues(conditionValue).contains(leftValue.toLowerCase(Locale.ROOT));
            case "IN_CONTEXT" -> splitValues(resolveRightValue(conditionValue, user, ticketContext))
                    .contains(leftValue.toLowerCase(Locale.ROOT));
            default -> false;
        };
    }

    private String resolveLeftValue(String key, LoginPayload user, TicketAccessContext ticketContext) {
        return switch (key) {
            case "ticket.owner_id" -> safe(ticketContext != null ? ticketContext.ticketOwnerId() : null);
            case "ticket.assigned_to" -> safe(ticketContext != null ? ticketContext.ticketAssigneeUserId() : null);
            case "ticket.status" -> safe(ticketContext != null && ticketContext.ticketStatus() != null
                    ? ticketContext.ticketStatus().name() : null);
            case "ticket.zone_id" -> safe(ticketContext != null ? ticketContext.ticketZoneId() : null);
            case "ticket.recommended_severity_status" -> safe(ticketContext != null ? ticketContext.recommendedSeverityStatus() : null);
            case "user.user_id" -> safe(user != null ? user.getUserId() : null);
            case "user.zone_code" -> safe(user != null ? user.getZoneCode() : null);
            default -> "";
        };
    }

    private String resolveRightValue(String keyOrLiteral, LoginPayload user, TicketAccessContext ticketContext) {
        return switch (safe(keyOrLiteral)) {
            case "user.user_id" -> safe(user != null ? user.getUserId() : null);
            case "user.zone_ids", "user.zone_code" -> safe(user != null ? user.getZoneCode() : null);
            case "ticket.status" -> safe(ticketContext != null && ticketContext.ticketStatus() != null
                    ? ticketContext.ticketStatus().name() : null);
            case "ticket.zone_id" -> safe(ticketContext != null ? ticketContext.ticketZoneId() : null);
            default -> safe(keyOrLiteral);
        };
    }

    private Set<Integer> resolveRoleIds(List<String> roleIdentifiers) {
        Set<Integer> roleIds = new LinkedHashSet<>();
        if (roleIdentifiers == null) {
            return roleIds;
        }

        for (String raw : roleIdentifiers) {
            if (raw == null || raw.isBlank()) {
                continue;
            }
            String value = raw.trim();
            try {
                roleIds.add(Integer.parseInt(value));
                continue;
            } catch (NumberFormatException ignored) {
            }

            Optional<Role> roleOptional = roleRepository.findByRoleIgnoreCaseAndIsDeletedFalse(value);
            roleOptional.map(Role::getRoleId).ifPresent(roleIds::add);
        }
        return roleIds;
    }

    private Set<String> splitValues(String csvOrSingle) {
        if (csvOrSingle == null || csvOrSingle.isBlank()) {
            return Set.of();
        }
        String normalized = csvOrSingle.trim();
        if (normalized.startsWith("[") && normalized.endsWith("]")) {
            normalized = normalized.substring(1, normalized.length() - 1);
        }
        String[] parts = normalized.split(",");
        Set<String> out = new LinkedHashSet<>();
        for (String part : parts) {
            String clean = part.replace("\"", "").trim().toLowerCase(Locale.ROOT);
            if (!clean.isEmpty()) {
                out.add(clean);
            }
        }
        return out;
    }

    private String safe(String value) {
        return value == null ? "" : value.trim();
    }
}
