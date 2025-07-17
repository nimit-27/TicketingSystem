package com.example.api.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ApiError {
    private String message;
    private int status;
    private String path;
}
