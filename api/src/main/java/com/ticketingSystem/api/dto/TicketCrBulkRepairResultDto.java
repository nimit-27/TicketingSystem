package com.ticketingSystem.api.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class TicketCrBulkRepairResultDto {
    private int createdCount;
    private List<String> failedTicketIds;
}
