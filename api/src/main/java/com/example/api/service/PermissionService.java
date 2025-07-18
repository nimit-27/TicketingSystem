package com.example.api.service;

import com.example.api.models.RolePermissionConfig;
import com.example.api.permissions.PermissionsConfig;
import com.example.api.permissions.RolePermission;
import com.example.api.repository.RolePermissionConfigRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.util.*;

@Service
public class PermissionService {
    private PermissionsConfig config;
    private final RolePermissionConfigRepository repository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public PermissionService(RolePermissionConfigRepository repository) {
        this.repository = repository;
    }

    @PostConstruct
    public void loadPermissions() throws IOException {
        Map<String, RolePermission> map = new HashMap<>();
        for (RolePermissionConfig rpc : repository.findAll()) {
            RolePermission rp = objectMapper.readValue(rpc.getPermissions(), RolePermission.class);
            map.put(rpc.getRole(), rp);
        }
        config = new PermissionsConfig();
        config.setRoles(map);
    }

    public void updateRolePermissions(String role, RolePermission permission) throws IOException {
        String json = objectMapper.writeValueAsString(permission);
        RolePermissionConfig rpc = new RolePermissionConfig();
        rpc.setRole(role);
        rpc.setPermissions(json);
        repository.save(rpc);

        if (config == null) {
            config = new PermissionsConfig();
            config.setRoles(new HashMap<>());
        }
        if (config.getRoles() == null) {
            config.setRoles(new HashMap<>());
        }
        config.getRoles().put(role, permission);
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
