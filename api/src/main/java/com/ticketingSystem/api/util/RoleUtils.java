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
}
