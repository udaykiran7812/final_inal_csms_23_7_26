package com.csms.ticket.repository;

import com.csms.common.enums.TicketStatus;
import com.csms.ticket.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findByActiveTrue();

    List<Ticket> findByDepartmentIdAndActiveTrue(Long departmentId);

    List<Ticket> findByAssignedStaff_User_EmailAndActiveTrue(String email);

    List<Ticket> findByUser_EmailAndActiveTrue(String email);

    List<Ticket> findByActiveTrueAndStatusNotIn(List<TicketStatus> statuses);

    long countByAssignedStaff_IdAndActiveTrueAndStatusNotIn(Long staffId, List<TicketStatus> statuses);

    List<Ticket> findByAssetIdAndActiveTrue(Long assetId);
}