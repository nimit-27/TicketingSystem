package com.ticketingSystem.api.service;

import com.ticketingSystem.api.dto.FaqDto;
import com.ticketingSystem.api.exception.ResourceNotFoundException;
import com.ticketingSystem.api.models.Faq;
import com.ticketingSystem.api.repository.FaqRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FaqServiceTest {

    @Mock
    private FaqRepository faqRepository;

    @InjectMocks
    private FaqService service;

    @Test
    void getAllFaqsShouldMapEntitiesToDtos() {
        Faq faq = new Faq();
        faq.setId("f1");
        faq.setQuestionEn("How?");
        when(faqRepository.findAll()).thenReturn(List.of(faq));

        List<FaqDto> result = service.getAllFaqs();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo("f1");
        assertThat(result.get(0).getQuestionEn()).isEqualTo("How?");
    }

    @Test
    void getFaqShouldThrowWhenEntityNotFound() {
        when(faqRepository.findById("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getFaq("missing"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void createFaqShouldCopyFieldsAndReturnDto() {
        FaqDto dto = baseDto();
        when(faqRepository.save(any(Faq.class))).thenAnswer(invocation -> {
            Faq entity = invocation.getArgument(0);
            entity.setId("new-id");
            return entity;
        });

        FaqDto saved = service.createFaq(dto);

        assertThat(saved.getId()).isEqualTo("new-id");
        assertThat(saved.getQuestionHi()).isEqualTo(dto.getQuestionHi());
        assertThat(saved.getAnswerEn()).isEqualTo(dto.getAnswerEn());
    }

    @Test
    void updateFaqShouldUpdateMutableFieldsOnExistingEntity() {
        Faq existing = new Faq();
        existing.setId("f1");
        existing.setQuestionEn("Old");
        when(faqRepository.findById("f1")).thenReturn(Optional.of(existing));
        when(faqRepository.save(existing)).thenReturn(existing);

        FaqDto update = baseDto();
        update.setQuestionEn("New question");

        FaqDto result = service.updateFaq("f1", update);

        assertThat(result.getQuestionEn()).isEqualTo("New question");
        verify(faqRepository).save(existing);
    }

    private FaqDto baseDto() {
        FaqDto dto = new FaqDto();
        dto.setQuestionEn("Q en");
        dto.setQuestionHi("Q hi");
        dto.setAnswerEn("A en");
        dto.setAnswerHi("A hi");
        dto.setKeywords("k1,k2");
        dto.setCreatedBy("creator");
        dto.setCreatedOn(LocalDateTime.now());
        dto.setUpdatedBy("upd");
        dto.setUpdatedOn(LocalDateTime.now());
        return dto;
    }
}
