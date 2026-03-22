package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.models.RolePolicyMap;
import com.ticketingSystem.api.models.RolePolicyMapId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface RolePolicyMapRepository extends JpaRepository<RolePolicyMap, RolePolicyMapId> {
    List<RolePolicyMap> findByRoleRoleIdInAndIsActiveTrue(Collection<Integer> roleIds);
    List<RolePolicyMap> findByRoleRoleIdAndIsActiveTrue(Integer roleId);
}
