package com.csms.issuecategory.repository;

import com.csms.issuecategory.entity.IssueCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface IssueCategoryRepository extends JpaRepository<IssueCategory, Long> {

    Optional<IssueCategory> findByName(String name);

    List<IssueCategory> findByActiveTrue();
}