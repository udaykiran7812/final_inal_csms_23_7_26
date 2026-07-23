package com.csms.comment.controller;

import com.csms.common.response.ApiResponse;
import com.csms.comment.dto.CommentResponse;
import com.csms.comment.dto.CreateCommentRequest;
import com.csms.comment.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/comments")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class CommentController {

    private final CommentService commentService;

    @PostMapping
    public ApiResponse<CommentResponse> addComment(@Valid @RequestBody CreateCommentRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return commentService.addComment(request, email);
    }

    @GetMapping("/ticket/{ticketId}")
    public ApiResponse<List<CommentResponse>> getCommentsByTicket(@PathVariable Long ticketId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return commentService.getCommentsByTicket(ticketId, email);
    }
}
