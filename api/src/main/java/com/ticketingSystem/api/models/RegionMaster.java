package com.ticketingSystem.api.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "region_master")
@Getter
@Setter
public class RegionMaster {

    @Id
    @Column(name = "region_code")
    private String regionCode;

    @Column(name = "region_name")
    private String regionName;

    @Column(name = "hrms_reg_code")
    private String hrmsRegCode;

    @Column(name = "zone_code")
    private String zoneCode;

    @Column(name = "hrms_zone_code")
    private String hrmsZoneCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "zone_code", referencedColumnName = "zone_code", insertable = false, updatable = false)
    private ZoneMaster zone;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hrms_zone_code", referencedColumnName = "hrms_zone_code", insertable = false, updatable = false)
    private ZoneMaster hrmsZone;
}
