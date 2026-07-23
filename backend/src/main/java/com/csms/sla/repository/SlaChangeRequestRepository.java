package com.csms.sla.repository;

import com.csms.sla.entity.SlaChangeRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SlaChangeRequestRepository extends JpaRepository<SlaChangeRequest, Long> {
    List<SlaChangeRequest> findByActiveTrueOrderByCreatedAtDesc();
    List<SlaChangeRequest> findByRequester_IdAndActiveTrueOrderByCreatedAtDesc(Long requesterId);
}
