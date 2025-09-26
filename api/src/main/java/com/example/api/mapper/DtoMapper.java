package com.example.api.mapper;

import com.example.api.dto.*;
import com.example.api.models.*;
import com.example.api.service.LevelService;
import com.example.api.permissions.RolePermission;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public class DtoMapper {
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    public static CategoryDto toCategoryDto(Category category) {
        if (category == null) return null;
        CategoryDto dto = new CategoryDto();
        dto.setCategoryId(category.getCategoryId() != null ? String.valueOf(category.getCategoryId()) : null);
        dto.setCategory(category.getCategory());
        dto.setCreatedBy(category.getCreatedBy());
        dto.setTimestamp(category.getTimestamp());
        dto.setLastUpdated(category.getLastUpdated());
        dto.setUpdatedBy(category.getUpdatedBy());
        dto.setIsActive(category.getIsActive());
        if (category.getSubCategories() != null) {
            Set<SubCategoryDto> subDtos = category.getSubCategories().stream()
                    .map(DtoMapper::toSubCategoryDto)
                    .collect(Collectors.toSet());
            dto.setSubCategories(subDtos);
        }
        return dto;
    }

    public static UploadedFileDto toUploadedFileDto(UploadedFile uf) {
        if (uf == null) return null;
        UploadedFileDto dto = new UploadedFileDto();
        dto.setId(uf.getId());
        dto.setFileName(uf.getFileName());
        dto.setFileExtension(uf.getFileExtension());
        dto.setRelativePath(uf.getRelativePath());
        dto.setUploadedBy(uf.getUploadedBy());
        dto.setTicketId(uf.getTicket() != null ? uf.getTicket().getId() : null);
        dto.setUploadedOn(uf.getUploadedOn());
        dto.setIsActive(uf.getIsActive());
        return dto;
        }

    public static SubCategoryDto toSubCategoryDto(SubCategory subCategory) {
        if (subCategory == null) return null;
        SubCategoryDto dto = new SubCategoryDto();
        dto.setSubCategoryId(subCategory.getSubCategoryId() != null ? String.valueOf(subCategory.getSubCategoryId()) : null);
        dto.setSubCategory(subCategory.getSubCategory());
        dto.setDescription(subCategory.getDescription());
        dto.setCreatedBy(subCategory.getCreatedBy());
        dto.setTimestamp(subCategory.getTimestamp());
        dto.setLastUpdated(subCategory.getLastUpdated());
        dto.setCategoryId(subCategory.getCategory() != null ? String.valueOf(subCategory.getCategory().getCategoryId()) : null);
        dto.setSeverityId(subCategory.getSeverity() != null ? subCategory.getSeverity().getId() : null);
        dto.setUpdatedBy(subCategory.getUpdatedBy());
        dto.setIsActive(subCategory.getIsActive());
        return dto;
    }

    public static TicketDto toTicketDto(Ticket ticket) {
        if (ticket == null) return null;
        TicketDto dto = new TicketDto();
        dto.setId(ticket.getId());
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
        dto.setPriorityId(ticket.getPriority());
        dto.setSeverity(ticket.getSeverity());
        dto.setRecommendedSeverity(ticket.getRecommendedSeverity());
        dto.setImpact(ticket.getImpact());
        dto.setSeverityRecommendedBy(ticket.getSeverityRecommendedBy());
        dto.setStatus(ticket.getTicketStatus());
        dto.setStatusId(ticket.getStatus() != null ? ticket.getStatus().getStatusId() : null);
        dto.setAttachmentPath(ticket.getAttachmentPath());
        if (ticket.getAttachmentPath() != null && !ticket.getAttachmentPath().isEmpty()) {
            dto.setAttachmentPaths(Arrays.asList(ticket.getAttachmentPath().split(",")));
        } else {
            dto.setAttachmentPaths(Collections.emptyList());
        }
        dto.setAssignedToLevel(ticket.getAssignedToLevel());
        dto.setAssignedTo(ticket.getAssignedTo());
        dto.setAssignedBy(ticket.getAssignedBy());
        dto.setLevelId(ticket.getLevelId());
        dto.setUpdatedBy(ticket.getUpdatedBy());
        dto.setMaster(ticket.isMaster());
        dto.setMasterId(ticket.getMasterId() != null ? String.valueOf(ticket.getMasterId()) : null);
        dto.setLastModified(ticket.getLastModified());
        dto.setResolvedAt(ticket.getResolvedAt());
        dto.setFeedbackStatus(ticket.getFeedbackStatus());
        return dto;
    }

    public static RoleDto toRoleDto(Role role) {
        if(role == null) return null;
        RoleDto dto = new RoleDto();
        dto.setRoleId(role.getRoleId());
        dto.setRole(role.getRole());
        dto.setCreatedBy(role.getCreatedBy());
        dto.setCreatedOn(role.getCreatedOn());
        dto.setUpdatedBy(role.getUpdatedBy());
        dto.setUpdatedOn(role.getUpdatedOn());
        dto.setAllowedStatusActionIds(role.getAllowedStatusActionIds());
        dto.setDeleted(role.isDeleted());
        dto.setDescription(role.getDescription());
        if (role.getPermissions() != null) {
            try {
                RolePermission perm = OBJECT_MAPPER.readValue(role.getPermissions(), RolePermission.class);
                dto.setPermissions(perm);
            } catch (JsonProcessingException e) {
                // ignore parsing errors and leave permissions null
            }
        }
        return dto;
    }

    public static UserDto toUserDto(User user) {
        if(user == null) return null;
        UserDto userDto = new UserDto();
        userDto.setUserId(user.getUserId());
        userDto.setUsername(user.getUsername());
        userDto.setName(user.getName());
        userDto.setEmailId(user.getEmailId());
        userDto.setMobileNo(user.getMobileNo());
        userDto.setOffice(user.getOffice());
        userDto.setRoles(user.getRoles());
        userDto.setStakeholder(user.getStakeholder());
        if (user.getUserLevel() != null && user.getUserLevel().getLevelIds() != null) {
            List<String> levels = Arrays.asList(user.getUserLevel().getLevelIds().split("\\|"));
            userDto.setLevels(levels);
        } else {
            userDto.setLevels(Collections.emptyList());
        }
        return userDto;
    }

    public static StatusHistoryDto toStatusHistoryDto(StatusHistory statusHistory) {
        if (statusHistory == null) return null;
        StatusHistoryDto dto = new StatusHistoryDto();
        dto.setId(statusHistory.getId());
        dto.setTicketId(statusHistory.getTicket() != null ? statusHistory.getTicket().getId() : null);
        dto.setUpdatedBy(statusHistory.getUpdatedBy());
        dto.setPreviousStatus(statusHistory.getPreviousStatus());
        dto.setCurrentStatus(statusHistory.getCurrentStatus());
        dto.setTimestamp(statusHistory.getTimestamp());
        dto.setSlaFlag(statusHistory.getSlaFlag());
        dto.setRemark(statusHistory.getRemark());
        return dto;
    }

    public static StakeholderDto toStakeholderDto(Stakeholder stakeholder) {
        if (stakeholder == null) return null;
        StakeholderDto dto = new StakeholderDto();
        dto.setId(stakeholder.getId());
        dto.setDescription(stakeholder.getDescription());
        dto.setStakeholderGroupId(stakeholder.getStakeholderGroup() != null
                ? stakeholder.getStakeholderGroup().getId()
                : null);
        dto.setIsActive(stakeholder.getIsActive());
        return dto;
    }

    public static StakeholderGroupDto toStakeholderGroupDto(StakeholderGroup group) {
        if (group == null) return null;
        StakeholderGroupDto dto = new StakeholderGroupDto();
        dto.setId(group.getId());
        dto.setDescription(group.getDescription());
        dto.setIsActive(group.getIsActive());
        return dto;
    }

    public static FaqDto toFaqDto(Faq faq) {
        if (faq == null) return null;
        FaqDto dto = new FaqDto();
        dto.setId(faq.getId());
        dto.setQuestionEn(faq.getQuestionEn());
        dto.setQuestionHi(faq.getQuestionHi());
        dto.setAnswerEn(faq.getAnswerEn());
        dto.setAnswerHi(faq.getAnswerHi());
        dto.setKeywords(faq.getKeywords());
        dto.setCreatedBy(faq.getCreatedBy());
        dto.setCreatedOn(faq.getCreatedOn());
        dto.setUpdatedBy(faq.getUpdatedBy());
        dto.setUpdatedOn(faq.getUpdatedOn());
        return dto;
    }

    public static TicketSlaDto toTicketSlaDto(TicketSla ticketSla) {
        if (ticketSla == null) return null;
        TicketSlaDto dto = new TicketSlaDto();
        dto.setId(ticketSla.getId());
        dto.setTicketId(ticketSla.getTicket() != null ? ticketSla.getTicket().getId() : null);
        dto.setSlaId(ticketSla.getSlaConfig() != null ? ticketSla.getSlaConfig().getId() : null);
        dto.setDueAt(ticketSla.getDueAt());
        dto.setActualDueAt(ticketSla.getActualDueAt());
        dto.setDueAtAfterEscalation(ticketSla.getDueAtAfterEscalation());
        dto.setResolutionTimeMinutes(ticketSla.getResolutionTimeMinutes());
        dto.setElapsedTimeMinutes(ticketSla.getElapsedTimeMinutes());
        dto.setResponseTimeMinutes(ticketSla.getResponseTimeMinutes());
        dto.setBreachedByMinutes(ticketSla.getBreachedByMinutes());
        dto.setIdleTimeMinutes(ticketSla.getIdleTimeMinutes());
        dto.setCreatedAt(ticketSla.getCreatedAt());
        dto.setTotalSlaMinutes(ticketSla.getTotalSlaMinutes());
        dto.setTimeTillDueDate(ticketSla.getTimeTillDueDate());
        return dto;
    }
}
