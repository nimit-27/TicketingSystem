package com.ticketingSystem.api.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "rno_appointed_users_history")
@Getter
@Setter
public class RnoAppointedUserHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "rno_appointed_user_history_id")
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rno_appointed_user_id", referencedColumnName = "rno_appointed_user_id")
    private RnoAppointedUser rnoAppointedUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_user_id", referencedColumnName = "requester_user_id")
    private RequesterUser requesterUser;

    @Column(name = "office_code")
    private String officeCode;

    @Column(name = "office_type")
    private String officeType;

    @Column(name = "region_code")
    private String regionCode;

    @Column(name = "active")
    private Boolean active;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_on")
    private LocalDateTime createdOn;

    @Column(name = "updated_by")
    private String updatedBy;

    @Column(name = "updated_on")
    private LocalDateTime updatedOn;

    @CreationTimestamp
    @Column(name = "history_recorded_on", updatable = false)
    private LocalDateTime historyRecordedOn;
}
