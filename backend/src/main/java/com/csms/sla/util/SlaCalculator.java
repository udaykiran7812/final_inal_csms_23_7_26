package com.csms.sla.util;

import com.csms.calendar.entity.BusinessHours;
import com.csms.calendar.entity.Holiday;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class SlaCalculator {

    public LocalDateTime calculateDeadline(LocalDateTime startDateTime, int limitMinutes, List<BusinessHours> bizHours, List<Holiday> holidays) {
        // Calculate exact SLA deadline in minutes as configured by Super Admin (e.g. 120m = 2h, 1440m = 24h)
        return startDateTime.plusMinutes(limitMinutes);
    }
}
