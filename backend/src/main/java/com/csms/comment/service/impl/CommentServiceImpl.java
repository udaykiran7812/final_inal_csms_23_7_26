package com.csms.comment.service.impl;

import com.csms.common.response.ApiResponse;
import com.csms.comment.dto.CommentResponse;
import com.csms.comment.dto.CreateCommentRequest;
import com.csms.comment.entity.Comment;
import com.csms.comment.repository.CommentRepository;
import com.csms.comment.service.CommentService;
import com.csms.ticket.entity.Ticket;
import com.csms.ticket.repository.TicketRepository;
import com.csms.user.entity.User;
import com.csms.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

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
    public ApiResponse<CommentResponse> addComment(CreateCommentRequest request, String userEmail) {
        User currentUser = userRepository.findByEmailWithRole(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + userEmail));

        Ticket ticket = ticketRepository.findById(request.getTicketId())
                .orElseThrow(() -> new EntityNotFoundException("Ticket not found: " + request.getTicketId()));

        checkTicketAccess(ticket, currentUser);

        Comment comment = new Comment();
        comment.setTicket(ticket);
        comment.setUser(currentUser);
        comment.setContent(request.getContent());

        comment = commentRepository.save(comment);

        CommentResponse response = mapToResponse(comment);
        return ApiResponse.success("Comment added successfully", response);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<CommentResponse>> getCommentsByTicket(Long ticketId, String userEmail) {
        User currentUser = userRepository.findByEmailWithRole(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + userEmail));

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new EntityNotFoundException("Ticket not found: " + ticketId));

        checkTicketAccess(ticket, currentUser);

        List<CommentResponse> comments = commentRepository.findByTicketIdAndActiveTrueOrderByCreatedAtAsc(ticketId)
                .stream()
                .map(this::mapToResponse)
                .toList();

        return ApiResponse.success("Comments fetched successfully", comments);
    }

    private CommentResponse mapToResponse(Comment comment) {
        CommentResponse res = new CommentResponse();
        res.setId(comment.getId());
        res.setTicketId(comment.getTicket().getId());
        res.setUserId(comment.getUser().getId());
        res.setUserName(comment.getUser().getFirstName() + " " + (comment.getUser().getLastName() != null ? comment.getUser().getLastName() : ""));
        res.setUserRole(comment.getUser().getRole().getName());
        res.setContent(comment.getContent());
        res.setCreatedAt(comment.getCreatedAt());
        return res;
    }
}
