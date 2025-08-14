package com.example.api.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public record SubmitFeedbackRequest(
        @Min(1) @Max(5) Integer overallSatisfaction,
        @Min(1) @Max(5) Integer resolutionEffectiveness,
        @Min(1) @Max(5) Integer communicationSupport,
        @Min(1) @Max(5) Integer timeliness,
        @Size(max = 4000) String comments
) {}
