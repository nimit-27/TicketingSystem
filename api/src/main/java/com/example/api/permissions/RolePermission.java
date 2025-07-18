package com.example.api.permissions;

import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
public class RolePermission {
    /**
     * Structure containing sidebar permissions. The values can be booleans or
     * nested objects depending on the JSON configuration, so we keep them as
     * generic {@link Object}.
     */
    private Map<String, Object> sidebar;

    /**
     * Pages (previously forms) permissions. The structure can be deeply nested
     * therefore we use a generic map.
     */
    private Map<String, Object> pages;
}
