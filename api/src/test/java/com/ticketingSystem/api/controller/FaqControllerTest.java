package com.ticketingSystem.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketingSystem.api.dto.FaqDto;
import com.ticketingSystem.api.service.FaqService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class FaqControllerTest {

    @Mock
    private FaqService faqService;

    @InjectMocks
    private FaqController faqController;

    private MockMvc mockMvc;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter();
        converter.setObjectMapper(objectMapper);
        mockMvc = MockMvcBuilders.standaloneSetup(faqController)
                .setMessageConverters(converter)
                .build();
    }

    @Test
    void getFaqsReturnsFaqList() throws Exception {
        FaqDto faqDto = new FaqDto();
        faqDto.setId("faq-1");
        faqDto.setQuestionEn("What is IT?");

        when(faqService.getAllFaqs()).thenReturn(List.of(faqDto));

        mockMvc.perform(get("/faqs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("faq-1"))
                .andExpect(jsonPath("$[0].questionEn").value("What is IT?"));
    }

    @Test
    void getFaqReturnsSingleFaq() throws Exception {
        FaqDto faqDto = new FaqDto();
        faqDto.setId("faq-11");
        faqDto.setQuestionEn("How to reset password?");

        when(faqService.getFaq("faq-11")).thenReturn(faqDto);

        mockMvc.perform(get("/faqs/{id}", "faq-11"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("faq-11"))
                .andExpect(jsonPath("$.questionEn").value("How to reset password?"));
    }

    @Test
    void createFaqDelegatesToService() throws Exception {
        FaqDto request = new FaqDto();
        request.setQuestionEn("New question");

        FaqDto created = new FaqDto();
        created.setId("new-id");
        created.setQuestionEn("New question");

        when(faqService.createFaq(any(FaqDto.class))).thenReturn(created);

        mockMvc.perform(post("/faqs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("new-id"))
                .andExpect(jsonPath("$.questionEn").value("New question"));
    }

    @Test
    void updateFaqDelegatesToService() throws Exception {
        FaqDto request = new FaqDto();
        request.setQuestionEn("Updated question");

        FaqDto updated = new FaqDto();
        updated.setId("faq-22");
        updated.setQuestionEn("Updated question");

        when(faqService.updateFaq(eq("faq-22"), any(FaqDto.class))).thenReturn(updated);

        mockMvc.perform(put("/faqs/{id}", "faq-22")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("faq-22"))
                .andExpect(jsonPath("$.questionEn").value("Updated question"));
    }
}
