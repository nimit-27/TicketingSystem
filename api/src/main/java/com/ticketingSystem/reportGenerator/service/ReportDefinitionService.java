package com.ticketingSystem.reportGenerator.service;

import com.ticketingSystem.reportGenerator.dto.ReportDefinitionResponse;
import com.ticketingSystem.reportGenerator.models.ReportColumnMapping;
import com.ticketingSystem.reportGenerator.models.ReportFilterMapping;
import com.ticketingSystem.reportGenerator.models.ReportMaster;
import com.ticketingSystem.reportGenerator.repository.ReportColumnMappingRepository;
import com.ticketingSystem.reportGenerator.repository.ReportFilterMappingRepository;
import com.ticketingSystem.reportGenerator.repository.ReportMasterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportDefinitionService {

    private final ReportMasterRepository reportMasterRepository;
    private final ReportFilterMappingRepository reportFilterMappingRepository;
    private final ReportColumnMappingRepository reportColumnMappingRepository;

    public List<ReportDefinitionResponse> getActiveDefinitions() {
        return reportMasterRepository.findAll().stream()
                .filter(ReportMaster::isActive)
                .map(this::toResponse)
                .toList();
    }

    public ReportDefinitionResponse getDefinitionByCode(String reportCode) {
        ReportMaster reportMaster = reportMasterRepository.findByReportCodeAndActiveTrue(reportCode)
                .orElseThrow(() -> new IllegalArgumentException("Report definition not found for code: " + reportCode));
        return toResponse(reportMaster);
    }

    private ReportDefinitionResponse toResponse(ReportMaster reportMaster) {
        List<ReportFilterMapping> filters = reportFilterMappingRepository
                .findByReport_ReportIdOrderByDisplayOrderAsc(reportMaster.getReportId());
        List<ReportColumnMapping> columns = reportColumnMappingRepository
                .findByReport_ReportIdOrderByDisplayOrderAsc(reportMaster.getReportId());

        return ReportDefinitionResponse.builder()
                .reportId(reportMaster.getReportId())
                .reportCode(reportMaster.getReportCode())
                .name(reportMaster.getName())
                .description(reportMaster.getDescription())
                .dataKey(reportMaster.getDataKey())
                .sourceType(reportMaster.getSourceType())
                .sourceRef(reportMaster.getSourceRef())
                .templateLocation(reportMaster.getTemplateLocation())
                .templateType(reportMaster.getTemplateType())
                .defaultOutputFormat(reportMaster.getDefaultOutputFormat())
                .filters(filters.stream().map(this::toFilter).toList())
                .columns(columns.stream().map(this::toColumn).toList())
                .build();
    }

    private ReportDefinitionResponse.FilterDefinition toFilter(ReportFilterMapping filter) {
        return ReportDefinitionResponse.FilterDefinition.builder()
                .filterId(filter.getFilterId())
                .displayOrder(filter.getDisplayOrder())
                .filterKey(filter.getFilterKey())
                .filterType(filter.getFilterType())
                .required(filter.isRequired())
                .defaultValue(filter.getDefaultValue())
                .optionSourceType(filter.getOptionSourceType())
                .optionSourceRef(filter.getOptionSourceRef())
                .build();
    }

    private ReportDefinitionResponse.ColumnDefinition toColumn(ReportColumnMapping column) {
        return ReportDefinitionResponse.ColumnDefinition.builder()
                .columnId(column.getColumnId())
                .columnKey(column.getColumnKey())
                .columnLabel(column.getColumnLabel())
                .dataType(column.getDataType())
                .defaultColumn(column.isDefaultColumn())
                .selectable(column.isSelectable())
                .displayOrder(column.getDisplayOrder())
                .build();
    }
}
