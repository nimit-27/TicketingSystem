package com.example.api.controller;

import com.example.api.dto.FaqDto;
import com.example.api.service.FaqService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/faqs")
@CrossOrigin(origins = "http://localhost:3000")
@AllArgsConstructor
public class FaqController {
    private final FaqService faqService;

    @GetMapping
    public ResponseEntity<List<FaqDto>> getFaqs() {
        return ResponseEntity.ok(faqService.getAllFaqs());
    }

    @PostMapping
    public ResponseEntity<FaqDto> createFaq(@RequestBody FaqDto faqDto) {
        return ResponseEntity.ok(faqService.createFaq(faqDto));
    }
}

