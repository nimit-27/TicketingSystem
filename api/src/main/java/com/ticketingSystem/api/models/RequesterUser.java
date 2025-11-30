package com.ticketingSystem.api.models;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "requester_users")
@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class RequesterUser {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "requester_user_id")
    @EqualsAndHashCode.Include
    private String requesterUserId;

    @Column(name = "username")
    private String username;
    private String name;
    @Column(name = "first_name")
    private String firstName;
    @Column(name = "middle_name")
    private String middleName;
    @Column(name = "last_name")
    private String lastName;
    @Column(name = "email_id")
    private String emailId;
    private String mobileNo;
    private String office;

    @Column(name = "password")
    private String password;

    private String roles;

    @Column(name = "stakeholder")
    private String stakeholder;

    @Column(name = "date_of_joining")
    private LocalDateTime dateOfJoining;

    @Column(name = "date_of_retirement")
    private LocalDateTime dateOfRetirement;

    @Column(name = "office_type")
    private String officeType;

    @Column(name = "office_code")
    private String officeCode;

    @Column(name = "zone_code")
    private String zoneCode;

    @Column(name = "region_code")
    private String regionCode;

    @Column(name = "district_code")
    private String districtCode;
}
