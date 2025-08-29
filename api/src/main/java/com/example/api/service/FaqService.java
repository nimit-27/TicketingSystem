package com.example.api.service;

import com.example.api.dto.FaqDto;
import com.example.api.mapper.DtoMapper;
import com.example.api.models.Faq;
import com.example.api.repository.FaqRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FaqService {
    private final FaqRepository faqRepository;

    public FaqService(FaqRepository faqRepository) {
        this.faqRepository = faqRepository;
    }

    public List<FaqDto> getAllFaqs() {
        return faqRepository.findAll().stream()
                .map(DtoMapper::toFaqDto)
                .collect(Collectors.toList());
    }

    public FaqDto createFaq(FaqDto dto) {
        Faq faq = new Faq();
        faq.setQuestionEn(dto.getQuestionEn());
        faq.setQuestionHi(dto.getQuestionHi());
        faq.setAnswerEn(dto.getAnswerEn());
        faq.setAnswerHi(dto.getAnswerHi());
        faq.setKeywords(dto.getKeywords());
        faq.setCreatedBy(dto.getCreatedBy());
        faq.setCreatedOn(dto.getCreatedOn());
        faq.setUpdatedBy(dto.getUpdatedBy());
        faq.setUpdatedOn(dto.getUpdatedOn());
        Faq saved = faqRepository.save(faq);
        return DtoMapper.toFaqDto(saved);
    }
}

