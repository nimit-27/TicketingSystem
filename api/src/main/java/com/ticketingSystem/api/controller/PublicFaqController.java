package com.ticketingSystem.api.controller;

import com.ticketingSystem.api.dto.FaqDto;
import com.ticketingSystem.api.service.FaqService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/public/faqs")
@CrossOrigin(origins = "http://localhost:3000")
@AllArgsConstructor
public class PublicFaqController {
    private final FaqService faqService;

    @GetMapping
    public ResponseEntity<List<FaqDto>> getFaqs() {
        return ResponseEntity.ok(faqService.getAllFaqs());
    }
}
