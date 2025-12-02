package com.ticketingSystem.fileManagement.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "managed_file_roles")
@Getter
@Setter
public class ManagedFileRole {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "file_role_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "file_id")
    private ManagedFile file;

    @Column(name = "role", nullable = false)
    private String role;
}
