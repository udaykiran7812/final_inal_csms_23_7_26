package com.csms.feedback.service.impl;

import com.csms.common.enums.TicketStatus;
import com.csms.common.response.ApiResponse;
import com.csms.feedback.dto.FeedbackResponse;
import com.csms.feedback.dto.CreateFeedbackRequest;
import com.csms.feedback.entity.Feedback;
import com.csms.feedback.repository.FeedbackRepository;
import com.csms.feedback.service.FeedbackService;
import com.csms.ticket.entity.Ticket;
import com.csms.ticket.repository.TicketRepository;
import com.csms.user.entity.User;
import com.csms.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class FeedbackServiceImpl implements FeedbackService {

    private final FeedbackRepository feedbackRepository;
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
    public ApiResponse<FeedbackResponse> submitFeedback(CreateFeedbackRequest request, String userEmail) {
        User currentUser = userRepository.findByEmailWithRole(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + userEmail));

        Ticket ticket = ticketRepository.findById(request.getTicketId())
                .orElseThrow(() -> new EntityNotFoundException("Ticket not found: " + request.getTicketId()));

        checkTicketAccess(ticket, currentUser);

        if (ticket.getStatus() != TicketStatus.RESOLVED && ticket.getStatus() != TicketStatus.CLOSED) {
            throw new IllegalArgumentException("Feedback can only be submitted for RESOLVED or CLOSED tickets.");
        }

        if (feedbackRepository.findByTicketId(request.getTicketId()).isPresent()) {
            throw new IllegalArgumentException("Feedback has already been submitted for this ticket.");
        }

        Feedback feedback = new Feedback();
        feedback.setTicket(ticket);
        feedback.setUser(currentUser);
        feedback.setRating(request.getRating());
        feedback.setComments(request.getComments());

        feedback = feedbackRepository.save(feedback);

        return ApiResponse.success("Feedback submitted successfully", mapToResponse(feedback));
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<FeedbackResponse> getFeedbackByTicket(Long ticketId, String userEmail) {
        User currentUser = userRepository.findByEmailWithRole(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + userEmail));

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new EntityNotFoundException("Ticket not found: " + ticketId));

        checkTicketAccess(ticket, currentUser);

        Feedback feedback = feedbackRepository.findByTicketId(ticketId)
                .orElseThrow(() -> new EntityNotFoundException("Feedback not found for ticket: " + ticketId));

        return ApiResponse.success("Feedback fetched successfully", mapToResponse(feedback));
    }

    private FeedbackResponse mapToResponse(Feedback feedback) {
        FeedbackResponse res = new FeedbackResponse();
        res.setId(feedback.getId());
        res.setTicketId(feedback.getTicket().getId());
        res.setUserId(feedback.getUser().getId());
        res.setUserName(feedback.getUser().getFirstName() + " " + (feedback.getUser().getLastName() != null ? feedback.getUser().getLastName() : ""));
        res.setRating(feedback.getRating());
        res.setComments(feedback.getComments());
        res.setCreatedAt(feedback.getCreatedAt());
        return res;
    }
}
