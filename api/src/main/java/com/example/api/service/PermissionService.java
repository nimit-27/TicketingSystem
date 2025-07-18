package com.example.api.service;

import com.example.api.permissions.PermissionsConfig;
import com.example.api.permissions.RolePermission;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.*;

@Service
public class PermissionService {
    private PermissionsConfig config;

    @PostConstruct
    public void loadPermissions() throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        try (InputStream is = new ClassPathResource("config/permissions.json").getInputStream()) {
            config = mapper.readValue(is, PermissionsConfig.class);
        }
    }

    private List<RolePermission> getRolePermissions(List<String> roles) {
        List<RolePermission> list = new ArrayList<>();
        if (config == null || config.getRoles() == null) {
            return list;
        }
        roles.forEach(r -> {
            RolePermission rp = config.getRoles().get(r);
            if (rp != null) {
                list.add(rp);
            }
        });
        return list;
    }

    public boolean hasSidebarAccess(List<String> roles, String key) {
        return getRolePermissions(roles).stream()
                .map(RolePermission::getSidebar)
                .filter(Objects::nonNull)
                .map(m -> m.get(key))
                .anyMatch(obj -> {
                    if (obj instanceof Map<?, ?> mp) {
                        Object show = mp.get("show");
                        return Boolean.TRUE.equals(show);
                    }
                    return Boolean.TRUE.equals(obj);
                });
    }

    public boolean hasFormAccess(List<String> roles, String form, String action) {
        return getRolePermissions(roles).stream()
                .map(RolePermission::getPages)
                .filter(Objects::nonNull)
                .map(m -> m.get(form))
                .anyMatch(obj -> checkAction(obj, action));
    }

    public boolean hasFieldAccess(List<String> roles, String form, String field) {
        return getRolePermissions(roles).stream()
                .map(RolePermission::getPages)
                .filter(Objects::nonNull)
                .map(m -> m.get(form))
                .anyMatch(obj -> {
                    if (obj != null) {
                        Map<?, ?> fm = (Map<?, ?>) obj;
                        Object fieldsObj = fm.get("fields");
                        if (fieldsObj instanceof Map<?, ?> fieldsMap) {
                            Object value = fieldsMap.get(field);
                            return Boolean.TRUE.equals(value);
                        }
                    }
                    return false;
                });
    }

    private boolean checkAction(Object fpObj, String action) {
        if (fpObj instanceof Map<?, ?> fp) {
            Object value = fp.get(action);
            return Boolean.TRUE.equals(value);
        }
        return false;
    }

    public RolePermission mergeRolePermissions(List<String> roles) {
        RolePermission result = new RolePermission();
        result.setSidebar(new HashMap<>());
        result.setPages(new HashMap<>());
        for (RolePermission rp : getRolePermissions(roles)) {
            mergeOuter(result.getSidebar(), rp.getSidebar());
            mergeOuter(result.getPages(), rp.getPages());
        }
        return result;
    }

    private void mergeOuter(Map<String, Object> target,
                            Map<String, Object> source) {
        if (source == null) {
            return;
        }
        source.forEach((key, value) -> {
            Object existing = target.get(key);
            if (existing instanceof Map<?, ?> exMap && value instanceof Map<?, ?> srcMap) {
                @SuppressWarnings("unchecked")
                Map<String, Object> ex = (Map<String, Object>) exMap;
                @SuppressWarnings("unchecked")
                Map<String, Object> src = (Map<String, Object>) srcMap;
                deepMerge(ex, src);
                target.put(key, ex);
            } else {
                target.put(key, value);
            }
        });
    }

    @SuppressWarnings("unchecked")
    private void deepMerge(Map<String, Object> target, Map<String, Object> source) {
        if (source == null) {
            return;
        }
        source.forEach((key, value) -> {
            Object existing = target.get(key);
            if (existing instanceof Map<?, ?> && value instanceof Map<?, ?>) {
                deepMerge((Map<String, Object>) existing, (Map<String, Object>) value);
            } else {
                target.put(key, value);
            }
        });
    }
}
