package com.csms.calendar.repository;

import com.csms.calendar.entity.Holiday;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface HolidayRepository extends JpaRepository<Holiday, Long> {

    Optional<Holiday> findByHolidayDateAndActiveTrue(LocalDate date);

    List<Holiday> findByActiveTrue();

    List<Holiday> findByActiveTrueOrderByHolidayDateAsc();
}
