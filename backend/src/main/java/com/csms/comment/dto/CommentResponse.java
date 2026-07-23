package com.csms.comment.dto;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
public class CommentResponse {
    private Long id;
    private Long ticketId;
    private Long userId;
    private String userName;
    private String userRole;
    private String content;
    private LocalDateTime createdAt;
}
