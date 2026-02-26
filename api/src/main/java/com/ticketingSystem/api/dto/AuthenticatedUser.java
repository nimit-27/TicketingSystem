package com.ticketingSystem.api.dto;

import com.ticketingSystem.api.models.RequesterUser;
import com.ticketingSystem.api.models.User;
import com.ticketingSystem.api.models.UserLevel;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AuthenticatedUser {
    private final String userId;
    private final String username;
    private final String name;
    private final String firstName;
    private final String lastName;
    private final String password;
    private final String roles;
    private final UserLevel userLevel;
    private final String stakeholder;
    private final String officeType;
    private final String officeCode;
    private final String zoneCode;
    private final String regionCode;
    private final String districtCode;

    public static AuthenticatedUser fromUser(User user) {
        return AuthenticatedUser.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .name(user.getName())
                .firstName(null)
                .lastName(null)
                .password(user.getPassword())
                .roles(user.getRoles())
                .userLevel(user.getUserLevel())
                .stakeholder(user.getStakeholder())
                .officeType(null)
                .officeCode(null)
                .zoneCode(null)
                .regionCode(null)
                .districtCode(null)
                .build();
    }

    public static AuthenticatedUser fromRequesterUser(RequesterUser user) {
        return AuthenticatedUser.builder()
                .userId(user.getRequesterUserId())
                .username(user.getUsername())
                .name(user.getName())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .password(user.getPassword())
                .roles(user.getRoles())
                .userLevel(null)
                .stakeholder(user.getStakeholder())
                .officeType(user.getOfficeType())
                .officeCode(user.getOfficeCode())
                .zoneCode(user.getZoneCode())
                .regionCode(user.getRegionCode())
                .districtCode(user.getDistrictCode())
                .build();
    }
}
