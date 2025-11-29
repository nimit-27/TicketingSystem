package com.ticketingSystem.api.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "headquarter_master")
@Getter
@Setter
public class HeadquarterMaster {

    @Id
    @Column(name = "headquarter_code")
    private String headquarterCode;

    @Column(name = "headquarter_name")
    private String headquarterName;

    @Column(name = "hrms_headquarter_code")
    private String hrmsHeadquarterCode;
}
