package com.ticketingSystem.api.util;

import java.util.Collection;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

public final class RoleUtils {
    private static final Set<String> REQUESTOR_ROLE_IDENTIFIERS = Set.of(
            "5",
            "requestor",
            "role_requestor",
            "user"
    );

    private static final Set<String> REGIONAL_NODAL_OFFICER_ROLE_IDENTIFIERS = Set.of(
            "4",
            "Regional Nodal Officer",
            "regional_nodal_officer"
    );

    private static final Set<String> TEAM_LEAD_ROLE_IDENTIFIERS = Set.of(
            "7",
            "team lead",
            "team_lead",
            "teamlead",
            "tl"
    );

    private static final Set<String> ADMIN_ROLE_IDENTIFIERS = Set.of(
            "admin",
            "administrator",
            "role_admin",
            "6"
    );

    private RoleUtils() {
    }

    public static boolean isRequestorOnly(Collection<String> roles) {
        if (roles == null) {
            return false;
        }
        List<String> normalized = roles.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(role -> !role.isEmpty())
                .map(role -> role.toLowerCase(Locale.ROOT))
                .collect(Collectors.toList());
        if (normalized.size() != 1) {
            return false;
        }
        return REQUESTOR_ROLE_IDENTIFIERS.contains(normalized.get(0));
    }

    public static boolean hasUnrestrictedTicketAccess(Collection<String> roles) {
        if (roles == null || roles.isEmpty()) {
            return false;
        }
        List<String> normalized = normalizeRoles(roles);
        return containsAny(normalized, TEAM_LEAD_ROLE_IDENTIFIERS)
                || containsAny(normalized, ADMIN_ROLE_IDENTIFIERS)
                || containsAny(normalized, REGIONAL_NODAL_OFFICER_ROLE_IDENTIFIERS);
//        return !isRequestorOnly(roles);
    }

    private static List<String> normalizeRoles(Collection<String> roles) {
        return roles.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(role -> !role.isEmpty())
                .map(role -> role.toLowerCase(Locale.ROOT))
                .collect(Collectors.toList());
    }

    private static boolean containsAny(List<String> normalizedRoles, Set<String> identifiers) {
        return normalizedRoles.stream().anyMatch(identifiers::contains);
    }
}
