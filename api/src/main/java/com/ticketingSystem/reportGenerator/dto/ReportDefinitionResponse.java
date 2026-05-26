package com.ticketingSystem.reportGenerator.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class ReportDefinitionResponse {
    private Long reportId;
    private String reportCode;
    private String name;
    private String description;
    private String dataKey;
    private String sourceType;
    private String sourceRef;
    private String templateLocation;
    private String templateType;
    private String defaultOutputFormat;
    private List<FilterDefinition> filters;
    private List<ColumnDefinition> columns;

    @Getter
    @Builder
    public static class FilterDefinition {
        private Long filterId;
        private Integer displayOrder;
        private String filterKey;
        private String filterType;
        private boolean required;
        private String defaultValue;
        private String optionSourceType;
        private String optionSourceRef;
    }

    @Getter
    @Builder
    public static class ColumnDefinition {
        private Long columnId;
        private String columnKey;
        private String columnLabel;
        private String dataType;
        private boolean defaultColumn;
        private boolean selectable;
        private Integer displayOrder;
    }
}
