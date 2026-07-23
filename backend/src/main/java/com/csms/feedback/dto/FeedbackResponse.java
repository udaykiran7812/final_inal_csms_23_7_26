package com.csms.feedback.dto;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
public class FeedbackResponse {
    private Long id;
    private Long ticketId;
    private Long userId;
    private String userName;
    private Integer rating;
    private String comments;
    private LocalDateTime createdAt;
}
