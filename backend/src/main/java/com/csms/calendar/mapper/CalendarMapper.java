package com.csms.calendar.mapper;

import com.csms.calendar.dto.response.BusinessHoursResponse;
import com.csms.calendar.dto.response.HolidayResponse;
import com.csms.calendar.entity.BusinessHours;
import com.csms.calendar.entity.Holiday;
import org.springframework.stereotype.Component;

import java.time.DayOfWeek;
import java.time.format.TextStyle;
import java.util.Locale;

@Component
public class CalendarMapper {

    private static final DayOfWeek[] DAYS = DayOfWeek.values(); // MONDAY=0 ... SUNDAY=6

    public BusinessHoursResponse toResponse(BusinessHours hours) {

        BusinessHoursResponse response = new BusinessHoursResponse();

        response.setId(hours.getId());
        response.setDayOfWeek(hours.getDayOfWeek());
        response.setDayName(dayName(hours.getDayOfWeek()));
        response.setStartTime(hours.getStartTime());
        response.setEndTime(hours.getEndTime());
        response.setActive(hours.getActive());

        return response;
    }

    public HolidayResponse toResponse(Holiday holiday) {

        HolidayResponse response = new HolidayResponse();

        response.setId(holiday.getId());
        response.setHolidayDate(holiday.getHolidayDate());
        response.setName(holiday.getName());
        response.setActive(holiday.getActive());

        return response;
    }

    private String dayName(Integer dayOfWeek) {
        if (dayOfWeek == null || dayOfWeek < 1 || dayOfWeek > 7) {
            return null;
        }
        return DAYS[dayOfWeek - 1].getDisplayName(TextStyle.FULL, Locale.ENGLISH);
    }
}
