package com.example.api.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "ticket_status_workflow")
@Getter
@Setter
public class TicketStatusWorkflow {
    @Id
    @Column(name = "TSW_Id")
    private Integer id;

    @Column(name = "TSW_Action")
    private String action;

    @Column(name = "TSW_Current_Status")
    private Integer currentStatus;

    @Column(name = "TSW_Next_Status")
    private Integer nextStatus;
}
