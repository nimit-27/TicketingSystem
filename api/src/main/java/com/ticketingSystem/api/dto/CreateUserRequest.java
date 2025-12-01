package com.ticketingSystem.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CreateUserRequest {

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 100, message = "Username must be between 3 and 100 characters")
    private String username;

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 150, message = "Name must be between 2 and 150 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String emailId;

    @NotBlank(message = "Mobile number is required")
    @Pattern(regexp = "^[0-9+\\-() ]{7,20}$", message = "Enter a valid mobile number")
    private String mobileNo;

    @NotBlank(message = "Office is required")
    private String office;

    @NotEmpty(message = "At least one role is required")
    private List<String> roleIds;

    @NotEmpty(message = "At least one level is required")
    private List<String> levelIds;

    @NotEmpty(message = "At least one stakeholder is required")
    private List<String> stakeholderIds;
}

