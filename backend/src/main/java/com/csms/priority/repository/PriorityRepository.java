package com.csms.priority.repository;

import com.csms.priority.entity.Priority;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PriorityRepository extends JpaRepository<Priority, Long> {

    Optional<Priority> findByName(String name);

    List<Priority> findByActiveTrueOrderByIdAsc();
}
