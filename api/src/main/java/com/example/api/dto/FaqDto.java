package com.example.api.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FaqDto {
    private String id;
    private String questionEn;
    private String questionHi;
    private String answerEn;
    private String answerHi;
    private String keywords;
}

