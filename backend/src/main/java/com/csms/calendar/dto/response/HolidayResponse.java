package com.csms.calendar.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class HolidayResponse {

    private Long id;
    private LocalDate holidayDate;
    private String name;
    private boolean active;
}
