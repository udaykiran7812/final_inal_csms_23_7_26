package com.csms.calendar.repository;

import com.csms.calendar.entity.BusinessHours;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BusinessHoursRepository extends JpaRepository<BusinessHours, Long> {

    Optional<BusinessHours> findByDayOfWeekAndActiveTrue(Integer dayOfWeek);

    List<BusinessHours> findByActiveTrue();

    List<BusinessHours> findByActiveTrueOrderByDayOfWeekAsc();
}
