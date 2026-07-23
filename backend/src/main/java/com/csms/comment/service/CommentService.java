package com.csms.comment.service;

import com.csms.common.response.ApiResponse;
import com.csms.comment.dto.CommentResponse;
import com.csms.comment.dto.CreateCommentRequest;

import java.util.List;

public interface CommentService {
    ApiResponse<CommentResponse> addComment(CreateCommentRequest request, String userEmail);
    ApiResponse<List<CommentResponse>> getCommentsByTicket(Long ticketId, String userEmail);
}
