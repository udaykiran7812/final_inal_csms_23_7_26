package com.csms.attachment.service.impl;

import com.csms.common.response.ApiResponse;
import com.csms.attachment.dto.AttachmentResponse;
import com.csms.attachment.entity.Attachment;
import com.csms.attachment.repository.AttachmentRepository;
import com.csms.attachment.service.AttachmentService;
import com.csms.ticket.entity.Ticket;
import com.csms.ticket.repository.TicketRepository;
import com.csms.user.entity.User;
import com.csms.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AttachmentServiceImpl implements AttachmentService {

    private final AttachmentRepository attachmentRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    // Use a path relative to workspace or system temporary dir inside workspace
    private final String uploadDir = "/Users/udaykirankonangi/Downloads/Campus-Service-Management-System-main copy 2/uploads";

    private void checkTicketAccess(Ticket ticket, User currentUser) {
        String role = currentUser.getRole().getName();
        if (!"SUPER_ADMIN".equalsIgnoreCase(role) && !"ADMIN".equalsIgnoreCase(role)) {
            if ("DEPARTMENT_ADMIN".equalsIgnoreCase(role)) {
                if (currentUser.getDepartment() == null || !currentUser.getDepartment().getId().equals(ticket.getDepartment().getId())) {
                    throw new AccessDeniedException("Access denied to this ticket");
                }
            } else if ("STAFF".equalsIgnoreCase(role)) {
                if (ticket.getAssignedStaff() == null || !ticket.getAssignedStaff().getUser().getEmail().equalsIgnoreCase(currentUser.getEmail())) {
                    throw new AccessDeniedException("Access denied to this ticket");
                }
            } else {
                // FACULTY or STUDENT
                if (!ticket.getUser().getEmail().equalsIgnoreCase(currentUser.getEmail())) {
                    throw new AccessDeniedException("Access denied to this ticket");
                }
            }
        }
    }

    @Override
    public ApiResponse<AttachmentResponse> uploadFile(Long ticketId, MultipartFile file, String userEmail) {
        User currentUser = userRepository.findByEmailWithRole(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + userEmail));

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new EntityNotFoundException("Ticket not found: " + ticketId));

        checkTicketAccess(ticket, currentUser);

        // Ensure directories exist
        File dir = new File(uploadDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path targetPath = Paths.get(uploadDir, fileName);

        try {
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Could not store the file. Error: " + e.getMessage(), e);
        }

        Attachment attachment = new Attachment();
        attachment.setTicket(ticket);
        attachment.setFileName(file.getOriginalFilename());
        attachment.setFileType(file.getContentType());
        attachment.setFilePath("/uploads/" + fileName); // Relative path for serving
        attachment.setUploadedBy(currentUser);

        attachment = attachmentRepository.save(attachment);

        return ApiResponse.success("File uploaded successfully", mapToResponse(attachment));
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<AttachmentResponse>> getAttachments(Long ticketId, String userEmail) {
        User currentUser = userRepository.findByEmailWithRole(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + userEmail));

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new EntityNotFoundException("Ticket not found: " + ticketId));

        checkTicketAccess(ticket, currentUser);

        List<AttachmentResponse> list = attachmentRepository.findByTicketIdAndActiveTrue(ticketId)
                .stream()
                .map(this::mapToResponse)
                .toList();

        return ApiResponse.success("Attachments fetched successfully", list);
    }

    private AttachmentResponse mapToResponse(Attachment attachment) {
        AttachmentResponse res = new AttachmentResponse();
        res.setId(attachment.getId());
        res.setTicketId(attachment.getTicket().getId());
        res.setFileName(attachment.getFileName());
        res.setFileType(attachment.getFileType());
        res.setFilePath(attachment.getFilePath());
        res.setUploadedByName(attachment.getUploadedBy().getFirstName() + " " + (attachment.getUploadedBy().getLastName() != null ? attachment.getUploadedBy().getLastName() : ""));
        res.setCreatedAt(attachment.getCreatedAt());
        return res;
    }
}
