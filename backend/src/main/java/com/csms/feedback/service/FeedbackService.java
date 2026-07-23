package com.csms.feedback.service;

import com.csms.common.response.ApiResponse;
import com.csms.feedback.dto.FeedbackResponse;
import com.csms.feedback.dto.CreateFeedbackRequest;

public interface FeedbackService {
    ApiResponse<FeedbackResponse> submitFeedback(CreateFeedbackRequest request, String userEmail);
    ApiResponse<FeedbackResponse> getFeedbackByTicket(Long ticketId, String userEmail);
}
