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
@Table(name = "district_master")
@Getter
@Setter
public class DistrictMaster {

    @Id
    @Column(name = "district_code")
    private String districtCode;

    @Column(name = "district_name")
    private String districtName;

    @Column(name = "hrms_reg_code")
    private String hrmsRegCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hrms_reg_code", referencedColumnName = "hrms_reg_code", insertable = false, updatable = false)
    private RegionMaster region;
}
