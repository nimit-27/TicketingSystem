package com.ticketingSystem.api.dto.nagios;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record NagiosTicketSlaSnapshotDto(String service,
                                         Instant generatedAt,
                                         long totalRecords,
                                         long breachedRecords,
                                         BigDecimal compliancePercentage,
                                         int returnedRecords,
                                         List<NagiosTicketSlaRecordDto> records) {
}
