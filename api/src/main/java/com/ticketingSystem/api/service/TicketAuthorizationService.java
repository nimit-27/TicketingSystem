package com.ticketingSystem.api.service;

import com.ticketingSystem.api.dto.LoginPayload;
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

    public void assertCanAccessTicket(String ticketId,
                                      String ticketOwnerId,
                                      String ticketAssigneeUsername,
                                      LoginPayload authenticatedUser,
                                      HttpSession session) {
        List<String> roles = resolveRoles(authenticatedUser, session);
        if (RoleUtils.hasUnrestrictedTicketAccess(roles)) {
            return;
        }

        String requesterId = resolveUserId(authenticatedUser, session);
        boolean ownsTicket = ticketOwnerId != null && ticketOwnerId.equalsIgnoreCase(requesterId);
        boolean assignedToTicket = ticketAssigneeUsername != null && ticketAssigneeUsername.equalsIgnoreCase(requesterId);

        if (requesterId == null || (!ownsTicket && !assignedToTicket)) {
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

    private String resolveUserId(LoginPayload authenticatedUser, HttpSession session) {
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
}
