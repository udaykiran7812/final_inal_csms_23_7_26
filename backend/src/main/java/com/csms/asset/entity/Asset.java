package com.csms.asset.entity;

import com.csms.common.entity.BaseEntity;
import com.csms.department.entity.Department;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "assets")
@Getter
@Setter
@NoArgsConstructor
public class Asset extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(name = "asset_tag", nullable = false, unique = true, length = 100)
    private String assetTag;

    @Column(nullable = false, length = 100)
    private String type;

    @Column(nullable = false)
    private String location;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(nullable = false, length = 50)
    private String status;
}
