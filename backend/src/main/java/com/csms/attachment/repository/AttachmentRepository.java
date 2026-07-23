package com.csms.attachment.repository;

import com.csms.attachment.entity.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AttachmentRepository extends JpaRepository<Attachment, Long> {

    List<Attachment> findByTicketIdAndActiveTrue(Long ticketId);
}
