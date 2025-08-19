package com.example.api.service;

import com.example.api.permissions.PermissionsConfig;
import com.example.api.permissions.RolePermission;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * Tests for {@link PermissionService}.
 */
class PermissionServiceTest {

    @Test
    void mergeRolePermissionsOrsShowFlag() throws Exception {
        PermissionService service = new PermissionService(null);

        // Role 1 grants Knowledge Base but not FAQ
        RolePermission role1 = new RolePermission();
        Map<String, Object> kb1 = new HashMap<>();
        kb1.put("show", true);
        Map<String, Object> faq1 = new HashMap<>();
        faq1.put("show", false);
        Map<String, Object> sidebar1 = new HashMap<>();
        sidebar1.put("knowledgeBase", kb1);
        sidebar1.put("faq", faq1);
        role1.setSidebar(sidebar1);

        // Role 2 grants FAQ but not Knowledge Base
        RolePermission role2 = new RolePermission();
        Map<String, Object> kb2 = new HashMap<>();
        kb2.put("show", false);
        Map<String, Object> faq2 = new HashMap<>();
        faq2.put("show", true);
        Map<String, Object> sidebar2 = new HashMap<>();
        sidebar2.put("knowledgeBase", kb2);
        sidebar2.put("faq", faq2);
        role2.setSidebar(sidebar2);

        Map<Integer, RolePermission> roles = new HashMap<>();
        roles.put(1, role1);
        roles.put(2, role2);

        PermissionsConfig cfg = new PermissionsConfig();
        cfg.setRoles(roles);

        Field configField = PermissionService.class.getDeclaredField("config");
        configField.setAccessible(true);
        configField.set(service, cfg);

        RolePermission merged = service.mergeRolePermissions(Arrays.asList(1, 2));

        Map<String, Object> sidebar = merged.getSidebar();
        assertEquals(Boolean.TRUE, ((Map<?, ?>) sidebar.get("knowledgeBase")).get("show"));
        assertEquals(Boolean.TRUE, ((Map<?, ?>) sidebar.get("faq")).get("show"));
    }
}

