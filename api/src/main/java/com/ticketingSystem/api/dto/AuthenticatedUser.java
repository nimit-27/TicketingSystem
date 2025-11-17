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
    private final String password;
    private final String roles;
    private final UserLevel userLevel;
    private final String stakeholder;

    public static AuthenticatedUser fromUser(User user) {
        return AuthenticatedUser.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .name(user.getName())
                .password(user.getPassword())
                .roles(user.getRoles())
                .userLevel(user.getUserLevel())
                .stakeholder(user.getStakeholder())
                .build();
    }

    public static AuthenticatedUser fromRequesterUser(RequesterUser user) {
        return AuthenticatedUser.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .name(user.getName())
                .password(user.getPassword())
                .roles(user.getRoles())
                .userLevel(null)
                .stakeholder(user.getStakeholder())
                .build();
    }
}
