package com.example.api.models;

import com.example.api.enums.Mode;
import com.example.api.enums.Priority;
import com.example.api.enums.TicketStatus;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;

import java.sql.Date;
import java.time.LocalDateTime;

@Entity
@Table(name = "tickets")
@Data
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    @Column(name="reported_date")
    private Date reportedDate;
    @Enumerated(EnumType.STRING)
    private Mode mode;
    @Column(name = "employee_id", insertable = false, updatable = false)
    private int employeeId;
    @ManyToOne
    @JoinColumn(name = "employee_id", referencedColumnName = "employee_id")
    private Employee employee;
    private String subject;
    private String description;
    private String category;
    @Column(name="sub_category")
    private String subCategory;
    @Enumerated(EnumType.STRING)
    private Priority priority;
    @Enumerated(EnumType.STRING)
    private TicketStatus status;
    @Column(name="attachment_path")
    private String attachmentPath;
    @JsonProperty("isMaster")
    @Column(name = "is_master")
    private boolean isMaster;
    private Integer masterId;
    @Column(name = "last_modified")
    private LocalDateTime lastModified;
}
