package com.csms.attachment.service;

import com.csms.common.response.ApiResponse;
import com.csms.attachment.dto.AttachmentResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface AttachmentService {
    ApiResponse<AttachmentResponse> uploadFile(Long ticketId, MultipartFile file, String userEmail);
    ApiResponse<List<AttachmentResponse>> getAttachments(Long ticketId, String userEmail);
}
