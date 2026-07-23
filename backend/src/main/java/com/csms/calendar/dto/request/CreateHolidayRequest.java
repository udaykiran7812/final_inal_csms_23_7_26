package com.csms.calendar.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class CreateHolidayRequest {

    @NotNull(message = "Holiday date is required")
    private LocalDate holidayDate;

    @NotBlank(message = "Holiday name is required")
    private String name;
}
