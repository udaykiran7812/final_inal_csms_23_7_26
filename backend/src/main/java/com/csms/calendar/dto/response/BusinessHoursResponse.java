package com.csms.calendar.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalTime;

@Getter
@Setter
public class BusinessHoursResponse {

    private Long id;
    private Integer dayOfWeek;
    private String dayName;
    private LocalTime startTime;
    private LocalTime endTime;
    private boolean active;
}
