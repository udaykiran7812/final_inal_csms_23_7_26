package com.csms.attachment.controller;

import com.csms.common.response.ApiResponse;
import com.csms.attachment.dto.AttachmentResponse;
import com.csms.attachment.service.AttachmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/attachments")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class AttachmentController {

    private final AttachmentService attachmentService;

    @PostMapping("/upload")
    public ApiResponse<AttachmentResponse> uploadFile(
            @RequestParam("ticketId") Long ticketId,
            @RequestParam("file") MultipartFile file) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return attachmentService.uploadFile(ticketId, file, email);
    }

    @GetMapping("/ticket/{ticketId}")
    public ApiResponse<List<AttachmentResponse>> getAttachments(@PathVariable Long ticketId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return attachmentService.getAttachments(ticketId, email);
    }
}
