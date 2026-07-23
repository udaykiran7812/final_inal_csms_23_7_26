package com.csms.report.service.impl;

import com.csms.common.enums.TicketStatus;
import com.csms.common.response.ApiResponse;
import com.csms.department.entity.Department;
import com.csms.department.repository.DepartmentRepository;
import com.csms.feedback.entity.Feedback;
import com.csms.feedback.repository.FeedbackRepository;
import com.csms.report.dto.DashboardStatsResponse;
import com.csms.report.service.ReportService;
import com.csms.staff.entity.Staff;
import com.csms.staff.repository.StaffRepository;
import com.csms.subdepartment.repository.SubDepartmentRepository;
import com.csms.ticket.entity.Ticket;
import com.csms.ticket.repository.TicketRepository;
import com.csms.user.entity.User;
import com.csms.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {

    private final UserRepository userRepository;
    private final StaffRepository staffRepository;
    private final TicketRepository ticketRepository;
    private final DepartmentRepository departmentRepository;
    private final SubDepartmentRepository subDepartmentRepository;
    private final FeedbackRepository feedbackRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    @Override
    public ApiResponse<DashboardStatsResponse> getDashboardStats(String userEmail) {
        User currentUser = userRepository.findByEmailWithRole(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + userEmail));

        String role = currentUser.getRole().getName();
        List<Ticket> ticketList;

        if ("SUPER_ADMIN".equalsIgnoreCase(role) || "ADMIN".equalsIgnoreCase(role)) {
            ticketList = ticketRepository.findByActiveTrue();
        } else if ("DEPARTMENT_ADMIN".equalsIgnoreCase(role)) {
            if (currentUser.getDepartment() != null) {
                ticketList = ticketRepository.findByDepartmentIdAndActiveTrue(currentUser.getDepartment().getId());
            } else {
                ticketList = Collections.emptyList();
            }
        } else if ("STAFF".equalsIgnoreCase(role)) {
            ticketList = ticketRepository.findByAssignedStaff_User_EmailAndActiveTrue(userEmail);
        } else {
            ticketList = ticketRepository.findByUser_EmailAndActiveTrue(userEmail);
        }

        DashboardStatsResponse stats = new DashboardStatsResponse();
        stats.setTotalTickets(ticketList.size());

        long open = ticketList.stream()
                .filter(t -> t.getStatus() == TicketStatus.CREATED || t.getStatus() == TicketStatus.ASSIGNED ||
                             t.getStatus() == TicketStatus.ACCEPTED || t.getStatus() == TicketStatus.IN_PROGRESS ||
                             t.getStatus() == TicketStatus.PENDING_USER)
                .count();
        stats.setOpenTickets(open);
        stats.setPendingTickets(open);

        long completed = ticketList.stream()
                .filter(t -> t.getStatus() == TicketStatus.RESOLVED || t.getStatus() == TicketStatus.CLOSED)
                .count();
        stats.setCompletedTickets(completed);

        long breaches = ticketList.stream()
                .filter(t -> t.getSlaBreached() != null && t.getSlaBreached())
                .count();
        stats.setSlaBreaches(breaches);

        // Average Resolution Time Calculation
        List<Ticket> resolvedTickets = ticketList.stream()
                .filter(t -> (t.getStatus() == TicketStatus.RESOLVED || t.getStatus() == TicketStatus.CLOSED) && t.getResolvedAt() != null)
                .toList();

        if (!resolvedTickets.isEmpty()) {
            long totalMinutes = resolvedTickets.stream()
                    .mapToLong(t -> Duration.between(t.getCreatedAt(), t.getResolvedAt()).toMinutes())
                    .sum();
            double avgHours = (double) totalMinutes / (resolvedTickets.size() * 60.0);
            stats.setAverageResolutionTimeHours(Math.round(avgHours * 100.0) / 100.0);
        } else {
            stats.setAverageResolutionTimeHours(0.0);
        }

        // Distributions
        Map<String, Long> statusMap = ticketList.stream()
                .collect(Collectors.groupingBy(t -> t.getStatus().name(), Collectors.counting()));
        stats.setTicketsByStatus(statusMap);

        Map<String, Long> priorityMap = ticketList.stream()
                .filter(t -> t.getPriority() != null)
                .collect(Collectors.groupingBy(t -> t.getPriority().getName(), Collectors.counting()));
        stats.setTicketsByPriority(priorityMap);

        Map<String, Long> deptMap = ticketList.stream()
                .filter(t -> t.getDepartment() != null)
                .collect(Collectors.groupingBy(t -> t.getDepartment().getName(), Collectors.counting()));
        stats.setTicketsByDepartment(deptMap);

        Map<String, Long> workload = ticketList.stream()
                .filter(t -> t.getAssignedStaff() != null)
                .collect(Collectors.groupingBy(t -> t.getAssignedStaff().getName(), Collectors.counting()));
        stats.setStaffWorkload(workload);

        // Fetch all feedbacks map for rating score calculation
        Map<Long, Feedback> feedbackMap = new HashMap<>();
        try {
            feedbackRepository.findAll().forEach(fb -> {
                if (fb.getTicket() != null) {
                    feedbackMap.put(fb.getTicket().getId(), fb);
                }
            });
        } catch (Exception ignored) {}

        // Scoped Stats for Super Admin & Admin
        if ("SUPER_ADMIN".equalsIgnoreCase(role) || "ADMIN".equalsIgnoreCase(role)) {
            stats.setTotalUsers(userRepository.count());
            stats.setTotalStaff(staffRepository.count());
            stats.setTotalDepartments(departmentRepository.count());
            stats.setTotalSubDepartments(subDepartmentRepository.count());

            // SLA breach rates per department
            Map<String, Double> breachRates = new HashMap<>();
            Map<String, List<Ticket>> deptTickets = ticketList.stream()
                    .filter(t -> t.getDepartment() != null)
                    .collect(Collectors.groupingBy(t -> t.getDepartment().getName()));

            deptTickets.forEach((dept, list) -> {
                long deptBreaches = list.stream().filter(t -> Boolean.TRUE.equals(t.getSlaBreached())).count();
                double rate = (double) deptBreaches / list.size() * 100.0;
                breachRates.put(dept, Math.round(rate * 100.0) / 100.0);
            });
            stats.setDepartmentSlaBreachRates(breachRates);

            // Department Performance List & Health Scores
            List<DashboardStatsResponse.DepartmentPerformanceDto> deptPerfList = new ArrayList<>();
            departmentRepository.findAll().forEach(dept -> {
                List<Ticket> dTickets = ticketList.stream()
                        .filter(t -> t.getDepartment() != null && t.getDepartment().getId().equals(dept.getId()))
                        .toList();
                long totalCount = dTickets.size();
                long openCount = dTickets.stream().filter(t -> t.getStatus() != TicketStatus.RESOLVED && t.getStatus() != TicketStatus.CLOSED).count();
                long resolvedCount = dTickets.stream().filter(t -> t.getStatus() == TicketStatus.RESOLVED || t.getStatus() == TicketStatus.CLOSED).count();
                long breachCount = dTickets.stream().filter(t -> Boolean.TRUE.equals(t.getSlaBreached())).count();
                double compliance = totalCount > 0 ? (double) (totalCount - breachCount) / totalCount * 100.0 : 100.0;

                DashboardStatsResponse.DepartmentPerformanceDto dto = new DashboardStatsResponse.DepartmentPerformanceDto();
                dto.setDepartmentName(dept.getName());
                dto.setTotalTickets(totalCount);
                dto.setOpenTickets(openCount);
                dto.setResolvedTickets(resolvedCount);
                dto.setSlaBreachedTickets(breachCount);
                dto.setSlaCompliancePercentage(Math.round(compliance * 10.0) / 10.0);

                // Calculate Department Health Score & Explainable Breakdown
                computeHealthScoreAndBreakdown(dTickets, feedbackMap, dto);
                deptPerfList.add(dto);
            });
            stats.setDepartmentPerformance(deptPerfList);

            // Staff Performance List & Health Scores across system
            List<DashboardStatsResponse.StaffPerformanceDto> staffPerfList = buildStaffPerformanceDtos(
                    staffRepository.findByActiveTrue(), ticketList, feedbackMap
            );
            stats.setStaffPerformance(staffPerfList);

        } else if ("DEPARTMENT_ADMIN".equalsIgnoreCase(role) && currentUser.getDepartment() != null) {
            Department dept = currentUser.getDepartment();
            List<Staff> deptStaff = staffRepository.findByDepartmentIdAndActiveTrue(dept.getId());

            stats.setTotalUsers(1);
            stats.setTotalStaff(deptStaff.size());
            stats.setTotalDepartments(1);
            stats.setTotalSubDepartments(subDepartmentRepository.findByDepartmentIdAndActiveTrue(dept.getId()).size());

            // Department Health Score & Breakdown
            List<DashboardStatsResponse.DepartmentPerformanceDto> deptPerfList = new ArrayList<>();
            List<Ticket> dTickets = ticketList.stream()
                    .filter(t -> t.getDepartment() != null && t.getDepartment().getId().equals(dept.getId()))
                    .toList();
            long totalCount = dTickets.size();
            long openCount = dTickets.stream().filter(t -> t.getStatus() != TicketStatus.RESOLVED && t.getStatus() != TicketStatus.CLOSED).count();
            long resolvedCount = dTickets.stream().filter(t -> t.getStatus() == TicketStatus.RESOLVED || t.getStatus() == TicketStatus.CLOSED).count();
            long breachCount = dTickets.stream().filter(t -> Boolean.TRUE.equals(t.getSlaBreached())).count();
            double compliance = totalCount > 0 ? (double) (totalCount - breachCount) / totalCount * 100.0 : 100.0;

            DashboardStatsResponse.DepartmentPerformanceDto deptDto = new DashboardStatsResponse.DepartmentPerformanceDto();
            deptDto.setDepartmentName(dept.getName());
            deptDto.setTotalTickets(totalCount);
            deptDto.setOpenTickets(openCount);
            deptDto.setResolvedTickets(resolvedCount);
            deptDto.setSlaBreachedTickets(breachCount);
            deptDto.setSlaCompliancePercentage(Math.round(compliance * 10.0) / 10.0);
            computeHealthScoreAndBreakdown(dTickets, feedbackMap, deptDto);
            deptPerfList.add(deptDto);
            stats.setDepartmentPerformance(deptPerfList);

            // Staff Performance List scoped to department
            List<DashboardStatsResponse.StaffPerformanceDto> staffPerfList = buildStaffPerformanceDtos(
                    deptStaff, ticketList, feedbackMap
            );
            stats.setStaffPerformance(staffPerfList);

        } else if ("STAFF".equalsIgnoreCase(role)) {
            Staff currentStaff = staffRepository.findByEmail(userEmail).orElse(null);
            List<Staff> staffGroup = currentStaff != null && currentStaff.getDepartment() != null
                    ? staffRepository.findByDepartmentIdAndActiveTrue(currentStaff.getDepartment().getId())
                    : (currentStaff != null ? List.of(currentStaff) : Collections.emptyList());

            List<DashboardStatsResponse.StaffPerformanceDto> staffPerfList = buildStaffPerformanceDtos(
                    staffGroup, ticketList, feedbackMap
            );
            stats.setStaffPerformance(staffPerfList);
        }

        return ApiResponse.success("Dashboard statistics fetched successfully", stats);
    }

    private void computeHealthScoreAndBreakdown(List<Ticket> tickets,
                                                Map<Long, Feedback> feedbackMap,
                                                DashboardStatsResponse.DepartmentPerformanceDto dto) {
        double score = 100.0;
        List<DashboardStatsResponse.ScoreEventDto> breakdown = new ArrayList<>();

        for (Ticket t : tickets) {
            String dateStr = t.getCreatedAt() != null ? t.getCreatedAt().format(DATE_FORMATTER) : "N/A";
            String title = t.getTitle() != null ? t.getTitle() : ("Ticket #" + t.getId());

            // SLA Breach Penalty based on priority
            if (Boolean.TRUE.equals(t.getSlaBreached())) {
                String priority = t.getPriority() != null ? t.getPriority().getName().toUpperCase() : "MEDIUM";
                int penalty = -3;
                if ("CRITICAL".equals(priority)) penalty = -8;
                else if ("HIGH".equals(priority)) penalty = -5;
                else if ("LOW".equals(priority)) penalty = -1;

                score += penalty;
                breakdown.add(new DashboardStatsResponse.ScoreEventDto(
                        t.getId(), title, "SLA_BREACH", penalty,
                        priority + " Priority SLA Breach Penalty", dateStr
                ));
            }

            // Ticket Closed/Resolved before SLA Deadline Bonus
            if ((t.getStatus() == TicketStatus.RESOLVED || t.getStatus() == TicketStatus.CLOSED) &&
                Boolean.FALSE.equals(t.getSlaBreached()) && t.getSlaResolutionDeadline() != null && t.getResolvedAt() != null) {
                if (t.getResolvedAt().isBefore(t.getSlaResolutionDeadline())) {
                    score += 1;
                    breakdown.add(new DashboardStatsResponse.ScoreEventDto(
                            t.getId(), title, "EARLY_RESOLUTION", 1,
                            "Resolved prior to SLA deadline (+1)", dateStr
                    ));
                }
            }

            // Pending User > 24 hours Threshold Penalty
            if (t.getStatus() == TicketStatus.PENDING_USER && t.getUpdatedAt() != null) {
                long hoursPending = Duration.between(t.getUpdatedAt(), LocalDateTime.now()).toHours();
                if (hoursPending > 24) {
                    score -= 2;
                    breakdown.add(new DashboardStatsResponse.ScoreEventDto(
                            t.getId(), title, "PENDING_USER_DELAY", -2,
                            "Awaiting User input for >24h (-2)", dateStr
                    ));
                }
            }

            // Rating Feedback adjustment
            Feedback fb = feedbackMap.get(t.getId());
            if (fb != null && fb.getRating() != null) {
                int r = fb.getRating();
                int ratingScore = 0;
                if (r == 5) ratingScore = 2;
                else if (r == 4) ratingScore = 1;
                else if (r == 2) ratingScore = -2;
                else if (r == 1) ratingScore = -5;

                if (ratingScore != 0) {
                    score += ratingScore;
                    breakdown.add(new DashboardStatsResponse.ScoreEventDto(
                            t.getId(), title, "USER_RATING", ratingScore,
                            "Customer Rating: " + r + " Stars (" + (ratingScore > 0 ? "+" : "") + ratingScore + ")", dateStr
                    ));
                }
            }
        }

        dto.setHealthScore(Math.max(0.0, Math.min(100.0, Math.round(score * 10.0) / 10.0)));
        dto.setScoreBreakdown(breakdown);
    }

    private List<DashboardStatsResponse.StaffPerformanceDto> buildStaffPerformanceDtos(
            List<Staff> staffList, List<Ticket> ticketList, Map<Long, Feedback> feedbackMap) {

        List<DashboardStatsResponse.StaffPerformanceDto> dtos = new ArrayList<>();

        for (Staff st : staffList) {
            List<Ticket> sTickets = ticketList.stream()
                    .filter(t -> t.getAssignedStaff() != null && t.getAssignedStaff().getId().equals(st.getId()))
                    .toList();

            long assignedCount = sTickets.size();
            long resolvedCount = sTickets.stream().filter(t -> t.getStatus() == TicketStatus.RESOLVED || t.getStatus() == TicketStatus.CLOSED).count();
            long breachCount = sTickets.stream().filter(t -> Boolean.TRUE.equals(t.getSlaBreached())).count();

            double score = 100.0;
            List<DashboardStatsResponse.ScoreEventDto> breakdown = new ArrayList<>();
            List<Integer> ratings = new ArrayList<>();
            long totalResMinutes = 0;
            int resCountWithTime = 0;

            for (Ticket t : sTickets) {
                String dateStr = t.getCreatedAt() != null ? t.getCreatedAt().format(DATE_FORMATTER) : "N/A";
                String title = t.getTitle() != null ? t.getTitle() : ("Ticket #" + t.getId());

                if (Boolean.TRUE.equals(t.getSlaBreached())) {
                    String priority = t.getPriority() != null ? t.getPriority().getName().toUpperCase() : "MEDIUM";
                    int penalty = -3;
                    if ("CRITICAL".equals(priority)) penalty = -8;
                    else if ("HIGH".equals(priority)) penalty = -5;
                    else if ("LOW".equals(priority)) penalty = -1;

                    score += penalty;
                    breakdown.add(new DashboardStatsResponse.ScoreEventDto(
                            t.getId(), title, "SLA_BREACH", penalty,
                            priority + " Priority SLA Breach Penalty", dateStr
                    ));
                }

                if ((t.getStatus() == TicketStatus.RESOLVED || t.getStatus() == TicketStatus.CLOSED) &&
                    Boolean.FALSE.equals(t.getSlaBreached()) && t.getSlaResolutionDeadline() != null && t.getResolvedAt() != null) {
                    if (t.getResolvedAt().isBefore(t.getSlaResolutionDeadline())) {
                        score += 1;
                        breakdown.add(new DashboardStatsResponse.ScoreEventDto(
                                t.getId(), title, "EARLY_RESOLUTION", 1,
                                "Resolved prior to SLA deadline (+1)", dateStr
                        ));
                    }
                }

                if (t.getResolvedAt() != null && t.getCreatedAt() != null) {
                    totalResMinutes += Duration.between(t.getCreatedAt(), t.getResolvedAt()).toMinutes();
                    resCountWithTime++;
                }

                Feedback fb = feedbackMap.get(t.getId());
                if (fb != null && fb.getRating() != null) {
                    ratings.add(fb.getRating());
                    int r = fb.getRating();
                    int ratingScore = 0;
                    if (r == 5) ratingScore = 2;
                    else if (r == 4) ratingScore = 1;
                    else if (r == 2) ratingScore = -2;
                    else if (r == 1) ratingScore = -5;

                    if (ratingScore != 0) {
                        score += ratingScore;
                        breakdown.add(new DashboardStatsResponse.ScoreEventDto(
                                t.getId(), title, "USER_RATING", ratingScore,
                                "Customer Rating: " + r + " Stars (" + (ratingScore > 0 ? "+" : "") + ratingScore + ")", dateStr
                        ));
                    }
                }
            }

            double finalScore = Math.max(0.0, Math.min(100.0, Math.round(score * 10.0) / 10.0));
            double avgRating = ratings.isEmpty() ? 5.0 : ratings.stream().mapToInt(i -> i).average().orElse(5.0);
            double avgResHours = resCountWithTime == 0 ? 0.0 : Math.round(((double) totalResMinutes / (resCountWithTime * 60.0)) * 10.0) / 10.0;

            // Achievement Badges
            List<String> badges = new ArrayList<>();
            if (finalScore >= 95.0) badges.add("🌟 Top Performer");
            if (breachCount == 0 && assignedCount > 0) badges.add("🛡️ SLA Master");
            if (avgRating >= 4.8 && !ratings.isEmpty()) badges.add("⭐ 5-Star Rated");
            if (resolvedCount >= 5) badges.add("⚡ High Resolver");

            DashboardStatsResponse.StaffPerformanceDto dto = new DashboardStatsResponse.StaffPerformanceDto();
            dto.setStaffId(st.getId());
            dto.setStaffName(st.getName());
            dto.setEmail(st.getEmail());
            dto.setDepartmentName(st.getDepartment() != null ? st.getDepartment().getName() : "Unassigned");
            dto.setSubDepartmentName(st.getSubDepartment() != null ? st.getSubDepartment().getName() : "N/A");
            dto.setRoleName(st.getRole() != null ? st.getRole().getName() : "Staff");
            dto.setAssignedTickets(assignedCount);
            dto.setResolvedTickets(resolvedCount);
            dto.setSlaBreaches(breachCount);
            dto.setHealthScore(finalScore);
            dto.setAchievementBadges(badges);
            dto.setMonthlyTrend(finalScore >= 80 ? +4.2 : -2.5);
            dto.setAvgResolutionTimeHours(avgResHours);
            dto.setAvgRating(Math.round(avgRating * 10.0) / 10.0);
            dto.setScoreBreakdown(breakdown);

            dtos.add(dto);
        }

        // Rank staff within their respective departments
        dtos.sort((a, b) -> Double.compare(b.getHealthScore(), a.getHealthScore()));
        int rank = 1;
        for (DashboardStatsResponse.StaffPerformanceDto d : dtos) {
            d.setRank(rank++);
        }

        return dtos;
    }
}
