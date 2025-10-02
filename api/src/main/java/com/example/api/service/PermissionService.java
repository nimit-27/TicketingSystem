package com.example.api.service;

import com.example.api.exception.ResourceNotFoundException;
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
        Role existingRole = repository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role", roleId));

        java.time.LocalDateTime now = java.time.LocalDateTime.now();

        existingRole.setPermissions(objectMapper.writeValueAsString(permission));
        existingRole.setUpdatedOn(now);
        existingRole.setUpdatedBy("SYSTEM");
        repository.save(existingRole);

        ensureConfig();
        config.getRoles().put(roleId, permission);

        if (isMasterRole(existingRole)) {
            synchronizeWithMasterTemplate(roleId, permission, now);
        }
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

    private void ensureConfig() {
        if (config == null) {
            config = new PermissionsConfig();
        }
        if (config.getRoles() == null) {
            config.setRoles(new HashMap<>());
        }
    }

    private boolean isMasterRole(Role role) {
        return role.getRole() != null && role.getRole().equalsIgnoreCase("master");
    }

    private void synchronizeWithMasterTemplate(Integer masterRoleId,
                                               RolePermission masterPermissions,
                                               java.time.LocalDateTime updatedOn) throws IOException {
        List<Role> roles = repository.findByIsDeletedFalse();
        for (Role role : roles) {
            if (Objects.equals(role.getRoleId(), masterRoleId)) {
                continue;
            }
            if (isMasterRole(role)) {
                config.getRoles().put(role.getRoleId(), masterPermissions);
                continue;
            }

            RolePermission existing = config.getRoles().get(role.getRoleId());
            if (existing == null) {
                existing = objectMapper.readValue(role.getPermissions(), RolePermission.class);
            }

            RolePermission synchronizedPermission = applyTemplate(masterPermissions, existing);
            role.setPermissions(objectMapper.writeValueAsString(synchronizedPermission));
            role.setUpdatedOn(updatedOn);
            role.setUpdatedBy("SYSTEM");
            repository.save(role);
            config.getRoles().put(role.getRoleId(), synchronizedPermission);
        }
    }

    private RolePermission applyTemplate(RolePermission template, RolePermission existing) {
        RolePermission result = new RolePermission();
        result.setSidebar(syncSection(template.getSidebar(), existing != null ? existing.getSidebar() : null));
        result.setPages(syncSection(template.getPages(), existing != null ? existing.getPages() : null));
        return result;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> syncSection(Map<String, Object> template,
                                            Map<String, Object> current) {
        if (template == null) {
            return null;
        }
        Map<String, Object> result = new LinkedHashMap<>();
        template.forEach((key, value) -> {
            Object existingValue = current != null ? current.get(key) : null;
            result.put(key, synchronizeValue(value, existingValue));
        });
        return result;
    }

    @SuppressWarnings("unchecked")
    private Object synchronizeValue(Object templateValue, Object existingValue) {
        if (templateValue == null) {
            return null;
        }
        if (templateValue instanceof Map<?, ?> templateMap) {
            Map<String, Object> orderedTemplate = new LinkedHashMap<>();
            templateMap.forEach((k, v) -> orderedTemplate.put(String.valueOf(k), v));
            Map<String, Object> existingMap = null;
            if (existingValue instanceof Map<?, ?> existingMapRaw) {
                existingMap = new LinkedHashMap<>();
                existingMapRaw.forEach((k, v) -> existingMap.put(String.valueOf(k), v));
            }
            Map<String, Object> result = new LinkedHashMap<>();
            orderedTemplate.forEach((k, v) -> {
                if ("show".equals(k)) {
                    Object show = existingMap != null ? existingMap.get("show") : null;
                    result.put("show", show instanceof Boolean ? show : Boolean.FALSE);
                } else {
                    Object existingChild = existingMap != null ? existingMap.get(k) : null;
                    result.put(k, synchronizeValue(v, existingChild));
                }
            });
            return result;
        }
        if (templateValue instanceof Collection<?> templateCollection) {
            List<Object> list = new ArrayList<>();
            for (Object item : templateCollection) {
                list.add(synchronizeValue(item, null));
            }
            return list;
        }
        if (templateValue instanceof Boolean) {
            if (existingValue instanceof Boolean existingBool) {
                return existingBool;
            }
            return Boolean.FALSE;
        }
        return templateValue;
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
            } else if ("show".equals(key)
                    && existing instanceof Boolean exBool
                    && value instanceof Boolean srcBool) {
                target.put(key, exBool || srcBool);
            } else {
                target.put(key, value);
            }
        });
    }
}
