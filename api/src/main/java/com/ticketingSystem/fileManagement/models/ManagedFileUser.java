package com.ticketingSystem.fileManagement.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "managed_file_users")
@Getter
@Setter
public class ManagedFileUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "file_user_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "file_id")
    private ManagedFile file;

    @Column(name = "user_id", nullable = false)
    private String userId;
}
