package com.example.api.models;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "categories")
@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Category {
    @Id
    @Column(name = "category_id")
    @EqualsAndHashCode.Include
    private Integer categoryId;

    @Column(name = "category")
    private String category;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "timestamp")
    private LocalDateTime timestamp;

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;

    @OneToMany(mappedBy = "category")
    private Set<SubCategory> subCategories;
}
