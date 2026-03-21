package com.ticketingSystem.api.models;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class RolePolicyMapId implements Serializable {
    @Column(name = "role_id")
    private Integer roleId;

    @Column(name = "policy_id")
    private Integer policyId;
}
