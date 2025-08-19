package com.example.api.service;

import com.example.api.models.Role;
import com.example.api.permissions.PermissionsConfig;
import com.example.api.permissions.RolePermission;
import com.example.api.repository.RoleRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.util.*;

@Service
public class PermissionService {
    private PermissionsConfig config;
    private final RoleRepository repository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public PermissionService(RoleRepository repository) {
        this.repository = repository;
    }

    @PostConstruct
    public void loadPermissions() throws IOException {
        Map<Integer, RolePermission> map = new HashMap<>();
        for (Role rpc : repository.findByIsDeletedFalse()) {
            RolePermission rp = objectMapper.readValue(rpc.getPermissions(), RolePermission.class);
            map.put(rpc.getRoleId(), rp);
        }
        config = new PermissionsConfig();
        config.setRoles(map);
    }

    public void updateRolePermissions(Integer roleId, RolePermission permission) throws IOException {
        String json = objectMapper.writeValueAsString(permission);
        Role rpc = new Role();
        rpc.setRoleId(roleId);
        rpc.setPermissions(json);
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
//        if (isNew) {
//            rpc.setCreatedOn(now);
//            rpc.setCreatedBy("SYSTEM");
//        }
        rpc.setUpdatedOn(now);
        rpc.setUpdatedBy("SYSTEM");
        repository.save(rpc);

        if (config == null) {
            config = new PermissionsConfig();
            config.setRoles(new HashMap<>());
        }
        if (config.getRoles() == null) {
            config.setRoles(new HashMap<>());
        }
        config.getRoles().put(roleId, permission);
    }

    public void overwritePermissions(PermissionsConfig permissions) throws IOException {
        repository.deleteAll();
        if (permissions != null && permissions.getRoles() != null) {
            for (Map.Entry<Integer, RolePermission> entry : permissions.getRoles().entrySet()) {
                String json = objectMapper.writeValueAsString(entry.getValue());
                Role rpc = new Role();
                rpc.setRoleId(entry.getKey());
                rpc.setPermissions(json);
                java.time.LocalDateTime now = java.time.LocalDateTime.now();
                rpc.setCreatedOn(now);
                rpc.setUpdatedOn(now);
                rpc.setCreatedBy("SYSTEM");
                rpc.setUpdatedBy("SYSTEM");
                repository.save(rpc);
            }
        }

        loadPermissions();
    }

    public Map<Integer, RolePermission> getAllRolePermissions() {
        if (config == null || config.getRoles() == null) {
            return Collections.emptyMap();
        }
        return config.getRoles();
    }

    public RolePermission getRolePermission(Integer roleId) {
        if (config == null || config.getRoles() == null) {
            return null;
        }
        return config.getRoles().get(roleId);
    }

    private List<RolePermission> getRolePermissions(List<Integer> roles) {
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

    public boolean hasSidebarAccess(List<Integer> roles, String key) {
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

    public boolean hasFormAccess(List<Integer> roles, String form, String action) {
        return getRolePermissions(roles).stream()
                .map(RolePermission::getPages)
                .filter(Objects::nonNull)
                .map(m -> m.get(form))
                .anyMatch(obj -> checkAction(obj, action));
    }

    public boolean hasFieldAccess(List<Integer> roles, String form, String field) {
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

    public RolePermission mergeRolePermissions(List<Integer> roles) {
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
