package com.example.api.models;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "faqs")
@Data
public class Faq {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "question_en")
    private String questionEn;

    @Column(name = "question_hi")
    private String questionHi;

    @Column(name = "answer_en", columnDefinition = "TEXT")
    private String answerEn;

    @Column(name = "answer_hi", columnDefinition = "TEXT")
    private String answerHi;

    @Column(name = "keywords")
    private String keywords;
}

