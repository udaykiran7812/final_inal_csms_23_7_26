package com.csms.issuecategory.entity;

import com.csms.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "issue_categories")
@Getter
@Setter
@NoArgsConstructor
public class IssueCategory extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String name;

    @Column(length = 500)
    private String description;
}