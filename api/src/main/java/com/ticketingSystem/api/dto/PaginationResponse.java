package com.ticketingSystem.api.dto;

import java.util.List;

public class PaginationResponse<T> {
    private List<T> items;
    private int page;
    private int size;
    private long totalElements;
    private long filteredTotalElements;
    private int totalPages;

    public PaginationResponse(List<T> items, int page, int size, long totalElements, int totalPages) {
        this.items = items;
        this.page = page;
        this.size = size;
        this.totalElements = totalElements;
        this.filteredTotalElements = totalElements;
        this.totalPages = totalPages;
    }

    public List<T> getItems() {
        return items;
    }

    public int getPage() {
        return page;
    }

    public int getSize() {
        return size;
    }

    public long getTotalElements() {
        return totalElements;
    }

    public long getFilteredTotalElements() {
        return filteredTotalElements;
    }

    public int getTotalPages() {
        return totalPages;
    }
}
