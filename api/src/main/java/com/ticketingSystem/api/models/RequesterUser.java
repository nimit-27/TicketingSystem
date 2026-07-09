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
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
public class RequesterUser extends GenericUser {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "requester_user_id")
    @EqualsAndHashCode.Include
    private String requesterUserId;

    @Column(name = "first_name")
    private String firstName;
    @Column(name = "middle_name")
    private String middleName;
    @Column(name = "last_name")
    private String lastName;

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

    @Column(name = "depot_code")
    private String depotCode;

    @Override
    public String getGenericUserId() {
        return requesterUserId;
    }
}
