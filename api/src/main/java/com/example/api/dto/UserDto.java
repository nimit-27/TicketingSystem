package com.example.api.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class UserDto {
    private String userId;
    private String username;
    private String name;
    private String emailId;
    private String mobileNo;
    private String office;
    private String roles;
    private String stakeholder;
    private List<String> levels;
}
