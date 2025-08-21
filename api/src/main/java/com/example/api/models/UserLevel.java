package com.example.api.models;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "user_levels")
@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class UserLevel {
    @Id
    @Column(name = "user_id")
    @EqualsAndHashCode.Include
    private String userId;

    @Column(name = "level_id")
    private String levelId;

    @Column(name = "level_ids")
    private String levelIds;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;
}
