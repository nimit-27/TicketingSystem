package com.example.api.mapper;

import com.example.api.dto.CategoryDto;
import com.example.api.dto.RoleDto;
import com.example.api.dto.SubCategoryDto;
import com.example.api.dto.TicketDto;
import com.example.api.models.Category;
import com.example.api.models.Role;
import com.example.api.models.SubCategory;
import com.example.api.models.Ticket;

import java.util.Set;
import java.util.stream.Collectors;

public class DtoMapper {
    public static CategoryDto toCategoryDto(Category category) {
        if (category == null) return null;
        CategoryDto dto = new CategoryDto();
        dto.setCategoryId(category.getCategoryId() != null ? String.valueOf(category.getCategoryId()) : null);
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
        dto.setSubCategoryId(subCategory.getSubCategoryId() != null ? String.valueOf(subCategory.getSubCategoryId()) : null);
        dto.setSubCategory(subCategory.getSubCategory());
        dto.setCreatedBy(subCategory.getCreatedBy());
        dto.setTimestamp(subCategory.getTimestamp());
        dto.setLastUpdated(subCategory.getLastUpdated());
        dto.setCategoryId(subCategory.getCategory() != null ? String.valueOf(subCategory.getCategory().getCategoryId()) : null);
        return dto;
    }

    public static TicketDto toTicketDto(Ticket ticket) {
        if (ticket == null) return null;
        TicketDto dto = new TicketDto();
        dto.setId(String.valueOf(ticket.getId()));
        dto.setReportedDate(ticket.getReportedDate());
        dto.setMode(ticket.getMode());
        dto.setUserId(ticket.getUserId() != null ? String.valueOf(ticket.getUserId()) : null);
        dto.setRequestorName(ticket.getRequestorName());
        dto.setRequestorEmailId(ticket.getRequestorEmailId());
        dto.setRequestorMobileNo(ticket.getRequestorMobileNo());
        dto.setStakeholder(ticket.getStakeholder());
        dto.setSubject(ticket.getSubject());
        dto.setDescription(ticket.getDescription());
        dto.setCategory(ticket.getCategory());
        dto.setSubCategory(ticket.getSubCategory());
        dto.setPriority(ticket.getPriority());
        dto.setSeverity(ticket.getSeverity());
        dto.setRecommendedSeverity(ticket.getRecommendedSeverity());
        dto.setImpact(ticket.getImpact());
        dto.setSeverityRecommendedBy(ticket.getSeverityRecommendedBy());
        dto.setStatus(ticket.getStatus());
        dto.setAttachmentPath(ticket.getAttachmentPath());
        dto.setAssignedToLevel(ticket.getAssignedToLevel());
        dto.setAssignedTo(ticket.getAssignedTo());
        dto.setAssignedBy(ticket.getAssignedBy());
        dto.setMaster(ticket.isMaster());
        dto.setMasterId(ticket.getMasterId() != null ? String.valueOf(ticket.getMasterId()) : null);
        dto.setLastModified(ticket.getLastModified());
        return dto;
    }

    public static RoleDto toRoleDto(Role role) {
        if(role == null) return null;
        RoleDto dto = new RoleDto();
        dto.setRole(role.getRole());
        dto.setCreatedBy(role.getCreatedBy());
        dto.setCreatedOn(role.getCreatedOn());
        dto.setUpdatedBy(role.getUpdatedBy());
        dto.setUpdatedOn(role.getUpdatedOn());
        dto.setIsDeleted(role.isDeleted());
        return dto;
    }
}
