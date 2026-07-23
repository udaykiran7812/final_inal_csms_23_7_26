package com.csms.feedback.repository;

import com.csms.feedback.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    Optional<Feedback> findByTicketId(Long ticketId);
}
