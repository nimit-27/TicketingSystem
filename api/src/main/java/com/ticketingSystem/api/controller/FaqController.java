package com.ticketingSystem.api.controller;

import com.ticketingSystem.api.dto.FaqDto;
import com.ticketingSystem.api.service.FaqService;
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

    @GetMapping("/{id}")
    public ResponseEntity<FaqDto> getFaq(@PathVariable String id) {
        return ResponseEntity.ok(faqService.getFaq(id));
    }

    @PostMapping
    public ResponseEntity<FaqDto> createFaq(@RequestBody FaqDto faqDto) {
        return ResponseEntity.ok(faqService.createFaq(faqDto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FaqDto> updateFaq(@PathVariable String id, @RequestBody FaqDto faqDto) {
        return ResponseEntity.ok(faqService.updateFaq(id, faqDto));
    }
}

