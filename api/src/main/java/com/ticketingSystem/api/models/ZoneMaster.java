package com.ticketingSystem.api.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "zone_master")
@Getter
@Setter
public class ZoneMaster {

    @Id
    @Column(name = "zone_code")
    private String zoneCode;

    @Column(name = "zone_name")
    private String zoneName;

    @Column(name = "hrms_zone_code")
    private String hrmsZoneCode;
}
