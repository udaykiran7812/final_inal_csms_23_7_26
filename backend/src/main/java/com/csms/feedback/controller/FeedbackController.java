package com.csms.feedback.controller;

import com.csms.common.response.ApiResponse;
import com.csms.feedback.dto.FeedbackResponse;
import com.csms.feedback.dto.CreateFeedbackRequest;
import com.csms.feedback.service.FeedbackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/feedbacks")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class FeedbackController {

    private final FeedbackService feedbackService;

    @PostMapping
    public ApiResponse<FeedbackResponse> submitFeedback(@Valid @RequestBody CreateFeedbackRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return feedbackService.submitFeedback(request, email);
    }

    @GetMapping("/ticket/{ticketId}")
    public ApiResponse<FeedbackResponse> getFeedbackByTicket(@PathVariable Long ticketId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return feedbackService.getFeedbackByTicket(ticketId, email);
    }
}
