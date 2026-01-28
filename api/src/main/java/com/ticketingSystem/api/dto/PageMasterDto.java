package com.ticketingSystem.api.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class PageMasterDto {
    private Long pageId;
    private String pageName;
    private String pageCode;
    private String pageDescription;
    private Long parentId;
    private Boolean isActive;
    private Boolean isOnSidebar;
    private LocalDateTime createdOn;
    private String createdBy;
    private LocalDateTime updatedOn;
    private String updatedBy;
}
