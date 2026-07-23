package com.csms.calendar.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalTime;

@Getter
@Setter
public class CreateBusinessHoursRequest {

    @NotNull(message = "Day of week is required")
    @Min(value = 1, message = "Day of week must be between 1 (Monday) and 7 (Sunday)")
    @Max(value = 7, message = "Day of week must be between 1 (Monday) and 7 (Sunday)")
    private Integer dayOfWeek;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;
}
