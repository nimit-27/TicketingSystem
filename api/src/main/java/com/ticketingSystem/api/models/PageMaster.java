package com.ticketingSystem.api.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "page_master")
@Getter
@Setter
public class PageMaster {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "page_id")
    private Long pageId;

    @Column(name = "page_name")
    private String pageName;

    @Column(name = "page_code")
    private String pageCode;

    @Column(name = "page_description")
    private String pageDescription;

    @Column(name = "parent_id")
    private Long parentId;

    @Column(name = "is_active")
    private Boolean isActive;

    @Column(name = "is_on_sidebar")
    private Boolean isOnSidebar;

    @Column(name = "created_on")
    private LocalDateTime createdOn;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "updated_on")
    private LocalDateTime updatedOn;

    @Column(name = "updated_by")
    private String updatedBy;
}
