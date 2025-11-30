package com.ticketingSystem.api.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "rno_appointed_users")
@Getter
@Setter
public class RnoAppointedUser {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "rno_appointed_user_id")
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_user_id", referencedColumnName = "requester_user_id", nullable = false)
    private RequesterUser requesterUser;

    @Column(name = "office_code")
    private String officeCode;

    @Column(name = "office_type")
    private String officeType;

    @Column(name = "region_code")
    private String regionCode;

    @Column(name = "active")
    private Boolean active = Boolean.TRUE;

    @Column(name = "created_by")
    private String createdBy;

    @CreationTimestamp
    @Column(name = "created_on", updatable = false)
    private LocalDateTime createdOn;

    @Column(name = "updated_by")
    private String updatedBy;

    @UpdateTimestamp
    @Column(name = "updated_on")
    private LocalDateTime updatedOn;
}
