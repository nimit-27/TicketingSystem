package com.ticketingSystem.api.service;

import com.ticketingSystem.api.dto.LoginPayload;
import com.ticketingSystem.api.enums.TicketStatus;
import com.ticketingSystem.api.util.RoleUtils;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Service
public class TicketAuthorizationService {

    private static final List<String> IT_MANAGER_ROLE_IDENTIFIERS = List.of(
            "it manager",
            "it_manager",
            "itmanager"
    );

    private static final List<AccessRule> ROLE_ACCESS_RULES = List.of(
            new AccessRule(
                    IT_MANAGER_ROLE_IDENTIFIERS,
                    context -> context.hasStatus(TicketStatus.AWAITING_ESCALATION_APPROVAL)
                            || context.hasPendingRecommendedSeverity()
            )
    );

    public void assertCanAccessTicket(String ticketId,
                                      TicketAccessContext accessContext,
                                      LoginPayload authenticatedUser,
                                      HttpSession session) {
        TicketAccessContext context = accessContext != null
                ? accessContext
                : TicketAccessContext.basic(null, null);

        List<String> roles = resolveRoles(authenticatedUser, session);
        List<String> normalizedRoles = normalizeRoles(roles);
        if (RoleUtils.hasUnrestrictedTicketAccess(roles) || hasRoleBasedAccess(normalizedRoles, context)) {
            return;
        }

        String requesterId = resolveUserId(authenticatedUser, session);
        boolean ownsTicket = context.ticketOwnerId() != null && context.ticketOwnerId().equalsIgnoreCase(requesterId);
        boolean assignedToTicket = context.ticketAssigneeUserId() != null && context.ticketAssigneeUserId().equalsIgnoreCase(requesterId);
        boolean creatorOfTicket = context.ticketCreatedBy() != null && context.ticketCreatedBy().equals(requesterId);
        boolean isAccessibleByStatus = roles.contains("9") &&
                (context.ticketStatus() == TicketStatus.AWAITING_ESCALATION_APPROVAL
                || context.ticketStatus() == TicketStatus.ESCALATED);
        if (requesterId == null || (!ownsTicket && !assignedToTicket && !creatorOfTicket && !isAccessibleByStatus)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    String.format("Access to ticket %s is not allowed", ticketId)
            );
        }
    }

    private List<String> resolveRoles(LoginPayload authenticatedUser, HttpSession session) {
        if (authenticatedUser != null && authenticatedUser.getRoles() != null) {
            return authenticatedUser.getRoles();
        }
        if (session != null) {
            Object rolesAttr = session.getAttribute("roles");
            if (rolesAttr instanceof String rolesString) {
                return Arrays.stream(rolesString.split("\\|"))
                        .map(String::trim)
                        .filter(role -> !role.isEmpty())
                        .toList();
            }
        }
        return Collections.emptyList();
    }

    public String resolveUserId(LoginPayload authenticatedUser, HttpSession session) {
        if (authenticatedUser != null && authenticatedUser.getUserId() != null && !authenticatedUser.getUserId().isBlank()) {
            return authenticatedUser.getUserId();
        }
        if (session != null) {
            Object userIdAttr = session.getAttribute("userId");
            if (userIdAttr instanceof String s && !s.isBlank()) {
                return s;
            }
        }
        return null;
    }

    private boolean hasRoleBasedAccess(List<String> normalizedRoles, TicketAccessContext context) {
        if (normalizedRoles == null || normalizedRoles.isEmpty() || context == null) {
            return false;
        }
        return ROLE_ACCESS_RULES.stream()
                .anyMatch(rule -> rule.matches(normalizedRoles) && rule.isSatisfied(context));
    }

    private List<String> normalizeRoles(List<String> roles) {
        if (roles == null) {
            return Collections.emptyList();
        }
        return roles.stream()
                .filter(role -> role != null && !role.isBlank())
                .map(String::trim)
                .map(String::toLowerCase)
                .toList();
    }

    private record AccessRule(List<String> roleIdentifiers, java.util.function.Predicate<TicketAccessContext> condition) {
        boolean matches(List<String> normalizedRoles) {
            if (normalizedRoles == null) {
                return false;
            }
            return normalizedRoles.stream().anyMatch(roleIdentifiers::contains);
        }

        boolean isSatisfied(TicketAccessContext context) {
            return condition != null && context != null && condition.test(context);
        }
    }
}
