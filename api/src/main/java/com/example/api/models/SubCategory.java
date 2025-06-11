package com.example.api.models;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "sub_categories")
@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class SubCategory {
    @Id
    @Column(name = "sub_category_id")
    @EqualsAndHashCode.Include
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer subCategoryId;

    @Column(name = "sub_category")
    private String subCategory;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "timestamp")
    private LocalDateTime timestamp;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;

    public SubCategory() {}

    public SubCategory(String subCategory) {
        this.subCategory = subCategory;
    }
}
