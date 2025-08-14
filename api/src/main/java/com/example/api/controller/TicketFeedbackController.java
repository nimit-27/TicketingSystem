package com.example.api.controller;

import com.example.api.dto.FeedbackFormDTO;
import com.example.api.dto.SubmitFeedbackRequest;
import com.example.api.dto.TicketFeedbackResponse;
import com.example.api.enums.FeedbackStatus;
import com.example.api.service.TicketFeedbackService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Optional;

@RestController
@RequestMapping
@CrossOrigin(origins = "http://localhost:3000")
public class TicketFeedbackController {
    private final TicketFeedbackService feedbackService;

    public TicketFeedbackController(TicketFeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @GetMapping("/tickets/{ticketId}/feedback/form")
    public ResponseEntity<FeedbackFormDTO> getForm(@PathVariable String ticketId,
                                                  @RequestHeader("X-USER-ID") String userId) {
        return ResponseEntity.ok(feedbackService.getForm(ticketId, userId));
    }

    @PostMapping("/tickets/{ticketId}/feedback")
    public ResponseEntity<TicketFeedbackResponse> submit(@PathVariable String ticketId,
                                                         @RequestHeader("X-USER-ID") String userId,
                                                         @RequestBody @Validated SubmitFeedbackRequest req) {
        return ResponseEntity.ok(feedbackService.submit(ticketId, userId, req));
    }

    @GetMapping("/tickets/{ticketId}/feedback")
    public ResponseEntity<TicketFeedbackResponse> getFeedback(@PathVariable String ticketId,
                                                              @RequestHeader("X-USER-ID") String userId) {
        return feedbackService.getFeedback(ticketId, userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/feedback")
    public ResponseEntity<Page<?>> search(@RequestParam Optional<String> ticketId,
                                          @RequestParam Optional<FeedbackStatus> status,
                                          @RequestParam Optional<LocalDateTime> from,
                                          @RequestParam Optional<LocalDateTime> to,
                                          @RequestParam(defaultValue = "0") int page,
                                          @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(feedbackService.search(ticketId, status, from, to, PageRequest.of(page, size)));
    }
}
