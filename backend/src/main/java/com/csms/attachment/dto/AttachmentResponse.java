package com.csms.attachment.dto;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
public class AttachmentResponse {
    private Long id;
    private Long ticketId;
    private String fileName;
    private String fileType;
    private String filePath;
    private String uploadedByName;
    private LocalDateTime createdAt;
}
