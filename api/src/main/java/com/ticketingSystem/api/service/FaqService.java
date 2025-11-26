package com.ticketingSystem.api.service;

import com.ticketingSystem.api.dto.FaqDto;
import com.ticketingSystem.api.exception.ResourceNotFoundException;
import com.ticketingSystem.api.mapper.DtoMapper;
import com.ticketingSystem.api.models.Faq;
import com.ticketingSystem.api.repository.FaqRepository;
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

    public FaqDto getFaq(String id) {
        return faqRepository.findById(id)
                .map(DtoMapper::toFaqDto)
                .orElseThrow(() -> new ResourceNotFoundException("Faq", id));
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

    public FaqDto updateFaq(String id, FaqDto dto) {
        Faq existingFaq = faqRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Faq", id));

        existingFaq.setQuestionEn(dto.getQuestionEn());
        existingFaq.setQuestionHi(dto.getQuestionHi());
        existingFaq.setAnswerEn(dto.getAnswerEn());
        existingFaq.setAnswerHi(dto.getAnswerHi());
        existingFaq.setKeywords(dto.getKeywords());
        existingFaq.setUpdatedBy(dto.getUpdatedBy());
        existingFaq.setUpdatedOn(dto.getUpdatedOn());

        Faq updatedFaq = faqRepository.save(existingFaq);
        return DtoMapper.toFaqDto(updatedFaq);
    }
}

