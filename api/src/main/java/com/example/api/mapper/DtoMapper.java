package com.example.api.mapper;

import com.example.api.dto.CategoryDto;
import com.example.api.dto.SubCategoryDto;
import com.example.api.dto.TicketDto;
import com.example.api.models.Category;
import com.example.api.models.SubCategory;
import com.example.api.models.Ticket;

import java.util.Set;
import java.util.stream.Collectors;

public class DtoMapper {
    public static CategoryDto toCategoryDto(Category category) {
        if (category == null) return null;
        CategoryDto dto = new CategoryDto();
        dto.setCategoryId(category.getCategoryId());
        dto.setCategory(category.getCategory());
        dto.setCreatedBy(category.getCreatedBy());
        dto.setTimestamp(category.getTimestamp());
        dto.setLastUpdated(category.getLastUpdated());
        if (category.getSubCategories() != null) {
            Set<SubCategoryDto> subDtos = category.getSubCategories().stream()
                    .map(DtoMapper::toSubCategoryDto)
                    .collect(Collectors.toSet());
            dto.setSubCategories(subDtos);
        }
        return dto;
    }

    public static SubCategoryDto toSubCategoryDto(SubCategory subCategory) {
        if (subCategory == null) return null;
        SubCategoryDto dto = new SubCategoryDto();
        dto.setSubCategoryId(subCategory.getSubCategoryId());
        dto.setSubCategory(subCategory.getSubCategory());
        dto.setCreatedBy(subCategory.getCreatedBy());
        dto.setTimestamp(subCategory.getTimestamp());
        dto.setLastUpdated(subCategory.getLastUpdated());
        dto.setCategoryId(subCategory.getCategory() != null ? subCategory.getCategory().getCategoryId() : null);
        return dto;
    }

    public static TicketDto toTicketDto(Ticket ticket) {
        if (ticket == null) return null;
        TicketDto dto = new TicketDto();
        dto.setId(ticket.getId());
        dto.setReportedDate(ticket.getReportedDate());
        dto.setMode(ticket.getMode());
        dto.setEmployeeId(ticket.getEmployeeId());
        dto.setSubject(ticket.getSubject());
        dto.setDescription(ticket.getDescription());
        dto.setCategory(ticket.getCategory());
        dto.setSubCategory(ticket.getSubCategory());
        dto.setPriority(ticket.getPriority());
        dto.setStatus(ticket.getStatus());
        dto.setAttachmentPath(ticket.getAttachmentPath());
        dto.setAssignedToLevel(ticket.getAssignedToLevel());
        dto.setAssignedTo(ticket.getAssignedTo());
        dto.setAssignedBy(ticket.getAssignedBy());
        dto.setMaster(ticket.isMaster());
        dto.setMasterId(ticket.getMasterId());
        dto.setLastModified(ticket.getLastModified());
        return dto;
    }
}
