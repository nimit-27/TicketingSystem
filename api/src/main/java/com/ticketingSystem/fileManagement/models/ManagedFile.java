package com.ticketingSystem.fileManagement.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "managed_files")
@Getter
@Setter
public class ManagedFile {

    @Id
    @Column(name = "file_id", updatable = false, nullable = false)
    private String id = UUID.randomUUID().toString();

    @Column(name = "original_name", nullable = false)
    private String originalName;

    @Column(name = "stored_name", nullable = false)
    private String storedName;

    @Column(name = "content_type")
    private String contentType;

    @Column(name = "file_size")
    private long fileSize;

    @Column(name = "section")
    private String section;

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @Column(name = "uploaded_by")
    private String uploadedBy;

    @Column(name = "uploaded_by_name")
    private String uploadedByName;

    @Column(name = "uploaded_on", insertable = false, updatable = false)
    private LocalDateTime uploadedOn;

    @Column(name = "storage_path", nullable = false)
    private String storagePath;

    @Column(name = "is_active")
    private boolean active = true;

    @OneToMany(mappedBy = "file", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<ManagedFileRole> roles = new ArrayList<>();

    @OneToMany(mappedBy = "file", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<ManagedFileUser> users = new ArrayList<>();

    public void addRole(String role) {
        ManagedFileRole r = new ManagedFileRole();
        r.setFile(this);
        r.setRole(role);
        roles.add(r);
    }

    public void addUser(String userId) {
        ManagedFileUser u = new ManagedFileUser();
        u.setFile(this);
        u.setUserId(userId);
        users.add(u);
    }
}
