package com.ticketingSystem.reportGenerator.api;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@AllArgsConstructor
public class ReportContext {
    private List<?> rows;
    private Map<String, Object> params;
    private String templateLocation;
}
