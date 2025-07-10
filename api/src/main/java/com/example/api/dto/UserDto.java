package com.example.api.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserDto {
    private Integer userId;
    private String username;
    private String name;
    private String emailId;
    private String mobileNo;
    private String office;
}
