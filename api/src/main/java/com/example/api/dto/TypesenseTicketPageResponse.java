package com.example.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TypesenseTicketPageResponse {
    private List<TypesenseTicketDto> tickets;
    private int page;
    private int size;
    private long totalFound;
    private int totalPages;
}
