package com.csms.report.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Getter
@Setter
public class DashboardStatsResponse {
    private long totalUsers;
    private long totalStaff;
    private long totalDepartments;
    private long totalSubDepartments;
    private long totalTickets;
    private long openTickets;
    private long pendingTickets;
    private long completedTickets;
    private long slaBreaches;
    private double averageResolutionTimeHours;

    private Map<String, Long> ticketsByStatus;
    private Map<String, Long> ticketsByPriority;
    private Map<String, Long> ticketsByDepartment;
    private Map<String, Long> staffWorkload;
    private Map<String, Double> departmentSlaBreachRates;

    private List<DepartmentPerformanceDto> departmentPerformance;
    private List<StaffPerformanceDto> staffPerformance;

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ScoreEventDto {
        private Long ticketId;
        private String ticketTitle;
        private String eventType;
        private int points; // e.g. -8, -5, +2, +1
        private String reason;
        private String timestamp;

        public Long getTicketId() { return ticketId; }
        public void setTicketId(Long ticketId) { this.ticketId = ticketId; }
        public String getTicketTitle() { return ticketTitle; }
        public void setTicketTitle(String ticketTitle) { this.ticketTitle = ticketTitle; }
        public String getEventType() { return eventType; }
        public void setEventType(String eventType) { this.eventType = eventType; }
        public int getPoints() { return points; }
        public void setPoints(int points) { this.points = points; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
        public String getTimestamp() { return timestamp; }
        public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
    }

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DepartmentPerformanceDto {
        private String departmentName;
        private long totalTickets;
        private long openTickets;
        private long resolvedTickets;
        private long slaBreachedTickets;
        private double slaCompliancePercentage;
        private double healthScore; // 0.0 to 100.0
        private List<ScoreEventDto> scoreBreakdown = new ArrayList<>();

        public String getDepartmentName() { return departmentName; }
        public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }
        public long getTotalTickets() { return totalTickets; }
        public void setTotalTickets(long totalTickets) { this.totalTickets = totalTickets; }
        public long getOpenTickets() { return openTickets; }
        public void setOpenTickets(long openTickets) { this.openTickets = openTickets; }
        public long getResolvedTickets() { return resolvedTickets; }
        public void setResolvedTickets(long resolvedTickets) { this.resolvedTickets = resolvedTickets; }
        public long getSlaBreachedTickets() { return slaBreachedTickets; }
        public void setSlaBreachedTickets(long slaBreachedTickets) { this.slaBreachedTickets = slaBreachedTickets; }
        public double getSlaCompliancePercentage() { return slaCompliancePercentage; }
        public void setSlaCompliancePercentage(double slaCompliancePercentage) { this.slaCompliancePercentage = slaCompliancePercentage; }
        public double getHealthScore() { return healthScore; }
        public void setHealthScore(double healthScore) { this.healthScore = healthScore; }
        public List<ScoreEventDto> getScoreBreakdown() { return scoreBreakdown; }
        public void setScoreBreakdown(List<ScoreEventDto> scoreBreakdown) { this.scoreBreakdown = scoreBreakdown; }
    }

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class StaffPerformanceDto {
        private Long staffId;
        private String staffName;
        private String email;
        private String departmentName;
        private String subDepartmentName;
        private String roleName;
        private long assignedTickets;
        private long resolvedTickets;
        private long slaBreaches;
        private double healthScore; // 0.0 to 100.0
        private int rank;
        private List<String> achievementBadges = new ArrayList<>();
        private double monthlyTrend;
        private double avgResolutionTimeHours;
        private double avgRating;
        private List<ScoreEventDto> scoreBreakdown = new ArrayList<>();

        public Long getStaffId() { return staffId; }
        public void setStaffId(Long staffId) { this.staffId = staffId; }
        public String getStaffName() { return staffName; }
        public void setStaffName(String staffName) { this.staffName = staffName; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getDepartmentName() { return departmentName; }
        public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }
        public String getSubDepartmentName() { return subDepartmentName; }
        public void setSubDepartmentName(String subDepartmentName) { this.subDepartmentName = subDepartmentName; }
        public String getRoleName() { return roleName; }
        public void setRoleName(String roleName) { this.roleName = roleName; }
        public long getAssignedTickets() { return assignedTickets; }
        public void setAssignedTickets(long assignedTickets) { this.assignedTickets = assignedTickets; }
        public long getResolvedTickets() { return resolvedTickets; }
        public void setResolvedTickets(long resolvedTickets) { this.resolvedTickets = resolvedTickets; }
        public long getSlaBreaches() { return slaBreaches; }
        public void setSlaBreaches(long slaBreaches) { this.slaBreaches = slaBreaches; }
        public double getHealthScore() { return healthScore; }
        public void setHealthScore(double healthScore) { this.healthScore = healthScore; }
        public int getRank() { return rank; }
        public void setRank(int rank) { this.rank = rank; }
        public List<String> getAchievementBadges() { return achievementBadges; }
        public void setAchievementBadges(List<String> achievementBadges) { this.achievementBadges = achievementBadges; }
        public double getMonthlyTrend() { return monthlyTrend; }
        public void setMonthlyTrend(double monthlyTrend) { this.monthlyTrend = monthlyTrend; }
        public double getAvgResolutionTimeHours() { return avgResolutionTimeHours; }
        public void setAvgResolutionTimeHours(double avgResolutionTimeHours) { this.avgResolutionTimeHours = avgResolutionTimeHours; }
        public double getAvgRating() { return avgRating; }
        public void setAvgRating(double avgRating) { this.avgRating = avgRating; }
        public List<ScoreEventDto> getScoreBreakdown() { return scoreBreakdown; }
        public void setScoreBreakdown(List<ScoreEventDto> scoreBreakdown) { this.scoreBreakdown = scoreBreakdown; }
    }
}
